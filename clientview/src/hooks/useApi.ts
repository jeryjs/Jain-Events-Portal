import { useQuery } from '@tanstack/react-query';
import Activity from '@common/models/Activity';
import Event from '@common/models/Event';
import { parseActivities, parseEvents } from '@common/utils';
import config from '../config';

const _fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${config.API_BASE_URL}/events`, {
    headers: {
      'Cache-Control': 'max-age=300', // 5 minutes
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  
  const data: any = await response.json();
  return parseEvents(data);
};

export const useEvents = () => {
  return useDummyEvents(20);  // Use dummy events for now while testing

  return useQuery({
    queryKey: ['events'],
    queryFn: _fetchEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useEvent = (eventId: string) => {
  const eventsQuery = useEvents();
  
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => 
      eventsQuery.data?.find(e => e.id === eventId) || 
      (await _fetchEvents()).find(e => e.id === eventId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !eventsQuery.isLoading,
  });
};

export const useDummyEvents = (count = 100) => {
  return useQuery({
    queryKey: ['dummy-events', count],
    queryFn: async () => {
      return fetch('/dummy_events.json')
        .then(res => res.json())
        .then(data => parseEvents(data).slice(0, count))  // Limit to the first `count` events
        .then(it => new Promise<typeof it>(resolve => setTimeout(() => resolve(it), 1000))) // Simulate network delay
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

const _fetchActivities = async (eventId: string): Promise<Activity[]> => {
  const response = await fetch(`${config.API_BASE_URL}/activities/${eventId}`, {
    headers: {
      'Cache-Control': 'max-age=300', // 5 minutes
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch activities for event: ${eventId}`);
  }
  
  const data: any = await response.json();
  return parseActivities(data);
};

export const useActivities = (eventId: string) => {
  return useQuery({
    queryKey: ['activities', eventId],
    queryFn: () => _fetchActivities(eventId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
