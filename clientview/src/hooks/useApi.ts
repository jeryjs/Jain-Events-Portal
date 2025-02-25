import { useQuery } from '@tanstack/react-query';
import Activity from '@common/models/Activity';
import Event from '@common/models/Event';
import { parseActivity } from '@common/utils';
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
  return data.map((event: any) => Event.parse(event));
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: _fetchEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};


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
  return data.map((activity: any) => parseActivity(activity));
};

export const useActivities = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['activities', eventId],
    queryFn: () => eventId ? _fetchActivities(eventId) : Promise.resolve([]),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!eventId,
  });
};
