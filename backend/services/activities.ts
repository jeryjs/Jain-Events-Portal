import db from '@config/firebase';
import { randomUUID } from 'crypto';
import { cache, TTL } from '@config/cache';
import { Activity, CulturalActivity } from '@common/models';
import { ItemVisibility, Role } from '@common/constants';
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

type RequestUser = { role: number; username: string };

const getVisibilityScope = (user?: RequestUser) => ((user?.role ?? Role.GUEST) >= Role.ADMIN ? 'admin' : 'public');
const getCollectionKey = (eventId: string, user?: RequestUser) => `activities-${eventId}-${getVisibilityScope(user)}`;
const getItemKey = (eventId: string, activityId: string, user?: RequestUser) => `activities-${eventId}-${activityId}-${getVisibilityScope(user)}`;

const filterActivityForUser = (activity: any, user?: RequestUser) => {
  if (activity?.visibility === ItemVisibility.PRIVATE && (user?.role ?? Role.GUEST) < Role.ADMIN) {
    return null;
  }
  return activity;
};

/**
 * Get all activities for an event
 */
export const getActivities = async (eventId: string, user?: RequestUser) => {
  const collectionKey = getCollectionKey(eventId, user);
  
  return getCachedCollection<Activity>({
    key: collectionKey,
    fetchFn: async () => {
      const snapshot = await activitiesCollection(eventId).get();
      return parseActivities(
        snapshot.docs
          .map(doc => filterActivityForUser(doc.data(), user))
          .filter(Boolean)
      );
    },
    ttl: TTL.ACTIVITIES
  });
};

/**
 * Get specific activity by ID
 */
export const getActivityById = async (eventId: string, activityId: string, user?: RequestUser) => {
  return getCachedItem<Activity>({
    key: getItemKey(eventId, activityId, user),
    fetchFn: async () => {
      const doc = await activitiesCollection(eventId).doc(activityId).get();
      if (!doc.exists) return null;
      const filtered = filterActivityForUser(doc.data(), user);
      if (!filtered) return null;
      return Activity.parse(filtered);
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
  
  const activityId = activityData.id || randomUUID();
  activityData.id = activityId;
  activityData.visibility = activityData.visibility || ItemVisibility.PUBLIC;
  
  const created = await createCachedItem<Activity>({
    item: activityData,
    collectionKey: getCollectionKey(eventId),
    itemKeyPrefix: `activities-${eventId}`,
    saveFn: async (item) => {
      await activitiesCollection(eventId).doc(activityId).set(item);
    },
    ttl: TTL.ACTIVITIES
  });

  invalidateActivitiesCache();
  return created;
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
  activityData.visibility = activityData.visibility || ItemVisibility.PUBLIC;
  
  const updated = await updateCachedItem<Activity>({
    item: activityData,
    collectionKey: getCollectionKey(eventId),
    itemKeyPrefix: `activities-${eventId}`,
    updateFn: async (item) => {
      await activityDoc.update(activityData);
    },
    ttl: TTL.ACTIVITIES
  });

  invalidateActivitiesCache();
  return updated;
};

/**
 * Delete activity
 */
export const deleteActivity = async (eventId: string, activityId: string) => {
  const activityDoc = activitiesCollection(eventId).doc(activityId);
  
  const deleted = await deleteCachedItem<Activity>({
    id: activityId,
    collectionKey: getCollectionKey(eventId),
    itemKeyPrefix: `activities-${eventId}`,
    deleteFn: async () => {
      await activityDoc.delete();
    },
    ttl: TTL.ACTIVITIES
  });

  invalidateActivitiesCache();
  return deleted;
};

/*
 * Invalidate cache for activities
 */
export const invalidateActivitiesCache = async () => {
  cache.keys().forEach(key => {
    if (key.startsWith('activities-')) {
      cache.del(key);
    }
  });
  console.log("Cache invalidated successfully for activities!");
  return "Cache invalidated successfully for activities!";
};

/**
 * Get poll results for an activity
 */
export const getPollResults = async (eventId: string, activityId: string, user?: RequestUser) => {
  const activityKey = getItemKey(eventId, activityId, user);
  
  // Get activity with poll data
  const activity = await getCachedItem<Activity>({
    key: activityKey,
    fetchFn: async () => {
      const doc = await activitiesCollection(eventId).doc(activityId).get();
      if (!doc.exists) return null;
      const filtered = filterActivityForUser(doc.data(), user);
      if (!filtered) return null;
      return Activity.parse(filtered);
    },
    ttl: TTL.ACTIVITIES
  });

  if (!activity) return null;
  
  if (!(activity instanceof CulturalActivity)) {
    throw new Error(`Invalid activity type for poll results: ${typeof activity}`);
  }
  
  return activity.pollData;
};

/**
 * Cast a vote for a team (or participant)
 */
export const castVote = async (eventId: string, activityId: string, teamId: string, username: string, user?: RequestUser) => {
  const activityKey = getItemKey(eventId, activityId, user);
  const activityDoc = activitiesCollection(eventId).doc(activityId);

  const activity = await getCachedItem<Activity>({
    key: activityKey,
    fetchFn: async () => {
      const doc = await activityDoc.get();
      const data = doc.data();
      if (!data) return null;
      const filtered = filterActivityForUser(data, user);
      if (!filtered) return null;
      return Activity.parse(filtered);
    },
    ttl: TTL.ACTIVITIES
  });

  if (!activity) throw new Error('Activity not found');

  if (!(activity instanceof CulturalActivity)) throw new Error(`Invalid activity type for voting: ${typeof activity}`);
  if (!activity.showPoll) throw new Error('Poll is not enabled for this activity');

  const pollData = activity.pollData;
  
  // First, remove the user's vote from any team they previously voted for
  for (const poll of pollData) {
    const voteIndex = poll.votes.indexOf(username);
    if (voteIndex !== -1) {
      poll.votes.splice(voteIndex, 1);
    }
  }
  
  // Then add the vote to the selected team
  let teamPoll = pollData.find(poll => poll.teamId === teamId);
  if (!teamPoll) {
    teamPoll = { teamId, votes: [] };
    pollData.push(teamPoll);
  }
  
  teamPoll.votes.push(username);
  activity.pollData = pollData;

  await updateCachedItem<CulturalActivity>({
    item: activity,
    collectionKey: getCollectionKey(eventId, user),
    itemKeyPrefix: `activities-${eventId}`,
    updateFn: async (item) => await activityDoc.update(JSON.parse(JSON.stringify(item))),
    ttl: TTL.ACTIVITIES
  });

  invalidateActivitiesCache();
  
  return { 
    success: true, 
    message: 'Vote recorded successfully'
  };
};
