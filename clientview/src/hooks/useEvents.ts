import { useQuery } from '@tanstack/react-query';
import Event from '@common/models/Event';
import config from '../config';

const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${config.API_BASE_URL}/events`, {
    headers: {
      'Cache-Control': 'max-age=300', // 5 minutes
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  
  const data = await response.json();
  return data;
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
