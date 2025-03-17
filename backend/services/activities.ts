import db from '@config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { cache, TTL } from '@config/cache';
import { Activity } from '@common/models';
import { parseActivities } from '@common/utils';

// Collection references
const eventsCollection = db.collection('events');
const activitiesCollection = (eventId: string) => eventsCollection.doc(eventId).collection('activities');

/**
 * Get all activities for an event
 */
export const getActivities = async (eventId: string) => {
    const cacheKey = `activities-${eventId}`;
    const cachedActivities = cache.get(cacheKey);

    if (cachedActivities) {
        console.log(`📦 Serving cached activities for event ${eventId}`);
        return cachedActivities as Activity[];
    }

    console.log(`🔥 Database: Fetching all activities for event ID: ${eventId}`);
    const snapshot = await activitiesCollection(eventId).get();
    const activities = parseActivities(snapshot.docs.map(doc => doc.data()));

    cache.set(cacheKey, activities, TTL.ACTIVITIES);

    return activities;
};

/**
 * Get specific activity by ID
 */
export const getActivityById = async (eventId: string, activityId: string) => {
    const cacheKey = `activities-${eventId}-${activityId}`;
    const cachedActivity = cache.get(cacheKey);

    if (cachedActivity) {
        console.log(`📦 Serving cached activity ${activityId}`);
        return cachedActivity as Activity;
    }

    console.log(`🔥 Database: Fetching activity by ID: ${activityId} for event ID: ${eventId}`);
    const doc = await activitiesCollection(eventId).doc(activityId).get();
    
    if (!doc.exists) return null;

    const activityData = Activity.parse(doc.data());
    cache.set(cacheKey, activityData, TTL.ACTIVITIES);
    
    return activityData;
};

/**
 * Create new activity for an event
 */
export const createActivity = async (eventId: string, activityData: any) => {
    const eventDoc = await eventsCollection.doc(eventId).get();
    
    if (!eventDoc.exists) {
        throw new Error(`Event ${eventId} does not exist`);
    }
    
    const activityId = activityData.id || uuidv4();
    const activityDoc = activitiesCollection(eventId).doc(activityId);
    
    console.log(`🔥 Database: Creating new activity with ID: ${activityId} for event ID: ${eventId}`);
    await activityDoc.set(activityData);

    const cacheKey = `activities-${eventId}`;
    const cachedActivities = (cache.get(cacheKey) || []) as Activity[];

    cache.set(`activities-${eventId}-${activityId}`, activityData, TTL.ACTIVITIES);
    cache.set(cacheKey, [activityData, ...cachedActivities], TTL.ACTIVITIES);
    
    return activityData;
};

/**
 * Update existing activity
 */
export const updateActivity = async (eventId: string, activityId: string, activityData: any) => {
    const activityDoc = activitiesCollection(eventId).doc(activityId);
    console.log(`🔥 Database: Updating activity with ID: ${activityId} for event ID: ${eventId}`);
    const doc = await activityDoc.get();
    
    if (!doc.exists) return null;
    
    await activityDoc.update(activityData);
    
    const cacheKey = `activities-${eventId}`;
    const cachedActivities = (cache.get(cacheKey) || []) as Activity[];

    const updatedActivities = cachedActivities.map(activity => {
        if (activity.id === activityId) {
            return { ...activity, ...activityData };
        }
        return activity;
    });

    cache.set(`activities-${eventId}-${activityId}`, activityData, TTL.ACTIVITIES);
    cache.set(cacheKey, updatedActivities, TTL.ACTIVITIES);

    return activityData;
};

/**
 * Delete activity
 */
export const deleteActivity = async (eventId: string, activityId: string) => {
    const activityDoc = activitiesCollection(eventId).doc(activityId);
    console.log(`🔥 Database: Deleting activity with ID: ${activityId} for event ID: ${eventId}`);
    
    await activityDoc.delete();    

    const cacheKey = `activities-${eventId}`;
    let cachedActivities = (cache.get(cacheKey) || []) as Activity[];
    cachedActivities = cachedActivities.filter(activity => activity.id !== activityId);

    cache.del(`activities-${eventId}-${activityId}`); 
    cache.set(cacheKey, cachedActivities, TTL.ACTIVITIES);

    return true;
};