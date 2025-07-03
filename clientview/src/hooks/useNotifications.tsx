import { useCallback, useEffect, useState } from 'react';
import * as notificationDB from '../utils/notificationUtils';
import { NotificationItem, isSubscribedToNotifications, setSubscriptionToken, getNotificationPermission } from '../utils/notificationUtils';
import { initializeMessaging } from '../firebaseConfig';

/**
 * Hook for managing notification data and subscription state using IndexedDB
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);

  // Initialize permission and subscription status
  useEffect(() => {
    setPermissionStatus(getNotificationPermission());
    setIsSubscribed(isSubscribedToNotifications());
  }, []);

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationDB.getNotifications();
      setNotifications(data);
      
      // Get unread count
      const count = await notificationDB.getUnreadCount();
      setUnreadCount(count);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new notification
  const addNotification = useCallback(async (notification: { title: string; body: string; imageUrl?: string }) => {
    try {
      const newNotification = await notificationDB.addNotification(notification);
      
      // Update state with the new notification
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Clean up old notifications
      notificationDB.clearOldNotifications();
      
      return newNotification;
    } catch (err) {
      console.error('Error adding notification:', err);
      setError(err instanceof Error ? err : new Error('Failed to add notification'));
      return null;
    }
  }, []);

  // Subscribe to notifications
  const subscribeToNotifications = useCallback(async () => {
    setIsSubscribing(true);
    try {
      // Request permission if needed
      if (permissionStatus === 'default') {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        if (permission !== 'granted') {
          setIsSubscribing(false);
          return false;
        }
      } else if (permissionStatus !== 'granted') {
        setIsSubscribing(false);
        return false;
      }
      
      // Initialize messaging
      const messaging = await initializeMessaging();
      
      // Update subscription state
      const newSubscribed = isSubscribedToNotifications();
      setIsSubscribed(newSubscribed);
      
      setIsSubscribing(false);
      return newSubscribed;
    } catch (err) {
      console.error('Error subscribing to notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to subscribe to notifications'));
      setIsSubscribing(false);
      return false;
    }
  }, [permissionStatus]);

  // Unsubscribe from notifications
  const unsubscribeFromNotifications = useCallback(async () => {
    try {
      // Clear token from localStorage
      setSubscriptionToken(null);
      
      // Update state
      setIsSubscribed(false);
      
      // TODO: Implement server-side unsubscribe if needed
      
      return true;
    } catch (err) {
      console.error('Error unsubscribing from notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to unsubscribe from notifications'));
      return false;
    }
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationDB.markAsRead(notificationId);
      
      // Update UI state
      setNotifications(prev => 
        prev.map(item => 
          item.id === notificationId 
            ? { ...item, read: true } 
            : item
        )
      );
      
      // Decrement unread count if the notification was unread
      const wasUnread = notifications.find(n => n.id === notificationId && !n.read);
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err : new Error('Failed to mark notification as read'));
    }
  }, [notifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationDB.markAllAsRead();
      
      // Update UI state
      setNotifications(prev => 
        prev.map(item => ({ ...item, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err instanceof Error ? err : new Error('Failed to mark all notifications as read'));
    }
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    permissionStatus,
    isSubscribed,
    isSubscribing,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
}

export default useNotifications;