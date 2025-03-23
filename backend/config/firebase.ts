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
export const sendPushNotificationToAllUsers = async (title: string, body: string) => {
  const message: TopicMessage = {
    notification: {
      title,
      body,
    },
    
    topic: 'all-users', // You can use a topic to send to all users
  };

  try {
    await messaging.send(message);
    console.log('Push notification sent successfully');
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export default db;
