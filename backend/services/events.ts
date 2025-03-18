import Event from '@common/models/Event';
import { parseEvents } from '@common/utils';
import { cache, TTL } from '@config/cache';
import db from '@config/firebase';
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
export const getEvents = async () => {
  return getCachedCollection<Event>({
    key: COLLECTION_KEY,
    fetchFn: async () => {
      const snapshot = await eventsCollection.get();
      return parseEvents(snapshot.docs.map(doc => doc.data()));
    },
    ttl: TTL.EVENTS
  });
};

/**
 * Get event by ID
 */
export const getEventById = async (eventId: string) => {
  return getCachedItem<Event>({
    key: `${ITEM_KEY_PREFIX}-${eventId}`,
    fetchFn: async () => {
      const doc = await eventsCollection.doc(eventId).get();
      if (!doc.exists) return null;
      return Event.parse(doc.data());
    },
    ttl: TTL.EVENTS
  });
};

/**
 * Create new event
 */
export const createEvent = async (eventData: any) => {
  const event = Event.parse(eventData);
  
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
export const updateEvent = async (eventId: string, eventData: any) => {
  const event = Event.parse(eventData);
  
  return updateCachedItem<Event>({
    item: event,
    collectionKey: COLLECTION_KEY,
    itemKeyPrefix: ITEM_KEY_PREFIX,
    updateFn: async (item) => {
      await eventsCollection.doc(item.id).update(item.toJSON());
    },
    ttl: TTL.EVENTS
  });
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
