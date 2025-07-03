import { useMutation } from '@tanstack/react-query';
import { NotificationsApi } from './useApi';

/**
 * Hook to send notifications to all users
 */
export function useSendNotification() {
  return useMutation({
    mutationFn: (data: { 
      title: string; 
      message: string; 
      imageUrl?: string;
      link?: string;
      showNotification?: boolean;
    }) => 
      NotificationsApi.sendToAll(data),
    onError: (error) => console.error('Error sending notification:', error),
  });
}