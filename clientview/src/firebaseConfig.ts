import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import config from "./config";
import { addNotification } from "./utils/notificationUtils";

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

				// Handle foreground messages
				onMessageListener();
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

// Process and save incoming notification
const processNotification = (payload: any) => {
  console.log("Notification received: ", payload);

  if (payload.notification) {
    // Save notification to IndexedDB
    addNotification({
      title: payload.notification.title,
      body: payload.notification.body,
      imageUrl: payload.notification.image,
    }).catch(err => console.error("Error saving notification:", err));

    // Display notification if permission is granted
    if (Notification.permission === "granted") {
      const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image,
      };
      new Notification(payload.notification.title, notificationOptions);
    }
  }
};

// Handle foreground messages
export const onMessageListener = () => {
  if (!messaging) return () => {};
  return onMessage(messaging, processNotification);
};

// Handle background messages
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    if (registration.active) {
      registration.active.postMessage({ type: 'ENABLE_BG_MESSAGES' });
    }
  });
  
  // Listen for messages from service worker 
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
      console.log('Notification clicked:', event.data.notificationId);
      
      // Handle notification click actions if needed
      if (event.data.url && event.data.url !== '/') {
        window.location.href = event.data.url;
      }
    }
  });
}

export { analytics, app, messaging };
