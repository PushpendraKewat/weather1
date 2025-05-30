// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD1SmQ_S0sHU1pT_mzdGAUGzLdv8I5p-Zs",
  authDomain: "weatherapp-53b98.firebaseapp.com",
  projectId: "weatherapp-53b98",
  storageBucket: "weatherapp-53b98.firebasestorage.app",
  messagingSenderId: "111983595600",
  appId: "1:111983595600:web:7dcc144b9e8e5055934155",
  measurementId: "G-QS6VTEPQ3G"
};

firebase.initializeApp(firebaseConfig);

let currentUser = null;

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  document.getElementById('authSpinner').style.display = 'block';

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      currentUser = userCredential.user;
      document.getElementById('authContainer').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      document.getElementById('logoutBtn').style.display = 'inline-block';
      initApp();
    })
    .catch(error => {
      showNotification(error.message, 'error');
    })
    .finally(() => {
      document.getElementById('authSpinner').style.display = 'none';
    });
}

function signup() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  document.getElementById('authSpinner').style.display = 'block';

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      currentUser = userCredential.user;
      document.getElementById('authContainer').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      document.getElementById('logoutBtn').style.display = 'inline-block';
      initApp();
    })
    .catch(error => {
      showNotification(error.message, 'error');
    })
    .finally(() => {
      document.getElementById('authSpinner').style.display = 'none';
    });
}

function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  document.getElementById('authSpinner').style.display = 'block';

  firebase.auth().signInWithPopup(provider)
    .then(result => {
      currentUser = result.user;
      document.getElementById('authContainer').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      document.getElementById('logoutBtn').style.display = 'inline-block';
      initApp();
    })
    .catch(error => {
      showNotification(error.message, 'error');
    })
    .finally(() => {
      document.getElementById('authSpinner').style.display = 'none';
    });
}

function logout() {
  firebase.auth().signOut().then(() => {
    currentUser = null;
    document.getElementById('app').style.display = 'none';
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
  });
}
