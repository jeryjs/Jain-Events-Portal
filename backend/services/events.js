const db = require('../config/firebase');
const Event = require('@common/models/Event').default;
const { cache, TTL } = require('../config/cache');
const { parseActivity } = require('@common/utils');

const getEvents = async () => {
    const cachedEvents = cache.get("events");

    if (cachedEvents) {
        console.log(`📦 Serving cached events`);
        return cachedEvents;
    }

    const snapshot = await db.collection("events").get();
    const events = snapshot.docs.map(doc => {
        const data = doc.data();
        return new Event(data.id, data.name, data.type);
    });
    
    cache.set("events", events, TTL.EVENTS);
    return events;
};

const getActivities = async (eventId) => {
    const cacheKey = `activities_${eventId}`;
    const cachedActivities = cache.get(cacheKey);

    if (cachedActivities) {
        console.log(`📦 Serving cached activities for event ${eventId}`);
        return cachedActivities;
    }

    const snapshot = await db.collection("events").doc(eventId).collection("activities").get();
    const activities = snapshot.docs.map(doc => parseActivity(doc.data()));
    
    cache.set(cacheKey, activities, TTL.EVENTS);
    return activities;
};

module.exports = { getEvents, getActivities };