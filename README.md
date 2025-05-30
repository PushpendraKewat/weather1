
# ☁️ Weather Forecast Web App

A modern and responsive weather forecast web app that provides **current**, **hourly**, and **5-day** weather information. Built with **JavaScript**, **Firebase Authentication**, and the **OpenWeatherMap API**, this app also includes **user login/signup**, **favorites**, **recent searches**, and **interactive map support**.

---

## 🔥 Features

✅ Firebase Authentication  
✅ Forgot Password functionality  
✅ Login with Email or Google  
✅ Current, 24-hour & 5-day forecast  
✅ Air Quality Index (AQI)  
✅ Dynamic weather backgrounds  
✅ Temperature units: °C/°F toggle  
✅ Add to Favorites  
✅ Recent Searches  
✅ Theme toggle (light/dark)  
✅ Map integration using Leaflet.js  
✅ Responsive & mobile-friendly UI  

---

## 🚀 Live Demo

> 📌 Coming soon: [your-live-site-link]

---

## 🧪 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: 
  - [OpenWeatherMap](https://openweathermap.org/api)
  - [Nominatim](https://nominatim.org/) (for reverse geocoding)
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth)
- **Map**: [Leaflet.js](https://leafletjs.com/)
- **Hosting**: Firebase Hosting (optional)

---

## 📸 Screenshots

| Light Mode | Dark Mode |
|------------|-----------|
| ![light](screenshots/light.png) | ![dark](screenshots/dark.png) |

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/weather-app.git
cd weather-app
```

### 2. Add Your Firebase Config

Replace the `firebaseConfig` in `index.html`, `signup.html`, and `script.js` with your own credentials from the Firebase Console.

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_APP_ID"
};
```

### 3. Add Your OpenWeatherMap API Key

In `script.js`, replace:

```js
const apiKey = "YOUR_OPENWEATHER_API_KEY";
```

---

## ✨ Deployment (Optional)

You can deploy your app using:

- **Firebase Hosting**  
  ```bash
  firebase init
  firebase deploy
  ```

- Or platforms like:
  - [Vercel](https://vercel.com/)
  - [Netlify](https://netlify.com/)
  - [GitHub Pages](https://pages.github.com/)

---

## 🙌 Acknowledgements

- [OpenWeatherMap](https://openweathermap.org/)
- [Firebase](https://firebase.google.com/)
- [Leaflet](https://leafletjs.com/)
- [Unsplash](https://unsplash.com/) (for background images)

---

## 📬 Contact

**Author**: Your Name  
**GitHub**: [@yourusername](https://github.com/yourusername)  
**Email**: your.email@example.com

---

## ⭐️ Give a Star

If you like this project, consider ⭐️ starring it on GitHub!

