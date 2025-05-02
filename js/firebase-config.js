// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD1SmQ_S0sHU1pT_mzdGAUGzLdv8I5p-Zs",
    authDomain: "weatherapp-53b98.firebaseapp.com",
    projectId: "weatherapp-53b98",
    storageBucket: "weatherapp-53b98.firebasestorage.app",
    messagingSenderId: "111983595600",
    appId: "1:111983595600:web:7dcc144b9e8e5055934155",
    measurementId: "G-QS6VTEPQ3G"
  };

  const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = firebaseApp.auth();
const db = firebase.firestore();