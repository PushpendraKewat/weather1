const apiKey = "8cb180073321f663b875890301b3ed58"; // Replace with your actual OpenWeatherMap API key

// Predefined background images for each weather condition
const backgroundImages = {
    clear: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    clouds: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    rain: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    snow: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    thunderstorm: "https://images.unsplash.com/photo-1509506489701-dfe23b067808?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    mist: "https://images.unsplash.com/photo-1504253163759-c23fccaebb55?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    default: "https://images.unsplash.com/photo-1536514498073-50e69d39c6cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80"
};

function getAQIDescription(aqi) {
    const levels = {
        1: "Good 😊",
        2: "Fair 🙂",
        3: "Moderate 😐",
        4: "Poor 😷",
        5: "Very Poor 🤢"
    };
    return levels[aqi] || "Unknown";
}

function setWeatherBackground(condition) {
    const lower = condition.toLowerCase();
    let imageUrl = backgroundImages.default;

    if (lower.includes("clear")) {
        imageUrl = backgroundImages.clear;
    } else if (lower.includes("cloud")) {
        imageUrl = backgroundImages.clouds;
    } else if (lower.includes("rain")) {
        imageUrl = backgroundImages.rain;
    } else if (lower.includes("snow")) {
        imageUrl = backgroundImages.snow;
    } else if (lower.includes("thunder")) {
        imageUrl = backgroundImages.thunderstorm;
    } else if (lower.includes("mist") || lower.includes("fog")) {
        imageUrl = backgroundImages.mist;
    }

    // Preload image to ensure it's loaded before setting as background
    const img = new Image();
    img.src = imageUrl;
    img.onload = function() {
        document.body.style.backgroundImage = `url('${imageUrl}')`;
    };
    img.onerror = function() {
        console.error("Failed to load background image");
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = "#1a1a1a";
    };
}

async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    document.getElementById("spinner").style.display = "block";
    document.getElementById("weather").innerHTML = "";
    document.getElementById("forecast").innerHTML = "";
    document.getElementById("alerts").innerHTML = "";

    try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
        const geoRes = await fetch(geoUrl);
        
        if (!geoRes.ok) throw new Error("City not found");
        
        const geoData = await geoRes.json();
        if (!geoData.length) throw new Error("City not found");
        
        const { lat, lon } = geoData[0];
        await fetchWeatherData(lat, lon);
    } catch (error) {
        document.getElementById("spinner").style.display = "none";
        alert(`Error: ${error.message}`);
        console.error(error);
    }
}

async function getWeatherByLocation() {
    document.getElementById("spinner").style.display = "block";
    document.getElementById("weather").innerHTML = "";
    document.getElementById("forecast").innerHTML = "";
    document.getElementById("alerts").innerHTML = "";

    if (!navigator.geolocation) {
        document.getElementById("spinner").style.display = "none";
        alert("Geolocation is not supported by your browser");
        return;
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await fetchWeatherData(lat, lon);
    } catch (error) {
        document.getElementById("spinner").style.display = "none";
        alert(`Error getting location: ${error.message}`);
        console.error(error);
    }
}

async function fetchWeatherData(lat, lon) {
    try {
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        const [currentRes, forecastRes, airRes] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl),
            fetch(airUrl)
        ]);

        if (!currentRes.ok) throw new Error("Weather data not available");
        if (!forecastRes.ok) throw new Error("Forecast data not available");

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();
        const airData = airRes.ok ? await airRes.json() : null;

        displayWeather(currentData, forecastData, airData);
    } catch (error) {
        throw error;
    } finally {
        document.getElementById("spinner").style.display = "none";
    }
}

function displayWeather(currentData, forecastData, airData) {
    const condition = currentData.weather[0].main;
    setWeatherBackground(condition);

    const aqi = airData?.list?.[0]?.main?.aqi || "N/A";
    const aqiDesc = airData ? getAQIDescription(aqi) : "Data not available";

    document.getElementById("weather").innerHTML = `
        <h2>${currentData.name}, ${currentData.sys.country}</h2>
        <p><strong>${condition}</strong> <i class="weather-icon">${getWeatherIcon(currentData.weather[0].id)}</i></p>
        <p>Temperature: ${Math.round(currentData.main.temp)}°C (Feels like ${Math.round(currentData.main.feels_like)}°C)</p>
        <p>Humidity: ${currentData.main.humidity}%</p>
        <p>Wind: ${currentData.wind.speed} m/s, ${getWindDirection(currentData.wind.deg)}</p>
        <p>Pressure: ${currentData.main.pressure} hPa</p>
        <p>Visibility: ${(currentData.visibility / 1000).toFixed(1)} km</p>
        <p><strong>Air Quality:</strong> ${aqi} (${aqiDesc})</p>
    `;

    // Group forecast by day
    const dailyForecast = {};
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyForecast[date]) {
            dailyForecast[date] = {
                temps: [],
                conditions: []
            };
        }
        dailyForecast[date].temps.push(item.main.temp);
        dailyForecast[date].conditions.push(item.weather[0].main);
    });

    let forecastHTML = "";
    Object.keys(dailyForecast).forEach((date, i) => {
        if (i >= 5) return; // Limit to 5 days
        const dayData = dailyForecast[date];
        const avgTemp = (dayData.temps.reduce((a, b) => a + b, 0) / dayData.temps.length).toFixed(1);
        const mainCondition = getMostFrequent(dayData.conditions);
        
        forecastHTML += `
            <div>
                <strong>${date}</strong>: ${avgTemp}°C, ${mainCondition}
                <i class="weather-icon">${getWeatherIcon(mainCondition)}</i>
            </div>
        `;
    });

    document.getElementById("forecast").innerHTML = `
        <h3>5-Day Forecast</h3>
        ${forecastHTML}
    `;

    // Alerts section
    let alertHTML = "<h3>Weather Alerts</h3>";
    if (currentData.alerts && currentData.alerts.length > 0) {
        currentData.alerts.forEach(alert => {
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
        alertHTML += "<p>No current weather alerts 🎉</p>";
    }
    document.getElementById("alerts").innerHTML = alertHTML;
}

// Helper functions
function getMostFrequent(arr) {
    return arr.sort((a, b) =>
        arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
}

function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
}

function getWeatherIcon(conditionId) {
    // This is a simplified version - you might want to use actual icon fonts
    if (typeof conditionId === 'string') {
        conditionId = conditionId.toLowerCase();
        if (conditionId.includes('clear')) return '☀️';
        if (conditionId.includes('cloud')) return '☁️';
        if (conditionId.includes('rain')) return '🌧️';
        if (conditionId.includes('snow')) return '❄️';
        if (conditionId.includes('thunder')) return '⛈️';
        return '🌈';
    } else {
        // Numeric condition codes from OpenWeatherMap
        if (conditionId >= 200 && conditionId < 300) return '⛈️';
        if (conditionId >= 300 && conditionId < 400) return '🌧️';
        if (conditionId >= 500 && conditionId < 600) return '🌧️';
        if (conditionId >= 600 && conditionId < 700) return '❄️';
        if (conditionId >= 700 && conditionId < 800) return '🌫️';
        if (conditionId === 800) return '☀️';
        if (conditionId > 800) return '☁️';
        return '🌈';
    }
}