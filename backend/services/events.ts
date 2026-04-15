// Assign managers to an event (admin only)
export const assignManagersToEvent = async (eventId: string, managers: string[]) => {
  // Store managers as an array of usernames/emails in the event document
  await eventsCollection.doc(eventId).update({ managers });
  cache.del(`${ITEM_KEY_PREFIX}-${eventId}`);
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
import Event from '@common/models/Event';
import { parseEvents } from '@common/utils';
import { cache, TTL } from '@config/cache';
import { db, sendPushNotificationToAllUsers } from '@config/firebase';
import { 
  getCachedItem, 
  getCachedCollection, 
  createCachedItem, 
  updateCachedItem, 
  deleteCachedItem 
} from '@utils/cacheUtils';

// Collection references
const eventsCollection = db.collection('events');
const COLLECTION_KEY = "events";
const ITEM_KEY_PREFIX = "events";

/**
 * Get all events
 */
// Helper to filter sensitive fields
function filterEventForUser(event: any, user?: { role: number, username: string }) {
  // Only admins or managers for this event can see managers field
  if (!user || (user.role < 100 && !(event.managers && event.managers.includes(user.username)))) {
    const { managers, ...rest } = event;
    return rest;
  }
  return event;
}

export const getEvents = async (user?: { role: number, username: string }) => {
  return getCachedCollection<Event>({
    key: COLLECTION_KEY,
    fetchFn: async () => {
      const snapshot = await eventsCollection.get();
      return parseEvents(snapshot.docs.map(doc => filterEventForUser(doc.data(), user)));
    },
    ttl: TTL.EVENTS
  });
};

/**
 * Get event by ID
 */
export const getEventById = async (eventId: string, user?: { role: number, username: string }) => {
  return getCachedItem<Event>({
    key: `${ITEM_KEY_PREFIX}-${eventId}`,
    fetchFn: async () => {
      const doc = await eventsCollection.doc(eventId).get();
      if (!doc.exists) return null;
      return Event.parse(filterEventForUser(doc.data(), user));
    },
    ttl: TTL.EVENTS
  });
};

/**
 * Create new event
 */
export const createEvent = async (eventData: any) => {
  const event = Event.parse(eventData);

  sendPushNotificationToAllUsers(`New Event: ${event.name}`, `Check out the new event: ${event.name}`);
  
  return createCachedItem<Event>({
    item: event,
    collectionKey: COLLECTION_KEY,
    itemKeyPrefix: ITEM_KEY_PREFIX,
    saveFn: async (item) => {
      await eventsCollection.doc(item.id).set(item.toJSON());
    },
    ttl: TTL.EVENTS
  });
};

/**
 * Update existing event
 */
export const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
  // Only update provided fields (patch)
  await eventsCollection.doc(eventId).update(eventData);
  // Invalidate cache for this event
  cache.del(`${ITEM_KEY_PREFIX}-${eventId}`);
  return (await eventsCollection.doc(eventId).get()).data();
};

/**
 * Delete event
 */
export const deleteEvent = async (eventId: string) => {
  const eventDoc = eventsCollection.doc(eventId);
  const doc = await eventDoc.get();
  
  if (!doc.exists) return false;
  
  return deleteCachedItem<Event>({
    id: eventId,
    collectionKey: COLLECTION_KEY,
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
};

/**
 * Invalidate cache for all events
 */
export const invalidateEventsCache = () => {
  cache.del(COLLECTION_KEY);
  cache.keys().forEach(key => {
    if (key.startsWith(ITEM_KEY_PREFIX)) {
      cache.del(key);
    }
  });
  console.log("Cache invalidated successfully for events!");
  return "Cache invalidated successfully for events!";
};