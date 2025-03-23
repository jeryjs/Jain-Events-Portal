import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import config from "./config";

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CLIENT_CONFIG_JSON as string);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize FCM only if supported
const initializeMessaging = async () => {
	try {
		// Check if messaging is supported in this environment
		if (await isSupported()) {
			const messaging = getMessaging(app);

			getToken(messaging, { vapidKey: import.meta.env.VITE_FCM_PUBLIC_KEY })
				.then((currentToken) => {
					if (currentToken) {
						const subscribedToken = localStorage.getItem("subscribedToken");
						if (subscribedToken !== currentToken) {
							// Subscribe to the 'all-users' topic
							fetch(`${config.API_BASE_URL}/user/subscribe`, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ token: currentToken, topic: "all-users" }),
							})
								.then((response) => {
									if (response.ok) {
										localStorage.setItem("subscribedToken", currentToken);
									} else {
										console.error("Failed to subscribe to topic");
									}
								})
								.catch((err) => {
									console.error("An error occurred while subscribing to topic. ", err);
								});
						}
					}
				})
				.catch((err) => {
					console.error("An error occurred while retrieving token. ", err);
				});

			// Handle incoming messages
			onMessage(messaging, (payload) => {
				console.log("Message received. ", payload);

				// Customize notification handling here
				const notificationOptions = {
					body: payload.notification.body,
					icon: payload.notification.image,
				};

				Notification.requestPermission().then(() => {
					new Notification(payload.notification.title, notificationOptions);
				});
			});

			return messaging;
		} else {
			console.log("Firebase messaging is not supported in this environment");
			return null;
		}
	} catch (err) {
		console.error("Firebase messaging initialization error:", err);
		return null;
	}
};

// Initialize messaging and export
let messaging = null;
initializeMessaging().then((result) => {
	messaging = result;
});

export { analytics, app, messaging };
