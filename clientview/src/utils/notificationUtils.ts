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
 * Checks if the user is subscribed to notifications based on the token in localStorage
 */
export const isSubscribedToNotifications = (): boolean => {
  return localStorage.getItem('subscribedToken') != null;
};

/**
 * Set the subscription token in localStorage
 */
export const setSubscriptionToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('subscribedToken', token);
  } else {
    localStorage.removeItem('subscribedToken');
  }
};

/**
 * Get the current notification permission status
 */
export const getNotificationPermission = (): string => {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'default';
};

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
    try {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      // Instead of using index with IDBKeyRange.only(false) which can cause issues,
      // we'll get all notifications and filter them manually
      const request = store.getAll();
      
      request.onsuccess = () => {
        // Count notifications where read = false
        const unreadCount = request.result.filter(notification => notification.read === false).length;
        resolve(unreadCount);
      };
      
      request.onerror = (event) => {
        console.error('Error getting notifications:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      reject(error);
    }
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
    try {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Get all notifications
      const request = store.getAll();
      
      request.onsuccess = () => {
        // Update all unread notifications
        const unreadNotifications = request.result.filter(notification => notification.read === false);
        
        if (unreadNotifications.length === 0) {
          resolve();
          return;
        }
        
        // Create a counter to track when all updates are complete
        let updatesPending = unreadNotifications.length;
        
        unreadNotifications.forEach(notification => {
          notification.read = true;
          const updateRequest = store.put(notification);
          
          updateRequest.onsuccess = () => {
            updatesPending--;
            if (updatesPending === 0) {
              resolve();
            }
          };
          
          updateRequest.onerror = (event) => {
            console.error('Error updating notification:', (event.target as IDBRequest).error);
            updatesPending--;
            if (updatesPending === 0) {
              resolve(); // Continue despite errors
            }
          };
        });
      };
      
      request.onerror = (event) => {
        console.error('Error getting notifications:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      reject(error);
    }
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