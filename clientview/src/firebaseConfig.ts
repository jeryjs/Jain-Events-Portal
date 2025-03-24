import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import config from "./config";

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CLIENT_CONFIG_JSON as string);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
let messaging = null;

// Initialize FCM only if supported and already granted
export const initializeMessaging = async () => {
	try {
		// Check if messaging is supported in this environment
		if (await isSupported()) {
			// Only attempt to get token if permission is already granted
			if (Notification.permission === "granted") {
				messaging = getMessaging(app);
				await getToken(messaging, { vapidKey: import.meta.env.VITE_FCM_PUBLIC_KEY })
					.then(async (currentToken) => {
						if (currentToken) {
							const subscribedToken = localStorage.getItem("subscribedToken");
							if (subscribedToken !== currentToken) {
								console.log("New token received. Subscribing to topic...");

								// Subscribe to the 'all-users' topic
								await fetch(`${config.API_BASE_URL}/user/subscribe`, {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({ token: currentToken, topic: "all-users" }),
								})
									.then((response) => {
										if (response.ok) {
											console.log("Subscribed to topic successfully");
											localStorage.setItem("subscribedToken", currentToken);
										} else {
											console.error("Failed to subscribe to topic");
											return null;
										}
									})
									.catch((err) => {
										console.error("An error occurred while subscribing to topic. ", err);
										return null;
									});
							}
						}
					})
					.catch((err) => {
						console.error("An error occurred while retrieving token. ", err);
						return null;
					});

				// Handle incoming messages
				onMessage(messaging, (payload) => {
					console.log("Message received. ", payload);

					// Customize notification handling here
					if (Notification.permission === "granted") {
						const notificationOptions = {
							body: payload.notification.body,
							icon: payload.notification.image,
						};
						new Notification(payload.notification.title, notificationOptions);
					}
				});
				return messaging;
			}

			console.log("Firebase messaging is not supported in this environment");
			return null;
		}
	} catch (err) {
		console.error("Firebase messaging initialization error:", err);
		return null;
	}
};

// Initialize messaging and export
initializeMessaging().then((result) => {
	messaging = result;
});

export { analytics, app, messaging };
