import { Event, Activity, Article } from '@common/models';
import { parseEvents } from '@common/utils';
import config from '#config';

const API_BASE_URL = config.API_BASE_URL;

/**
 * Base fetch function for API calls with authentication
 */
async function apiFetch<T>(url: string, options: RequestInit = {}) {
  try {
    // Get authentication token from storage or context
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    // Ensure headers object exists
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    // Create fetch options, but ensure we don't use include for credentials
    // which would cause CORS errors with wildcard origins
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      // Use 'same-origin' instead of 'include' for credentials
      credentials: 'same-origin',
    };

    const response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401) {
        // Optional: Trigger auth refresh or redirect to login
        console.error('Authentication error: Not authorized to perform this action');
        throw new Error('You are not authorized to perform this action. Please log in again.');
      }
      
      const errorText = await response.text();
      let errorMessage;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // For DELETE requests, responses might be empty
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return { success: true } as T;
    }

    return await response.json() as T;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};

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
  delete: async (eventId: string, activityId: string) => {
    return apiFetch(`/activities/${eventId}/${activityId}`, {
      method: 'DELETE',
    });
  },
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
    const response = await fetch(`${API_BASE_URL}/user/admin/authenticate`, {
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