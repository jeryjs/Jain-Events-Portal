"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteActivity = exports.updateActivity = exports.createActivity = exports.getActivityById = exports.getActivities = void 0;
const firebase_1 = __importDefault(require("@config/firebase"));
const uuid_1 = require("uuid");
const cache_1 = require("@config/cache");
const models_1 = require("@common/models");
const utils_1 = require("@common/utils");
// Collection references
const eventsCollection = firebase_1.default.collection('events');
const activitiesCollection = (eventId) => eventsCollection.doc(eventId).collection('activities');
/**
 * Get all activities for an event
 */
const getActivities = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `activities-${eventId}`;
    const cachedActivities = cache_1.cache.get(cacheKey);
    if (cachedActivities) {
        console.log(`📦 Serving cached activities for event ${eventId}`);
        return cachedActivities;
    }
    const snapshot = yield activitiesCollection(eventId).get();
    const activities = (0, utils_1.parseActivities)(snapshot.docs.map(doc => doc.data()));
    cache_1.cache.set(cacheKey, activities, cache_1.TTL.ACTIVITIES);
    return activities;
});
exports.getActivities = getActivities;
/**
 * Get specific activity by ID
 */
const getActivityById = (eventId, activityId) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `activities-${eventId}-${activityId}`;
    const cachedActivity = cache_1.cache.get(cacheKey);
    if (cachedActivity) {
        console.log(`📦 Serving cached activity ${activityId}`);
        return cachedActivity;
    }
    const doc = yield activitiesCollection(eventId).doc(activityId).get();
    if (!doc.exists)
        return null;
    const activityData = models_1.Activity.parse(doc.data());
    cache_1.cache.set(cacheKey, activityData, cache_1.TTL.ACTIVITIES);
    return activityData;
});
exports.getActivityById = getActivityById;
/**
 * Create new activity for an event
 */
const createActivity = (eventId, activityData) => __awaiter(void 0, void 0, void 0, function* () {
    const eventDoc = yield eventsCollection.doc(eventId).get();
    if (!eventDoc.exists) {
        throw new Error(`Event ${eventId} does not exist`);
    }
    const activityId = activityData.id || (0, uuid_1.v4)();
    const activityDoc = activitiesCollection(eventId).doc(activityId);
    yield activityDoc.set(activityData);
    // updateActivitiesCache(eventId, activityId, dataToStore);
    cache_1.cache.set(`activities-${eventId}-${activityId}`, activityData, cache_1.TTL.ACTIVITIES);
    cache_1.cache.del(`activities-${eventId}`);
    return activityData;
});
exports.createActivity = createActivity;
/**
 * Update existing activity
 */
const updateActivity = (eventId, activityId, activityData) => __awaiter(void 0, void 0, void 0, function* () {
    const activityDoc = activitiesCollection(eventId).doc(activityId);
    const doc = yield activityDoc.get();
    if (!doc.exists)
        return null;
    yield activityDoc.update(activityData);
    // updateActivitiesCache(eventId, activityId, updatedDoc.data());
    cache_1.cache.set(`activities-${eventId}-${activityId}`, activityData, cache_1.TTL.ACTIVITIES);
    cache_1.cache.del(`activities-${eventId}`);
    return activityData;
});
exports.updateActivity = updateActivity;
/**
 * Delete activity
 */
const deleteActivity = (eventId, activityId) => __awaiter(void 0, void 0, void 0, function* () {
    const activityDoc = activitiesCollection(eventId).doc(activityId);
    yield activityDoc.delete();
    cache_1.cache.del(`activities-${eventId}-${activityId}`);
    cache_1.cache.del(`activities-${eventId}`);
    return true;
});
exports.deleteActivity = deleteActivity;
// cache utility function
const updateActivitiesCache = (eventId, activityId, data) => {
    const cacheKey = `activities-${eventId}`;
    const cachedActivities = (cache_1.cache.get(cacheKey) || []);
    const updatedActivities = cachedActivities.map(activity => {
        if (activity.id === activityId) {
            return Object.assign(Object.assign({}, activity), data);
        }
        return activity;
    });
    cache_1.cache.set(`${cacheKey}-${activityId}`, data, cache_1.TTL.ACTIVITIES);
    cache_1.cache.set(cacheKey, updatedActivities, cache_1.TTL.ACTIVITIES);
};
