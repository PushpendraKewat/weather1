// Weather App with enhanced features
const apiKey = "e051d92b993a29737de82e7704400596";

// App State
let appState = {
  currentUnit: 'celsius',
  currentWeather: null,
  favorites: JSON.parse(localStorage.getItem('weatherFavorites')) || [],
  recentSearches: JSON.parse(localStorage.getItem('weatherRecentSearches')) || [],
  theme: localStorage.getItem('weatherTheme') || 'dark',
  map: null,
  mapVisible: false,
  hourlyForecastVisible: false
};

// DOM Elements
const elements = {
  cityInput: document.getElementById('cityInput'),
  weatherContainer: document.getElementById('weather'),
  forecastContainer: document.getElementById('forecast'),
  hourlyForecastContainer: document.getElementById('hourly-forecast'),
  alertsContainer: document.getElementById('alerts'),
  spinner: document.getElementById('spinner'),
  themeToggle: document.getElementById('themeToggle'),
  celsiusBtn: document.getElementById('celsiusBtn'),
  fahrenheitBtn: document.getElementById('fahrenheitBtn'),
  favoritesContainer: document.getElementById('favorites'),
  favoritesList: document.getElementById('favoritesList'),
  addFavoriteBtn: document.getElementById('addFavoriteBtn'),
  showMapBtn: document.getElementById('showMapBtn'),
  showHourlyBtn: document.getElementById('showHourlyBtn'),
  mapContainer: document.getElementById('map-container'),
  map: document.getElementById('map'),
  notification: document.getElementById('notification'),
  recentSearchesContainer: document.getElementById('recentSearches'),
  recentList: document.getElementById('recentList')
};

// Initialize the app
function initApp() {
  setTheme(appState.theme);
  renderFavorites();
  renderRecentSearches();
  
  if (appState.favorites.length > 0) {
    elements.favoritesContainer.style.display = 'block';
    getWeather(appState.favorites[0].name);
  } else if (appState.recentSearches.length > 0) {
    getWeather(appState.recentSearches[0].name);
  } else {
    getWeatherByLocation();
  }
}

// Notification system
function showNotification(message, type = 'error', duration = 3000) {
  elements.notification.textContent = message;
  elements.notification.className = `notification ${type}`;
  elements.notification.style.display = 'block';
  
  setTimeout(() => {
    elements.notification.style.display = 'none';
  }, duration);
}

// Theme Functions
function setTheme(theme) {
  document.body.classList.toggle('light-mode', theme === 'light');
  elements.themeToggle.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  appState.theme = theme;
  localStorage.setItem('weatherTheme', theme);
}

// Temperature Unit Functions
function setTemperatureUnit(unit) {
  appState.currentUnit = unit;
  elements.celsiusBtn.classList.toggle('active', unit === 'celsius');
  elements.fahrenheitBtn.classList.toggle('active', unit === 'fahrenheit');
  
  if (appState.currentWeather) {
    displayWeather(appState.currentWeather);
    if (appState.currentWeather.oneCall?.hourly) {
      displayHourlyForecast(appState.currentWeather.oneCall.hourly);
    }
  }
}

function convertTemp(temp) {
  return appState.currentUnit === 'fahrenheit' ? (temp * 9/5) + 32 : temp;
}

// Weather Data Functions
async function getWeather(cityName) {
  const city = cityName || elements.cityInput.value.trim();
  if (!city) {
    showNotification('Please enter a city name');
    return;
  }

  showLoading(true);
  clearWeatherData();

  try {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    const geoRes = await fetch(geoUrl);
    
    if (!geoRes.ok) throw new Error('Failed to fetch location data');
    
    const geoData = await geoRes.json();
    if (!geoData.length) throw new Error('Location not found');
    
    const { lat, lon, name, country } = geoData[0];
    await fetchWeatherData(lat, lon, name, country);
    
    const isFavorite = appState.favorites.some(fav => fav.name.toLowerCase() === name.toLowerCase());
    elements.addFavoriteBtn.style.display = isFavorite ? 'none' : 'block';
  } catch (error) {
    showNotification(error.message);
    console.error('Error fetching weather:', error);
  } finally {
    showLoading(false);
  }
}

