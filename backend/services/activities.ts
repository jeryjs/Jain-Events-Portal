import db from '@config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { cache, TTL } from '@config/cache';
import { Activity } from '@common/models';
import { parseActivities } from '@common/utils';
import { 
  getCachedItem, 
  getCachedCollection, 
  createCachedItem, 
  updateCachedItem, 
  deleteCachedItem 
} from '@utils/cacheUtils';

// Collection references
const eventsCollection = db.collection('events');
const activitiesCollection = (eventId: string) => eventsCollection.doc(eventId).collection('activities');

/**
 * Get all activities for an event
 */
export const getActivities = async (eventId: string) => {
  const collectionKey = `activities-${eventId}`;
  
  return getCachedCollection<Activity>({
    key: collectionKey,
    fetchFn: async () => {
      const snapshot = await activitiesCollection(eventId).get();
      return parseActivities(snapshot.docs.map(doc => doc.data()));
    },
    ttl: TTL.ACTIVITIES
  });
};

/**
 * Get specific activity by ID
 */
export const getActivityById = async (eventId: string, activityId: string) => {
  return getCachedItem<Activity>({
    key: `activities-${eventId}-${activityId}`,
    fetchFn: async () => {
      const doc = await activitiesCollection(eventId).doc(activityId).get();
      if (!doc.exists) return null;
      return Activity.parse(doc.data());
    },
    ttl: TTL.ACTIVITIES
  });
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
  activityData.id = activityId;
  
  return createCachedItem<Activity>({
    item: activityData,
    collectionKey: `activities-${eventId}`,
    itemKeyPrefix: `activities-${eventId}`,
    saveFn: async (item) => {
      await activitiesCollection(eventId).doc(activityId).set(item);
    },
    ttl: TTL.ACTIVITIES
  });
};

/**
 * Update existing activity
 */
export const updateActivity = async (eventId: string, activityId: string, activityData: any) => {
  const activityDoc = activitiesCollection(eventId).doc(activityId);
  const doc = await activityDoc.get();
  
  if (!doc.exists) return null;
  
  // Ensure the ID is set correctly
  activityData.id = activityId;
  
  return updateCachedItem<Activity>({
    item: activityData,
    collectionKey: `activities-${eventId}`,
    itemKeyPrefix: `activities-${eventId}`,
    updateFn: async (item) => {
      await activityDoc.update(activityData);
    },
    ttl: TTL.ACTIVITIES
  });
};

/**
 * Delete activity
 */
export const deleteActivity = async (eventId: string, activityId: string) => {
  const activityDoc = activitiesCollection(eventId).doc(activityId);
  
  return deleteCachedItem<Activity>({
    id: activityId,
    collectionKey: `activities-${eventId}`,
    itemKeyPrefix: `activities-${eventId}`,
    deleteFn: async () => {
      await activityDoc.delete();
    },
    ttl: TTL.ACTIVITIES
  });
};