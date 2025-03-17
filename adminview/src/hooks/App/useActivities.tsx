import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivitiesApi } from './useApi';
import { Activity } from '@common/models';

/**
 * Hook to fetch all activities for an event
 */
export function useEventActivities(eventId?: string) {
  const query = useQuery({
    queryKey: ['activities', 'event', eventId],
    queryFn: () => ActivitiesApi.getByEventId(eventId!),
    enabled: !!eventId,
  });

  return {
    activities: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook to fetch a specific activity
 */
export function useActivity(eventId?: string, activityId?: string) {
  return useQuery({
    queryKey: ['activity', eventId, activityId],
    queryFn: () => ActivitiesApi.getById(eventId!, activityId!),
    enabled: !!eventId && !!activityId,
  });
}

/**
 * Hook to create a new activity
 */
export function useCreateActivity(eventId?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (activityData: Activity) => {
      return ActivitiesApi.create(eventId!, activityData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', 'event', eventId] });
    },
  });
}

/**
 * Hook to update an existing activity
 */
export function useUpdateActivity(eventId?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (activity: Activity) => {
      return ActivitiesApi.update(eventId!, activity.id, activity);
    },
    onSuccess: (_, activity) => {
      queryClient.invalidateQueries({ queryKey: ['activities', 'event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['activity', eventId, activity.id] });
    },
  });
}

/**
 * Hook to delete an activity
 */
export function useDeleteActivity(eventId?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (activityId: string) => {
      return ActivitiesApi.delete(eventId!, activityId);
    },
    onSuccess: (_, activityId) => {
      queryClient.invalidateQueries({ queryKey: ['activities', 'event', eventId] });
      queryClient.removeQueries({ queryKey: ['activity', eventId, activityId] });
    },
  });
}
