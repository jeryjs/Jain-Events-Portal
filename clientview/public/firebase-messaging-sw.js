importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
	"apiKey": "AIzaSyA0Vrqeknku6vXDUYrcQFFXL1sQO3VXwRg",
	"authDomain": "jain-events-portal.firebaseapp.com",
	"projectId": "jain-events-portal",
	"storageBucket": "jain-events-portal.firebasestorage.app",
	"messagingSenderId": "906298788672",
	"appId": "1:906298788672:web:0f46a029a75dc2c62548a5",
	"measurementId": "G-8HCTLFG5KT",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
	console.log("Received background message ", payload);
	// Customize notification here
	const notificationOptions = {
		body: payload.notification.body,
		icon: payload.notification.image,
	};

	self.registration.showNotification(payload.notification.title, notificationOptions);
});

// Make sure the service worker is properly initialized
self.addEventListener('install', (event) => {
    console.log('Firebase messaging service worker installed');
    self.skipWaiting(); // Ensure the service worker activates immediately
});

self.addEventListener('activate', (event) => {
    console.log('Firebase messaging service worker activated');
    // Take control of all clients immediately
    event.waitUntil(clients.claim());
});