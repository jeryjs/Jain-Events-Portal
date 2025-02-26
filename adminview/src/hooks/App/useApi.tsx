import { Event, Activity } from '@common/models';
import { parseEvents } from '@common/utils';
import config from '#config';

const API_BASE_URL = config.API_BASE_URL;

// Interface for API error response
interface ApiError {
  status: number;
  message: string;
  details?: any;
}

/**
 * Custom fetch wrapper that handles common API patterns
 */
async function apiFetch<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle JSON parsing
  const data = await response.json();
  
  // Handle error responses
  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message: data.message || 'An unknown error occurred',
      details: data.details,
    };
    throw error;
  }
  
  return data;
}

/**
 * Events API endpoints
 */
export const EventsApi = {
  // Get all events
  getAll: () => 
    apiFetch<Event[]>('/events').then(it => parseEvents(it)),
    
  // Get specific event by ID
  getById: (id: string) => 
    apiFetch<Event>(`/events/${id}`).then(it => Event.parse(it)),
    
  // Create a new event
  create: (eventData: Omit<Event, 'id'> & { id: string }) => 
    apiFetch<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }).then(it => Event.parse(it)),
    
  // Update an existing event
  update: (id: string, eventData: Partial<Event>) => 
    apiFetch<Event>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    }).then(it => Event.parse(it)),
    
  // Delete an event
  delete: (id: string) => 
    apiFetch<void>(`/events/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Activities API endpoints
 */
export const ActivitiesApi = {
  // Get all activities for an event
  getByEventId: (eventId: string) => 
    apiFetch<Activity[]>(`/events/${eventId}/activities`),
    
  // Get specific activity by ID
  getById: (eventId: string, activityId: string) => 
    apiFetch<Activity>(`/events/${eventId}/activities/${activityId}`),
    
  // Create a new activity for an event
  create: (eventId: string, activityData: Omit<Activity, 'id'>) => 
    apiFetch<Activity>(`/events/${eventId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activityData),
    }),
    
  // Update an existing activity
  update: (eventId: string, activityId: string, activityData: Partial<Activity>) => 
    apiFetch<Activity>(`/events/${eventId}/activities/${activityId}`, {
      method: 'PATCH',
      body: JSON.stringify(activityData),
    }),
    
  // Delete an activity
  delete: (eventId: string, activityId: string) => 
    apiFetch<void>(`/events/${eventId}/activities/${activityId}`, {
      method: 'DELETE',
    }),
};

export default {
  events: EventsApi,
  activities: ActivitiesApi,
};