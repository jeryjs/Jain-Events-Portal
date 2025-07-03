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
exports.invalidateEventsCache = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventById = exports.getEvents = void 0;
const Event_1 = __importDefault(require("@common/models/Event"));
const utils_1 = require("@common/utils");
const cache_1 = require("@config/cache");
const firebase_1 = require("@config/firebase");
const cacheUtils_1 = require("@utils/cacheUtils");
// Collection references
const eventsCollection = firebase_1.db.collection('events');
const COLLECTION_KEY = "events";
const ITEM_KEY_PREFIX = "events";
/**
 * Get all events
 */
const getEvents = () => __awaiter(void 0, void 0, void 0, function* () {
    return (0, cacheUtils_1.getCachedCollection)({
        key: COLLECTION_KEY,
        fetchFn: () => __awaiter(void 0, void 0, void 0, function* () {
            const snapshot = yield eventsCollection.get();
            return (0, utils_1.parseEvents)(snapshot.docs.map(doc => doc.data()));
        }),
        ttl: cache_1.TTL.EVENTS
    });
});
exports.getEvents = getEvents;
/**
 * Get event by ID
 */
const getEventById = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, cacheUtils_1.getCachedItem)({
        key: `${ITEM_KEY_PREFIX}-${eventId}`,
        fetchFn: () => __awaiter(void 0, void 0, void 0, function* () {
            const doc = yield eventsCollection.doc(eventId).get();
            if (!doc.exists)
                return null;
            return Event_1.default.parse(doc.data());
        }),
        ttl: cache_1.TTL.EVENTS
    });
});
exports.getEventById = getEventById;
/**
 * Create new event
 */
const createEvent = (eventData) => __awaiter(void 0, void 0, void 0, function* () {
    const event = Event_1.default.parse(eventData);
    (0, firebase_1.sendPushNotificationToAllUsers)(`New Event: ${event.name}`, `Check out the new event: ${event.name}`);
    return (0, cacheUtils_1.createCachedItem)({
        item: event,
        collectionKey: COLLECTION_KEY,
        itemKeyPrefix: ITEM_KEY_PREFIX,
        saveFn: (item) => __awaiter(void 0, void 0, void 0, function* () {
            yield eventsCollection.doc(item.id).set(item.toJSON());
        }),
        ttl: cache_1.TTL.EVENTS
    });
});
exports.createEvent = createEvent;
/**
 * Update existing event
 */
const updateEvent = (eventId, eventData) => __awaiter(void 0, void 0, void 0, function* () {
    const event = Event_1.default.parse(eventData);
    return (0, cacheUtils_1.updateCachedItem)({
        item: event,
        collectionKey: COLLECTION_KEY,
        itemKeyPrefix: ITEM_KEY_PREFIX,
        updateFn: (item) => __awaiter(void 0, void 0, void 0, function* () {
            yield eventsCollection.doc(item.id).update(item.toJSON());
        }),
        ttl: cache_1.TTL.EVENTS
    });
});
exports.updateEvent = updateEvent;
/**
 * Delete event
 */
const deleteEvent = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const eventDoc = eventsCollection.doc(eventId);
    const doc = yield eventDoc.get();
    if (!doc.exists)
        return false;
    return (0, cacheUtils_1.deleteCachedItem)({
        id: eventId,
        collectionKey: COLLECTION_KEY,
        itemKeyPrefix: ITEM_KEY_PREFIX,
        deleteFn: () => __awaiter(void 0, void 0, void 0, function* () {
            // Delete all activities/subCollections first
            const eventSubCollections = yield eventDoc.listCollections();
            const batch = firebase_1.db.batch();
            yield Promise.all(eventSubCollections.map((collection) => __awaiter(void 0, void 0, void 0, function* () {
                console.log(`🔥 Database: Deleting subcollection from event with ID: ${eventId}`);
                const collectionDocs = yield collection.get();
                collectionDocs.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
            })));
            // Then delete the event itself
            batch.delete(eventDoc);
            yield batch.commit();
        }),
        ttl: cache_1.TTL.EVENTS
    });
});
exports.deleteEvent = deleteEvent;
/**
 * Invalidate cache for all events
 */
const invalidateEventsCache = () => {
    cache_1.cache.del(COLLECTION_KEY);
    cache_1.cache.keys().forEach(key => {
        if (key.startsWith(ITEM_KEY_PREFIX)) {
            cache_1.cache.del(key);
        }
    });
    console.log("Cache invalidated successfully for events!");
    return "Cache invalidated successfully for events!";
};
exports.invalidateEventsCache = invalidateEventsCache;
