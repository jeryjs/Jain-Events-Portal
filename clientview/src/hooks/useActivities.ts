import { useQuery } from '@tanstack/react-query';
import Activity from '@common/models/Activity';
import config from '../config';

const fetchActivities = async (eventId: string): Promise<Activity[]> => {
  const response = await fetch(`${config.API_BASE_URL}/activities/${eventId}`, {
    headers: {
      'Cache-Control': 'max-age=300', // 5 minutes
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch activities for event: ${eventId}`);
  }
  
  const data = await response.json();
  return data;
};

export const useActivities = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['activities', eventId],
    queryFn: () => eventId ? fetchActivities(eventId) : Promise.resolve([]),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!eventId,
    suspense: true,
  });
};
