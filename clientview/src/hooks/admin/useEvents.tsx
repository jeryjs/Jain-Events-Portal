import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EventsApi } from './_useApi';
import { Event } from '@common/models';

/**
 * Hook to fetch all events
 */
export function useEvents() {
  const query = useQuery({
    queryKey: ['events'],
    queryFn: () => EventsApi.getAll(),
		staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    events: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook to fetch a specific event by ID
 */
export function useEvent(id?: string, enabled = true) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => EventsApi.getById(id!),
    enabled: !!id && enabled,
  });
}

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (event: Event) => EventsApi.create(event),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),   // Invalidate events cache to refresh data
    onError: (error) => console.error('Error creating event:', error),
  });
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (event: Partial<Event>) => EventsApi.update(event.id, event),
        onSuccess: (_, event) => {
            queryClient.invalidateQueries({ queryKey: ['event', event.id] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => EventsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.removeQueries({ queryKey: ['event', id] });
    },
  });
}
