import { ItemVisibility, Role } from '@common/constants';
import Event from '@common/models/Event';
import { parseEvents } from '@common/utils';
import { cache, TTL } from '@config/cache';
import { db, sendPushNotificationToAllUsers } from '@config/firebase';
import { 
  getCachedItem, 
  getCachedCollection, 
  createCachedItem, 
  deleteCachedItem 
} from '@utils/cacheUtils';

type RequestUser = { role: number; username: string };

// Collection references
const eventsCollection = db.collection('events');
const COLLECTION_KEY = "events";
const ITEM_KEY_PREFIX = "events";

const getUserScope = (user?: RequestUser) => user ? `${user.role}-${user.username}` : 'guest';
const getCollectionKey = (user?: RequestUser) => `${COLLECTION_KEY}-${getUserScope(user)}`;
const getItemKey = (eventId: string, user?: RequestUser) => `${ITEM_KEY_PREFIX}-${eventId}-${getUserScope(user)}`;

const isVisibleToUser = (event: any, user?: RequestUser) => {
  if (event?.visibility !== ItemVisibility.PRIVATE) return true;
  return (user?.role ?? Role.GUEST) >= Role.ADMIN;
};

/**
 * Get all events
 */
// Helper to filter sensitive fields
function filterEventForUser(event: any, user?: RequestUser) {
  if (!isVisibleToUser(event, user)) {
    return null;
  }

  // Only admins or managers for this event can see managers field
  if (!user || (user.role < Role.ADMIN && !(event.managers && event.managers.includes(user.username)))) {
    const { managers, ...rest } = event;
    return rest;
  }
  return event;
}

export const getEvents = async (user?: RequestUser) => {
  return getCachedCollection<Event>({
    key: getCollectionKey(user),
    fetchFn: async () => {
      const snapshot = await eventsCollection.get();
      const filteredEvents = snapshot.docs
        .map(doc => filterEventForUser(doc.data(), user))
        .filter(Boolean);

      return parseEvents(filteredEvents);
    },
    ttl: TTL.EVENTS
  });
};

/**
 * Get event by ID
 */
export const getEventById = async (eventId: string, user?: RequestUser) => {
  return getCachedItem<Event>({
    key: getItemKey(eventId, user),
    fetchFn: async () => {
      const doc = await eventsCollection.doc(eventId).get();
      if (!doc.exists) return null;

      const filteredEvent = filterEventForUser(doc.data(), user);
      if (!filteredEvent) return null;

      return Event.parse(filteredEvent);
    },
    ttl: TTL.EVENTS
  });
};

// Assign managers to an event (admin only)
export const assignManagersToEvent = async (eventId: string, managers: string[]) => {
  // Store managers as an array of usernames/emails in the event document
  await eventsCollection.doc(eventId).update({ managers });
  cache.keys().forEach(key => {
    if (key.startsWith(`${ITEM_KEY_PREFIX}-${eventId}-`) || key.startsWith(`${COLLECTION_KEY}-`)) {
      cache.del(key);
    }
  });
};

// Get managers for an event
export const getEventManagers = async (eventId: string): Promise<string[]> => {
  const doc = await eventsCollection.doc(eventId).get();
  if (!doc.exists) return [];
  const data = doc.data();
  return data?.managers || [];
};

// Check if a user is a manager for an event
export const isUserEventManager = async (eventId: string, username: string): Promise<boolean> => {
  const managers = await getEventManagers(eventId);
  return managers.includes(username);
};

/**
 * Create new event
 */
export const createEvent = async (eventData: any) => {
  const event = Event.parse(eventData);

  sendPushNotificationToAllUsers(`New Event: ${event.name}`, `Check out the new event: ${event.name}`);
  
  const created = await createCachedItem<Event>({
    item: event,
    collectionKey: `${COLLECTION_KEY}-guest`,
    itemKeyPrefix: ITEM_KEY_PREFIX,
    saveFn: async (item) => {
      await eventsCollection.doc(item.id).set(item.toJSON());
    },
    ttl: TTL.EVENTS
  });

  invalidateEventsCache();
  return created;
};

/**
 * Update existing event
 */
export const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
  // Only update provided fields (patch)
  await eventsCollection.doc(eventId).update(eventData);

  // Invalidate all scoped caches for this event and collection views
  cache.keys().forEach(key => {
    if (key.startsWith(`${ITEM_KEY_PREFIX}-${eventId}-`) || key.startsWith(`${COLLECTION_KEY}-`)) {
      cache.del(key);
    }
  });

  return (await eventsCollection.doc(eventId).get()).data();
};

/**
 * Delete event
 */
export const deleteEvent = async (eventId: string) => {
  const eventDoc = eventsCollection.doc(eventId);
  const doc = await eventDoc.get();
  
  if (!doc.exists) return false;
  
  const deleted = await deleteCachedItem<Event>({
    id: eventId,
    collectionKey: `${COLLECTION_KEY}-guest`,
    itemKeyPrefix: ITEM_KEY_PREFIX,
    deleteFn: async () => {
      // Delete all activities/subCollections first
      const eventSubCollections = await eventDoc.listCollections();
      const batch = db.batch();
      await Promise.all(eventSubCollections.map(async collection => {
        console.log(`🔥 Database: Deleting subcollection from event with ID: ${eventId}`);
        const collectionDocs = await collection.get();
        collectionDocs.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      }));
      
      // Then delete the event itself
      batch.delete(eventDoc);
      await batch.commit();
    },
    ttl: TTL.EVENTS
  });

  invalidateEventsCache();
  return deleted;
};

/**
 * Invalidate cache for all events
 */
export const invalidateEventsCache = () => {
  cache.keys().forEach(key => {
    if (key.startsWith(ITEM_KEY_PREFIX) || key.startsWith(COLLECTION_KEY)) {
      cache.del(key);
    }
  });
  console.log("Cache invalidated successfully for events!");
  return "Cache invalidated successfully for events!";
};