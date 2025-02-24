import db from '../config/firebase';
import { cache, TTL } from '../config/cache';
// import EventModel from '@common/models/EventModel';
import Activity from '@common/models/Activity';
import {parseActivity} from '../../common/utils';
class EventModel {
	eventId: string;
	name: string;
	eventType: number;
	constructor(eventId: string, name: string, eventType: number) {
		this.eventId = eventId;
		this.name = name;
		// this.activities = activities; // array of Activity (or subclass) instances
		this.eventType = eventType;
	}
}

// export default EventModel;

const getEvents = async (): Promise<EventModel[]> => {
    const cachedEvents = cache.get("events");

    if (cachedEvents) {
        console.log(`📦 Serving cached events`);
        return cachedEvents as EventModel[];
    }

    const snapshot = await db.collection("events").get();
    const events = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return new EventModel(data.id, data.name, data.type);
    });
    
    cache.set("events", events, TTL.EVENTS);
    return events;
};

const getActivities = async (eventId: string): Promise<Activity[]> => {
    const cacheKey = `activities_${eventId}`;
    const cachedActivities = cache.get(cacheKey);

    if (cachedActivities) {
        console.log(`📦 Serving cached activities for event ${eventId}`);
        return cachedActivities as Activity[];
    }

    const snapshot = await db.collection("events").doc(eventId).collection("activities").get();
    const activities = snapshot.docs.map((doc: any) => parseActivity(doc.data()));
    
    cache.set(cacheKey, activities, TTL.EVENTS);
    return activities;
};

export { getEvents, getActivities };