async function getWeatherByLocation() {
  if (!navigator.geolocation) {
    showNotification('Geolocation is not supported by your browser');
    return;
  }

  showLoading(true);
  clearWeatherData();

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    
    const { latitude: lat, longitude: lon } = position.coords;
    await fetchWeatherData(lat, lon);
    elements.addFavoriteBtn.style.display = 'block';
  } catch (error) {
    showNotification(`Error getting location: ${error.message}`);
    console.error('Geolocation error:', error);
  } finally {
    showLoading(false);
  }
}

async function fetchWeatherData(lat, lon, cityName, countryCode) {
  try {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${apiKey}&units=metric`;

    const [currentRes, forecastRes, airRes, oneCallRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
      fetch(airUrl),
      fetch(oneCallUrl)
    ]);

    if (!currentRes.ok) throw new Error('Failed to fetch current weather');
    if (!forecastRes.ok) throw new Error('Failed to fetch forecast data');

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();
    const airData = airRes.ok ? await airRes.json() : null;
    const oneCallData = oneCallRes.ok ? await oneCallRes.json() : null;

    const weatherData = {
      current: currentData,
      forecast: forecastData,
      airQuality: airData,
      oneCall: oneCallData,
      location: {
        name: cityName || currentData.name,
        country: countryCode || currentData.sys.country,
        lat,
        lon
      }
    };

    appState.currentWeather = weatherData;
    displayWeather(weatherData);
    setWeatherBackground(currentData.weather[0].main);
    
    initMap(lat, lon);
    elements.showMapBtn.style.display = 'block';
    elements.showHourlyBtn.style.display = 'block';
    
    addToRecentSearches(weatherData.location.name, weatherData.location.country);
    
    if (oneCallData?.hourly) {
      displayHourlyForecast(oneCallData.hourly);
    }
  } catch (error) {
    throw error;
  }
}

function displayWeather(weatherData) {
  const { current, forecast, airQuality, oneCall, location } = weatherData;
  const currentTemp = convertTemp(current.main.temp);
  const feelsLikeTemp = convertTemp(current.main.feels_like);
  const tempUnit = appState.currentUnit === 'celsius' ? '°C' : '°F';
  
  elements.weatherContainer.innerHTML = `
    <div class="current-weather">
      <div class="weather-main">
        <h2>${location.name}, ${location.country}</h2>
        <div class="weather-icon">${getWeatherIcon(current.weather[0].id)}</div>
        <div class="weather-temp">${Math.round(currentTemp)}${tempUnit}</div>
        <div class="weather-desc">${current.weather[0].description}</div>
      </div>
      <div class="weather-details">
        <div class="weather-detail">
          <span class="detail-icon">🌡️</span>
          <span>Feels like: ${Math.round(feelsLikeTemp)}${tempUnit}</span>
        </div>
        <div class="weather-detail">
          <span class="detail-icon">💧</span>
          <span>Humidity: ${current.main.humidity}%</span>
        </div>
        <div class="weather-detail">
          <span class="detail-icon">🌬️</span>
          <span>Wind: ${current.wind.speed} m/s ${getWindDirection(current.wind.deg)}</span>
        </div>
        <div class="weather-detail">
          <span class="detail-icon">⏱️</span>
          <span>Pressure: ${current.main.pressure} hPa</span>
        </div>
        <div class="weather-detail">
          <span class="detail-icon">👁️</span>
          <span>Visibility: ${(current.visibility / 1000).toFixed(1)} km</span>
        </div>
        <div class="weather-detail">
          <span class="detail-icon">☁️</span>
          <span>Clouds: ${current.clouds.all}%</span>
        </div>
        ${airQuality ? `
        <div class="weather-detail">
          <span class="detail-icon">🌫️</span>
          <span>Air Quality: ${getAQIDescription(airQuality.list[0].main.aqi)}</span>
        </div>
        ` : ''}
        <div class="weather-detail">
          <span class="detail-icon">🌅</span>
          <span>Sunrise: ${new Date(current.sys.sunrise * 1000).toLocaleTimeString()}</span>
        </div>
        <div class="weather-detail">
          <span class="detail-icon">🌇</span>
          <span>Sunset: ${new Date(current.sys.sunset * 1000).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  `;

  // 5-Day Forecast
  const dailyForecast = {};
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    if (!dailyForecast[date]) {
      dailyForecast[date] = {
        temps: [],
        conditions: [],
        icons: []
      };
    }
    dailyForecast[date].temps.push(item.main.temp);
    dailyForecast[date].conditions.push(item.weather[0].main);
    dailyForecast[date].icons.push(item.weather[0].id);
  });

  let forecastHTML = '';
  Object.entries(dailyForecast).forEach(([date, data], index) => {
    if (index >= 5) return;
    
    const avgTemp = convertTemp(data.temps.reduce((a, b) => a + b, 0) / data.temps.length);
    const mainCondition = getMostFrequent(data.conditions);
    const mainIcon = getMostFrequent(data.icons);
    
    forecastHTML += `
      <div class="forecast-day">
        <h4>${date}</h4>
        <div class="forecast-icon">${getWeatherIcon(mainIcon)}</div>
        <div class="forecast-temp">${Math.round(avgTemp)}${tempUnit}</div>
        <div class="forecast-desc">${mainCondition}</div>
      </div>
    `;
  });

  elements.forecastContainer.innerHTML = `
    <h3>5-Day Forecast</h3>
    <div class="forecast-container">${forecastHTML}</div>
  `;

  // Alerts
  let alertHTML = '<h3>Weather Alerts</h3>';
  if (oneCall?.alerts?.length > 0) {
    oneCall.alerts.forEach(alert => {
      alertHTML += `
        <div class="alert-box">
          <h4>${alert.event}</h4>
          <p><strong>From:</strong> ${new Date(alert.start * 1000).toLocaleString()}</p>
          <p><strong>To:</strong> ${new Date(alert.end * 1000).toLocaleString()}</p>
          <p>${alert.description}</p>
          <p><em>Source: ${alert.sender_name}</em></p>
        </div>
      `;
    });
  } else {
    alertHTML += '<p>No current weather alerts 🎉</p>';
  }
  elements.alertsContainer.innerHTML = alertHTML;
}

// Recent searches functions
function addToRecentSearches(cityName, countryCode) {
  const existingIndex = appState.recentSearches.findIndex(
    item => item.name.toLowerCase() === cityName.toLowerCase()
  );
  
  if (existingIndex >= 0) {
    const existingItem = appState.recentSearches.splice(existingIndex, 1)[0];
    appState.recentSearches.unshift(existingItem);
  } else {
    appState.recentSearches.unshift({ name: cityName, country: countryCode });
    if (appState.recentSearches.length > 5) {
      appState.recentSearches.pop();
    }
  }
  
  localStorage.setItem('weatherRecentSearches', JSON.stringify(appState.recentSearches));
  renderRecentSearches();
}

function renderRecentSearches() {
  if (appState.recentSearches.length === 0) {
    elements.recentSearchesContainer.style.display = 'none';
    return;
  }

  elements.recentSearchesContainer.style.display = 'block';
  elements.recentList.innerHTML = appState.recentSearches.map(item => `
    <div class="recent-item" onclick="getWeather('${item.name}')" tabindex="0" role="button">
      ${item.name}${item.country ? `, ${item.country}` : ''}
    </div>
  `).join('');
}

// Map functions
function initMap(lat, lon) {
  if (!appState.map) {
    appState.map = L.map(elements.map).setView([lat, lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(appState.map);
  } else {
    appState.map.setView([lat, lon], 10);
  }
  
  if (appState.map.marker) {
    appState.map.removeLayer(appState.map.marker);
  }
  appState.map.marker = L.marker([lat, lon]).addTo(appState.map);
}

function toggleMap() {
  appState.mapVisible = !appState.mapVisible;
  elements.mapContainer.style.display = appState.mapVisible ? 'block' : 'none';
  elements.showMapBtn.innerHTML = appState.mapVisible ? 
    '<i class="fas fa-map"></i> Hide Map' : 
    '<i class="fas fa-map"></i> Show Map';
}

// Hourly forecast functions
function displayHourlyForecast(hourlyData) {
  const tempUnit = appState.currentUnit === 'celsius' ? '°C' : '°F';
  let hourlyHTML = '<h3>24-Hour Forecast</h3><div class="hourly-container">';
  
  hourlyData.slice(0, 24).forEach(hour => {
    const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit' });
    const temp = Math.round(convertTemp(hour.temp));
    const icon = getWeatherIcon(hour.weather[0].id);
    
    hourlyHTML += `
      <div class="hourly-item">
        <div class="hourly-time">${time}</div>
        <div class="hourly-icon">${icon}</div>
        <div class="hourly-temp">${temp}${tempUnit}</div>
        <div class="hourly-pop">${Math.round(hour.pop * 100)}%</div>
      </div>
    `;
  });
  
  hourlyHTML += '</div>';
  elements.hourlyForecastContainer.innerHTML = hourlyHTML;
}

function toggleHourlyForecast() {
  appState.hourlyForecastVisible = !appState.hourlyForecastVisible;
  elements.hourlyForecastContainer.style.display = appState.hourlyForecastVisible ? 'block' : 'none';
  elements.showHourlyBtn.innerHTML = appState.hourlyForecastVisible ? 
    '<i class="fas fa-clock"></i> Hide Hourly' : 
    '<i class="fas fa-clock"></i> Hourly Forecast';
}

// Favorites Functions
function renderFavorites() {
  if (appState.favorites.length === 0) {
    elements.favoritesContainer.style.display = 'none';
    return;
  }

  elements.favoritesContainer.style.display = 'block';
  elements.favoritesList.innerHTML = appState.favorites.map(fav => `
    <div class="favorite-item" onclick="getWeather('${fav.name}')">
      ${fav.name}${fav.country ? `, ${fav.country}` : ''}
    </div>
  `).join('');
}

function addToFavorites() {
  if (!appState.currentWeather) return;

  const { name, country } = appState.currentWeather.location;
  const isAlreadyFavorite = appState.favorites.some(
    fav => fav.name.toLowerCase() === name.toLowerCase()
  );

  if (isAlreadyFavorite) {
    showNotification('This location is already in your favorites');
    return;
  }

  appState.favorites.push({
    name,
    country,
    lat: appState.currentWeather.location.lat,
    lon: appState.currentWeather.location.lon
  });

  localStorage.setItem('weatherFavorites', JSON.stringify(appState.favorites));
  renderFavorites();
  elements.addFavoriteBtn.style.display = 'none';
  showNotification('Location added to favorites!', 'success');
}

// UI Helper Functions
function showLoading(show) {
  elements.spinner.style.display = show ? 'block' : 'none';
}

function clearWeatherData() {
  elements.weatherContainer.innerHTML = '';
  elements.forecastContainer.innerHTML = '';
  elements.alertsContainer.innerHTML = '';
  elements.hourlyForecastContainer.innerHTML = '';
  elements.hourlyForecastContainer.style.display = 'none';
  elements.mapContainer.style.display = 'none';
  elements.addFavoriteBtn.style.display = 'none';
  elements.showMapBtn.style.display = 'none';
  elements.showHourlyBtn.style.display = 'none';
  appState.hourlyForecastVisible = false;
  appState.mapVisible = false;
}

// Weather Helper Functions
function setWeatherBackground(condition) {
  const backgrounds = {
    clear: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    clouds: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    rain: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    snow: 'https://images.unsplash.com/photo-1519408299519-b7a0274f7d67?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    thunderstorm: 'https://images.unsplash.com/photo-1509506489701-dfe23b067808?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    mist: 'https://images.unsplash.com/photo-1504253163759-c23fccaebb55?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    default: 'https://images.unsplash.com/photo-1536514498073-50e69d39c6cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80'
  };

  const lowerCondition = condition.toLowerCase();
  let imageUrl = backgrounds.default;

  if (lowerCondition.includes('clear')) imageUrl = backgrounds.clear;
  else if (lowerCondition.includes('cloud')) imageUrl = backgrounds.clouds;
  else if (lowerCondition.includes('rain')) imageUrl = backgrounds.rain;
  else if (lowerCondition.includes('snow')) imageUrl = backgrounds.snow;
  else if (lowerCondition.includes('thunder')) imageUrl = backgrounds.thunderstorm;
  else if (lowerCondition.includes('mist') || lowerCondition.includes('fog')) imageUrl = backgrounds.mist;

  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
  };
  img.onerror = () => {
    console.error('Failed to load background image');
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = appState.theme === 'light' ? '#f1f1f1' : '#1a1a1a';
  };
}

function getAQIDescription(aqi) {
  const levels = {
    1: { text: 'Good', emoji: '😊', color: '#28a745' },
    2: { text: 'Fair', emoji: '🙂', color: '#5bc0de' },
    3: { text: 'Moderate', emoji: '😐', color: '#ffc107' },
    4: { text: 'Poor', emoji: '😷', color: '#fd7e14' },
    5: { text: 'Very Poor', emoji: '🤢', color: '#dc3545' }
  };
  
  const level = levels[aqi] || { text: 'Unknown', emoji: '❓', color: '#6c757d' };
  return `<span style="color: ${level.color}">${level.text} ${level.emoji} (AQI: ${aqi})</span>`;
}

function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round((degrees % 360) / 45) % 8];
}

function getWeatherIcon(conditionCode) {
  if (typeof conditionCode === 'string') {
    conditionCode = conditionCode.toLowerCase();
    if (conditionCode.includes('clear')) return '☀️';
    if (conditionCode.includes('cloud')) return '☁️';
    if (conditionCode.includes('rain')) return '🌧️';
    if (conditionCode.includes('snow')) return '❄️';
    if (conditionCode.includes('thunder')) return '⛈️';
    return '🌈';
  }

  if (conditionCode >= 200 && conditionCode < 300) return '⛈️';
  if (conditionCode >= 300 && conditionCode < 400) return '🌧️';
  if (conditionCode >= 500 && conditionCode < 600) return '🌧️';
  if (conditionCode >= 600 && conditionCode < 700) return '❄️';
  if (conditionCode >= 700 && conditionCode < 800) return '🌫️';
  if (conditionCode === 800) return '☀️';
  if (conditionCode > 800) return '☁️';
  return '🌈';
}

function getMostFrequent(arr) {
  if (!arr || arr.length === 0) return null;
  
  const counts = {};
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

// Event Listeners
elements.themeToggle.addEventListener('click', () => {
  setTheme(appState.theme === 'dark' ? 'light' : 'dark');
});

elements.cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    getWeather();
  }
});

elements.cityInput.addEventListener('focus', () => {
  elements.recentSearchesContainer.style.display = appState.recentSearches.length > 0 ? 'block' : 'none';
});

elements.cityInput.addEventListener('blur', () => {
  setTimeout(() => {
    elements.recentSearchesContainer.style.display = 'none';
  }, 200);
});

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp);