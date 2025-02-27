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
  return useQuery({
    queryKey: ['events'],
    queryFn: _fetchEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => _fetchEvents().then(events => events.find(e => e.id === eventId)),
    staleTime: 1000 * 60 * 5, // 5 minutes
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
