import Event from '@common/models/Event';
import { parseEvents } from '@common/utils';
import { cache, TTL } from '@config/cache';
import db from '@config/firebase';

// Collection references
const eventsCollection = db.collection('events');


/**
 * Get all events
 */
export const getEvents = async () => {
    const cachedEvents = cache.get("events");

    if (cachedEvents) {
        console.log(`📦 Serving cached events`);
        return cachedEvents as Event[];
    }
    console.log(`🔥 Database: Fetching all events`);
    const snapshot = await eventsCollection.get();
    const events = parseEvents(snapshot.docs.map(doc => doc.data()));

    cache.set("events", events, TTL.EVENTS);

    return events;
};

/**
 * Get event by ID
 */
export const getEventById = async (eventId: string) => {
    const cachedEvent = cache.get(`events-${eventId}`);

    if (cachedEvent) {
        console.log(`📦 Serving cached event ${eventId}`);
        return cachedEvent as Event;
    }

    console.log(`🔥 Database: Fetching event by ID: ${eventId}`);
    const doc = await eventsCollection.doc(eventId).get();
    
    if (!doc.exists) return null;

    const eventData = Event.parse(doc.data());
    cache.set(`events-${eventId}`, eventData, TTL.EVENTS);
    
    return eventData;
};

/**
 * Create new event
 */
export const createEvent = async (eventData: any) => {
    const event = Event.parse(eventData);
    const eventDoc = eventsCollection.doc(event.id);
    
    console.log(`🔥 Database: Creating new event with ID: ${event.id}`);
    await eventDoc.set(event.toJSON());

    const cachedEvents = (cache.get("events") || []) as Event[];
    cache.set(`events-${event.id}`, event, TTL.EVENTS);
    cache.set("events", [event, ...cachedEvents], TTL.EVENTS);
    
    return event;
};

/**
 * Update existing event
 */
export const updateEvent = async (eventId: string, eventData: any) => {
    const event = Event.parse(eventData);
    const eventDoc = eventsCollection.doc(event.id);
    
    console.log(`🔥 Database: Updating event with ID: ${event.id}`);
    await eventDoc.update(event.toJSON());

    const cachedEvents = (cache.get("events") || []) as Event[];

    const updatedEvents = cachedEvents.map(cachedEvent => {
        if (cachedEvent.id === eventId) {
            return { ...cachedEvent, ...event }; // Merge properties
        }
        return cachedEvent;
    });

    cache.set(`events-${eventId}`, event, TTL.EVENTS);
    cache.set("events", updatedEvents, TTL.EVENTS);

    return event;
};

/**
 * Delete event
 */
export const deleteEvent = async (eventId: string) => {
    const eventDoc = eventsCollection.doc(eventId);
    console.log(`🔥 Database: Fetching event for deletion with ID: ${eventId}`);
    const doc = await eventDoc.get();
    
    if (!doc.exists) return false;
    
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
    console.log(`🔥 Database: Committing batch delete for event with ID: ${eventId}`);
    batch.delete(eventDoc);
    await batch.commit();

    let cachedEvents = (cache.get("events") || []) as Event[];
    cachedEvents = cachedEvents.filter(event => event.id !== eventId);
    cache.set("events", cachedEvents, TTL.EVENTS);
    
    return true;
};
