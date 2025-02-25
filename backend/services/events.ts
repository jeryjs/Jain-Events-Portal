import db from '@config/firebase';
import { cache, TTL } from '@config/cache';
import Event from '@common/models/Event';
import Activity from '@common/models/Activity';
import { parseActivity } from '@common/utils';

const getEvents = async (): Promise<Event[]> => {
    const cachedEvents = cache.get("events");

    if (cachedEvents) {
        console.log(`📦 Serving cached events`);
        return cachedEvents as Event[];
    }

    const snapshot = await db.collection("events").get();
    const events = snapshot.docs.map((doc: any) => Event.parse(doc.data()));
    
    cache.set("events", events, TTL.EVENTS);
    return events;
};

const getActivities = async (eventId: string): Promise<Activity[]> => {
    const cacheKey = `activities_${eventId}`;
    const cachedActivities = cache.get(cacheKey);

    if (cachedActivities) {
        console.log(`📦 Serving cached activities for event '${eventId}'`);
        return cachedActivities as Activity[];
    }

    const snapshot = await db.collection("events").doc(eventId).collection("activities").get();
    const activities = snapshot.docs.map((doc: any) => parseActivity(doc.data()));
    
    cache.set(cacheKey, activities, TTL.EVENTS);
    return activities;
};

export { getEvents, getActivities };