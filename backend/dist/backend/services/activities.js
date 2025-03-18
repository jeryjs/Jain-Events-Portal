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
const cacheUtils_1 = require("@utils/cacheUtils");
// Collection references
const eventsCollection = firebase_1.default.collection('events');
const activitiesCollection = (eventId) => eventsCollection.doc(eventId).collection('activities');
/**
 * Get all activities for an event
 */
const getActivities = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const collectionKey = `activities-${eventId}`;
    return (0, cacheUtils_1.getCachedCollection)({
        key: collectionKey,
        fetchFn: () => __awaiter(void 0, void 0, void 0, function* () {
            const snapshot = yield activitiesCollection(eventId).get();
            return (0, utils_1.parseActivities)(snapshot.docs.map(doc => doc.data()));
        }),
        ttl: cache_1.TTL.ACTIVITIES
    });
});
exports.getActivities = getActivities;
/**
 * Get specific activity by ID
 */
const getActivityById = (eventId, activityId) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, cacheUtils_1.getCachedItem)({
        key: `activities-${eventId}-${activityId}`,
        fetchFn: () => __awaiter(void 0, void 0, void 0, function* () {
            const doc = yield activitiesCollection(eventId).doc(activityId).get();
            if (!doc.exists)
                return null;
            return models_1.Activity.parse(doc.data());
        }),
        ttl: cache_1.TTL.ACTIVITIES
    });
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
    activityData.id = activityId;
    return (0, cacheUtils_1.createCachedItem)({
        item: activityData,
        collectionKey: `activities-${eventId}`,
        itemKeyPrefix: `activities-${eventId}`,
        saveFn: (item) => __awaiter(void 0, void 0, void 0, function* () {
            yield activitiesCollection(eventId).doc(activityId).set(item);
        }),
        ttl: cache_1.TTL.ACTIVITIES
    });
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
    // Ensure the ID is set correctly
    activityData.id = activityId;
    return (0, cacheUtils_1.updateCachedItem)({
        item: activityData,
        collectionKey: `activities-${eventId}`,
        itemKeyPrefix: `activities-${eventId}`,
        updateFn: (item) => __awaiter(void 0, void 0, void 0, function* () {
            yield activityDoc.update(activityData);
        }),
        ttl: cache_1.TTL.ACTIVITIES
    });
});
exports.updateActivity = updateActivity;
/**
 * Delete activity
 */
const deleteActivity = (eventId, activityId) => __awaiter(void 0, void 0, void 0, function* () {
    const activityDoc = activitiesCollection(eventId).doc(activityId);
    return (0, cacheUtils_1.deleteCachedItem)({
        id: activityId,
        collectionKey: `activities-${eventId}`,
        itemKeyPrefix: `activities-${eventId}`,
        deleteFn: () => __awaiter(void 0, void 0, void 0, function* () {
            yield activityDoc.delete();
        }),
        ttl: cache_1.TTL.ACTIVITIES
    });
});
exports.deleteActivity = deleteActivity;
