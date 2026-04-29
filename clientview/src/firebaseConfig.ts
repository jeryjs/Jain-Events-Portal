import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, Messaging, onMessage } from "firebase/messaging";
import config from "./config";
import { addNotification } from "./utils/notificationUtils";

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CLIENT_CONFIG_JSON as string);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
let messaging: Messaging | null;

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

								const topic = (import.meta.env.VERCEL_ENV == "production") ? 'all-users' : 'all-users-test';

								// Subscribe to the 'all-users' topic
								await fetch(`${config.API_BASE_URL}/user/subscribe`, {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({ token: currentToken, topic: topic, }),
								})
									.then((response) => {
										if (response.ok) {
											console.log("Successfully subscribed to topic", topic);
											localStorage.setItem("subscribedToken", currentToken);
										} else {
											console.error("Failed to subscribe to topic", topic);
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
	messaging = result || null;
});

// Process and save incoming notification
const processNotification = (payload: any) => {
  console.log("Notification received: ", payload);

  // Always save notification to IndexedDB
  if (payload.notification || payload.data) {
    const notificationData = {
      title: payload.notification?.title || payload.data?.title,
      body: payload.notification?.body || payload.data?.body,
      imageUrl: payload.notification?.image || payload.data?.imageUrl,
    };
    
    addNotification(notificationData)
      .catch(err => console.error("Error saving notification:", err));

    // Only show visible notification if showNotification is not explicitly false
    if (payload.notification && payload.data?.showNotification !== 'false' && Notification.permission === "granted") {
      const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image || '/JGI.webp',
        data: {
          url: payload.data?.link || '/',
          timestamp: Date.now()
        }
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
