import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import config from "./config";

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CLIENT_CONFIG_JSON as string);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
let messaging = null;

// Type interface for a notification in history
export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  timestamp: number;
  read: boolean;
}

// Get notification history from local storage
export const getNotificationHistory = (): NotificationHistoryItem[] => {
  try {
    const history = localStorage.getItem('notification_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error retrieving notification history:', error);
    return [];
  }
};

// Save a notification to history
export const saveNotificationToHistory = (notification: { title: string; body: string; imageUrl?: string }) => {
  try {
    const history = getNotificationHistory();
    const newNotification: NotificationHistoryItem = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: notification.title,
      body: notification.body,
      imageUrl: notification.imageUrl,
      timestamp: Date.now(),
      read: false,
    };
    
    // Add new notification to the beginning of the array (newest first)
    const updatedHistory = [newNotification, ...history];
    
    // Limit history to 50 notifications to prevent local storage overflow
    const limitedHistory = updatedHistory.slice(0, 50);
    
    localStorage.setItem('notification_history', JSON.stringify(limitedHistory));
    return newNotification;
  } catch (error) {
    console.error('Error saving notification to history:', error);
    return null;
  }
};

// Mark notification as read
export const markNotificationAsRead = (notificationId: string) => {
  try {
    const history = getNotificationHistory();
    const updatedHistory = history.map(item => {
      if (item.id === notificationId) {
        return { ...item, read: true };
      }
      return item;
    });
    
    localStorage.setItem('notification_history', JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

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

				// Handle foreground messages and save to history
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

// Handle foreground messages and save to history
export const onMessageListener = () => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);

    // Save notification to history
    if (payload.notification) {
      saveNotificationToHistory({
        title: payload.notification.title,
        body: payload.notification.body,
        imageUrl: payload.notification.image,
      });
    }

    // Display notification if permission is granted
    if (Notification.permission === "granted") {
      const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image,
      };
      new Notification(payload.notification.title, notificationOptions);
    }
  });
};

export { analytics, app, messaging };
