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

// Constants for IndexedDB
const DB_NAME = 'notifications-db';
const STORE_NAME = 'notifications';
const DB_VERSION = 1;

// Open IndexedDB
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Service worker database error:', request.error);
      reject(request.error);
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('read', 'read', { unique: false });
      }
    };
  });
};

// Add notification to IndexedDB
const addNotification = async (notification) => {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Create a new notification with generated ID and defaults
      const newNotification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: notification.title,
        body: notification.body,
        imageUrl: notification.image || undefined,
        timestamp: Date.now(),
        read: false,
      };
      
      const request = store.add(newNotification);
      
      request.onsuccess = () => {
        console.log('Service worker saved notification to IndexedDB');
        resolve(newNotification);
      };
      
      request.onerror = () => {
        console.error('Service worker error adding notification:', request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Service worker failed to save notification:', error);
  }
};

// Clean up old notifications (keep the 50 most recent)
const clearOldNotifications = async () => {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      
      const request = index.openCursor(null, 'prev');
      let count = 0;
      
      request.onsuccess = (event) => {
        const cursor = request.result;
        
        if (cursor) {
          count++;
          if (count > 50) {
            store.delete(cursor.value.id);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => {
        console.error('Service worker error clearing old notifications:', request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Service worker failed to clear old notifications:', error);
  }
};

// Handle background messages
messaging.onBackgroundMessage((payload) => {
	console.log("Received background message ", payload);
	
	// Store notification in IndexedDB
	if (payload.notification) {
	  addNotification(payload.notification)
	    .then(() => clearOldNotifications())
	    .catch(error => console.error('Error processing background notification:', error));
	}
	
	// Show the notification to the user
	const notification = payload.notification;
	const notificationOptions = {
	  body: notification.body,
	  icon: notification.image || '/JGI.webp',
	  badge: '/JGI.webp',
	  tag: `notification-${Date.now()}`, // Makes multiple notifications stack instead of replacing
	  data: {
	    // Include data to handle click actions
	    url: notification.clickAction || '/',
	    timestamp: Date.now()
	  }
	};

	self.registration.showNotification(notification.title, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  notification.close();
  
  // Get any URL from the notification data
  const urlToOpen = notification.data?.url || '/';
  
  // This looks to see if there's already a tab open with the URL
  // If so, just focus it instead of opening a new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          // Check if the client URL starts with our target URL
          // This handles the case where we might have query params etc.
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            // Focus instead of opening a new one
            client.focus();
            // Send a message to the client to indicate which notification was clicked
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              notificationId: notification.tag,
              url: urlToOpen
            });
            return;
          }
        }
        
        // If no matching client or can't focus, open new one
        if (clients.openWindow) {
          clients.openWindow(urlToOpen);
        }
      })
  );
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