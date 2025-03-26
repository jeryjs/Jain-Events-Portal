import { useCallback, useEffect, useState } from 'react';
import * as notificationDB from '../utils/notificationUtils';
import { NotificationItem } from '../utils/notificationUtils';

/**
 * Hook for managing notification data using IndexedDB
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

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
    addNotification,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
}

export default useNotifications;