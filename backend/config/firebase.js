const firebase = require("firebase/compat/app").default;
require("firebase/compat/firestore");

// Parse the JSON string from the environment variable
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

// Initialize the Firebase app with the parsed firebase config
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();

module.exports = db;