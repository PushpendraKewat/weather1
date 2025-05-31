  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyD1SmQ_S0sHU1pT_mzdGAUGzLdv8I5p-Zs",
    authDomain: "weatherapp-53b98.firebaseapp.com",
    databaseURL: "https://weatherapp-53b98-default-rtdb.firebaseio.com",
    projectId: "weatherapp-53b98",
    storageBucket: "weatherapp-53b98.firebasestorage.app",
    messagingSenderId: "111983595600",
    appId: "1:111983595600:web:5590b05eab93f286934155",
    measurementId: "G-9LMS3KCDB3"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);