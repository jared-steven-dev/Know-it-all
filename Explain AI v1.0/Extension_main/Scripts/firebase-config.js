// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyg9ZaomElIdzULRvLQYeXy-8J8Q4EtLk",
  authDomain: "know-it-all-70eb1.firebaseapp.com",
  projectId: "know-it-all-70eb1",
  storageBucket: "know-it-all-70eb1.firebasestorage.app",
  messagingSenderId: "713137864892",
  appId: "1:713137864892:web:df3e4284714f5ead50d0b9",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Auth and Firestore instances
const auth = firebase.auth();
const db = firebase.firestore();

// Custom authentication function using chrome.identity
async function signInWithChromeIdentity() {
  try {
    // Get OAuth token from Chrome
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(token);
        }
      });
    });

    // Get user info from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await response.json();

    // Create a custom credential
    const credential = firebase.auth.GoogleAuthProvider.credential(null, token);

    // Sign in to Firebase with the credential
    const userCredential = await auth.signInWithCredential(credential);

    return {
      user: userCredential.user,
      token: token,
      userInfo: userInfo
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

// Sign out function
async function signOut() {
  try {
    // Get the current token
    const token = await new Promise((resolve) => {
      chrome.identity.getAuthToken({ interactive: false }, resolve);
    });

    if (token) {
      // Revoke the token
      await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
      // Remove the cached token
      chrome.identity.removeCachedAuthToken({ token });
    }

    // Sign out from Firebase
    await auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Export for use in other files
window.auth = auth;
window.db = db;
window.signInWithChromeIdentity = signInWithChromeIdentity;
window.signOut = signOut; 