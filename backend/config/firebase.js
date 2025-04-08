const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Initialize Firebase Admin SDK with service account
let firebaseInitialized = false;

try {
  console.log('Initializing Firebase...');
  
  // Use the service account file
  const serviceAccountPath = path.resolve('./config/serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      console.log('Firebase initialized successfully with service account');
      firebaseInitialized = true;
    } catch (error) {
      console.error('Error initializing Firebase:', error.message);
    }
  } else {
    console.warn('Service account file not found at:', serviceAccountPath);
    console.warn('Please create a serviceAccountKey.json file in the config directory');
    
    // Try to initialize without credentials (useful for testing)
    try {
      admin.initializeApp();
      console.log('Firebase initialized with default credentials');
      firebaseInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Firebase with default credentials:', error.message);
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

module.exports = { admin, firebaseInitialized }; 