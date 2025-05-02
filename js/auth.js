// Initialize Firebase services
const { auth } = firebase;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const notification = document.getElementById('notification');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');

// Tab Switching
function switchTab(tab) {
  loginTab.classList.toggle('active', tab === 'login');
  registerTab.classList.toggle('active', tab === 'register');
  loginForm.classList.toggle('active', tab === 'login');
  registerForm.classList.toggle('active', tab === 'register');
}

loginTab.addEventListener('click', () => switchTab('login'));
registerTab.addEventListener('click', () => switchTab('register'));

// Notification System
function showNotification(message, type = 'error', duration = 3000) {
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  
  setTimeout(() => {
    notification.style.display = 'none';
  }, duration);
}

// Form Validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

// Auth Handlers
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!validateEmail(email)) {
    showNotification('Please enter a valid email address');
    return;
  }

  try {
    showNotification('Logging in...', 'info');
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    showNotification('Login successful!', 'success');
    
    // Redirect to main app after 1 second
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);
  } catch (error) {
    let message = error.message;
    if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password';
    }
    showNotification(message);
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!validateEmail(email)) {
    showNotification('Please enter a valid email address');
    return;
  }

  if (!validatePassword(password)) {
    showNotification('Password must be at least 6 characters');
    return;
  }

  if (password !== confirmPassword) {
    showNotification('Passwords do not match');
    return;
  }

  try {
    showNotification('Creating account...', 'info');
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    
    // Create user document in Firestore with default settings
    await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      preferences: {
        theme: 'dark',
        notifications: true,
        saveHistory: true
      },
      favorites: []
    });

    showNotification('Registration successful!', 'success');
    setTimeout(() => switchTab('login'), 1500);
  } catch (error) {
    let message = error.message;
    if (error.code === 'auth/email-already-in-use') {
      message = 'Email already in use';
    }
    showNotification(message);
  }
});

// Auto-redirect if already logged in
auth.onAuthStateChanged((user) => {
  if (user && window.location.pathname.includes('login.html')) {
    window.location.href = '../index.html';
  }
});