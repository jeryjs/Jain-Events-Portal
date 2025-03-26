/**
 * Notification database utility for storing and retrieving notifications
 * using IndexedDB, which is accessible from both the main thread and service workers.
 */

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  timestamp: number;
  read: boolean;
}

const DB_NAME = 'notifications-db';
const STORE_NAME = 'notifications';
const DB_VERSION = 1;

/**
 * Opens the IndexedDB database connection
 */
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('read', 'read', { unique: false });
      }
    };
  });
};

/**
 * Adds a notification to the database
 */
export const addNotification = async (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): Promise<NotificationItem> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Create a new notification with generated ID and defaults
    const newNotification: NotificationItem = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: notification.title,
      body: notification.body,
      imageUrl: notification.imageUrl,
      timestamp: Date.now(),
      read: false,
    };
    
    const request = store.add(newNotification);
    
    request.onsuccess = () => {
      resolve(newNotification);
    };
    
    request.onerror = (event) => {
      console.error('Error adding notification:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Gets all notifications from the database, sorted by timestamp (newest first)
 */
export const getNotifications = async (): Promise<NotificationItem[]> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    
    // Get all notifications ordered by timestamp descending (newest first)
    const request = index.openCursor(null, 'prev');
    const notifications: NotificationItem[] = [];
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      
      if (cursor) {
        notifications.push(cursor.value);
        cursor.continue();
      } else {
        resolve(notifications);
      }
    };
    
    request.onerror = (event) => {
      console.error('Error getting notifications:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Gets the count of unread notifications
 */
export const getUnreadCount = async (): Promise<number> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('read');
    
    // Count notifications where read = false
    const request = index.count(IDBKeyRange.only(false));
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      console.error('Error getting unread count:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Marks a notification as read
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Get the notification first
    const getRequest = store.get(notificationId);
    
    getRequest.onsuccess = () => {
      const notification = getRequest.result;
      if (notification) {
        notification.read = true;
        const updateRequest = store.put(notification);
        
        updateRequest.onsuccess = () => {
          resolve();
        };
        
        updateRequest.onerror = (event) => {
          console.error('Error updating notification:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      } else {
        resolve(); // Notification not found, but not an error
      }
    };
    
    getRequest.onerror = (event) => {
      console.error('Error getting notification:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Marks all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('read');
    
    // Get all unread notifications
    const request = index.openCursor(IDBKeyRange.only(false));
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      
      if (cursor) {
        const notification = cursor.value;
        notification.read = true;
        store.put(notification);
        cursor.continue();
      } else {
        resolve();
      }
    };
    
    request.onerror = (event) => {
      console.error('Error marking all as read:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Clear old notifications (keeps the most recent 50)
 */
export const clearOldNotifications = async (): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    
    // Get all notifications ordered by timestamp
    const request = index.openCursor(null, 'prev');
    let count = 0;
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      
      if (cursor) {
        count++;
        // Delete notifications beyond the 50 most recent
        if (count > 50) {
          store.delete(cursor.value.id);
        }
        cursor.continue();
      } else {
        resolve();
      }
    };
    
    request.onerror = (event) => {
      console.error('Error clearing old notifications:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};