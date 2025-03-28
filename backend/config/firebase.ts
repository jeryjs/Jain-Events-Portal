import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging, TopicMessage } from 'firebase-admin/messaging';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore();
export const messaging = getMessaging();

db.settings({ ignoreUndefinedProperties: true });

/**
 * Send push notification to all users
 */
export const sendPushNotificationToAllUsers = async (
  title: string, 
  body: string, 
  imageUrl?: string,
  options?: {
    clickAction?: string;
    showNotification?: boolean; // Whether to show a visible notification or just save silently
    link?: string; // Optional link to redirect users
  }
) => {
  const message: TopicMessage = {
    notification: options?.showNotification !== false ? {
      title,
      body,
      imageUrl,
    } : undefined,
    data: {
      // All notifications are saved by default
      title, // Include title in data for silent notifications
      body, // Include body in data for silent notifications
      imageUrl: imageUrl || '', // Include imageUrl in data for silent notifications
      showNotification: options?.showNotification !== false ? 'true' : 'false',
      clickAction: options?.clickAction || '/',
      link: options?.link || '',
      timestamp: Date.now().toString(),
    },
    topic: process.env.NODE_ENV === "development" ? 'all-users-test' : 'all-users',
  };

  try {
    await messaging.send(message);
    console.log('Push notification sent successfully');
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export default db;
