import { Event, Activity } from '@common/models';

// Backend-specific type extensions
export interface EventWithId extends Event {
  id: string;
}

export interface ActivityWithId extends Activity {
  id: string;
  eventId: string;
}

// Request body types
export interface CreateEventRequest {
  id?: string;
  name: string;
  type: string;
  timings: Date[] | string[];
  description: string;
  venue: string;
  heroImage?: {
    url?: string;
    position?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    showHero?: boolean;
  };
}

export interface UpdateEventRequest {
  name?: string;
  type?: string;
  timings?: Date[] | string[];
  description?: string;
  venue?: string;
  heroImage?: {
    url?: string;
    position?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    showHero?: boolean;
  };
}

export interface CreateActivityRequest {
  id?: string;
  name: string;
  type: string;
  description: string;
  date: Date | string;
  location: string;
  maxParticipants?: number;
  currentParticipants?: number;
  isRegistrationOpen?: boolean;
}

export interface UpdateActivityRequest {
  name?: string;
  type?: string;
  description?: string;
  date?: Date | string;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  isRegistrationOpen?: boolean;
}
