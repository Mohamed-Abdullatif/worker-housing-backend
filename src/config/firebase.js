// Firebase Admin SDK configuration
let admin = null;

try {
    // Only initialize Firebase if credentials are provided
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin = require('firebase-admin');

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }

        console.log('Firebase Admin SDK initialized successfully');
    } else {
        console.log('Firebase credentials not found. Push notifications will be disabled.');
    }
} catch (error) {
    console.error('Error initializing Firebase:', error.message);
    console.log('Push notifications will be disabled.');
}

module.exports = admin;
