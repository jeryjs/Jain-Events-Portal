import { Event, Activity, Article } from '@common/models';
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
  
  // Get auth token from localStorage
  const token = localStorage.getItem('admin_token');
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle auth errors specifically
  if (response.status === 401 || response.status === 403) {
    // Clear invalid tokens
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    
    const error: ApiError = {
      status: response.status,
      message: response.status === 401 ? 'Authentication required' : 'Access denied',
    };
    throw error;
  }
  
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
    apiFetch<Activity[]>(`/activities/${eventId}`),
    
  // Get specific activity by ID
  getById: (eventId: string, activityId: string) => 
    apiFetch<Activity>(`/activities/${eventId}/${activityId}`),
    
  // Create a new activity for an event
  create: (eventId: string, activityData: Omit<Activity, 'id'>) => 
    apiFetch<Activity>(`/activities/${eventId}`, {
      method: 'POST',
      body: JSON.stringify(activityData),
    }),
    
  // Update an existing activity
  update: (eventId: string, activityId: string, activityData: Partial<Activity>) => 
    apiFetch<Activity>(`/activities/${eventId}/${activityId}`, {
      method: 'PATCH',
      body: JSON.stringify(activityData),
    }),
    
  // Delete an activity
  delete: (eventId: string, activityId: string) => 
    apiFetch<void>(`/activities/${eventId}/${activityId}`, {
      method: 'DELETE',
    }),
};

// Article API endpoints
export const ArticlesApi = {
  getAll: () => apiFetch<Article[]>('/articles')
    .then(data => data.map((item: any) => Article.parse(item))),
  
  getById: (id: string) => 
    apiFetch<Article>(`/articles/${id}`)
      .then(data => Article.parse(data)),
  
  create: (article: Article) => 
    apiFetch<Article>('/articles', {
      method: 'POST',
      body: JSON.stringify(article.toJSON()),
    }).then(data => Article.parse(data)),
  
  update: (id: string, article: Article) => 
    apiFetch<Article>(`/articles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(article.toJSON()),
    }).then(data => Article.parse(data)),
  
  delete: (id: string) => 
    apiFetch<boolean>(`/articles/${id}`, {
      method: 'DELETE',
    }),
};

// Auth API endpoints
export const AuthApi = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/admin/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Authentication failed');
    }
    
    return response.json();
  }
};

// Export all API endpoints
export default {
  events: EventsApi,
  activities: ActivitiesApi,
  articles: ArticlesApi,
  auth: AuthApi,
};