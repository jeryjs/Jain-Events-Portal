import db from '@config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { cache, TTL } from '@config/cache';

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
        return cachedActivities;
    }

    const snapshot = await activitiesCollection(eventId).get();
    const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        eventId,
        ...doc.data()
    }));

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
        return cachedActivity;
    }

    const doc = await activitiesCollection(eventId).doc(activityId).get();
    
    if (!doc.exists) return null;

    const activityData = {
        id: doc.id,
        eventId,
        ...doc.data()
    };

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
    
    const { id, eventId: _, ...dataToStore } = activityData;
    
    if (dataToStore.date) {
        dataToStore.date = dataToStore.date instanceof Date ? 
            dataToStore.date : new Date(dataToStore.date);
    }
    
    await activityDoc.set(dataToStore);
    
    return {
        id: activityId,
        eventId,
        ...dataToStore
    };
};

/**
 * Update existing activity
 */
export const updateActivity = async (eventId: string, activityId: string, activityData: any) => {
    const activityDoc = activitiesCollection(eventId).doc(activityId);
    const doc = await activityDoc.get();
    
    if (!doc.exists) return null;
    
    const { id, eventId: _, ...dataToUpdate } = activityData;
    
    if (dataToUpdate.date) {
        dataToUpdate.date = dataToUpdate.date instanceof Date ? 
            dataToUpdate.date : new Date(dataToUpdate.date);
    }
    
    await activityDoc.update(dataToUpdate);
    
    const updatedDoc = await activityDoc.get();
    return {
        id: activityId,
        eventId,
        ...updatedDoc.data()
    };
};

/**
 * Delete activity
 */
export const deleteActivity = async (eventId: string, activityId: string) => {
    const activityDoc = activitiesCollection(eventId).doc(activityId);
    const doc = await activityDoc.get();
    
    if (!doc.exists) return false;
    
    await activityDoc.delete();
    return true;
};
