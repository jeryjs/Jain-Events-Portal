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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateEventsCache = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.isUserEventManager = exports.getEventManagers = exports.assignManagersToEvent = exports.getEventById = exports.getEvents = void 0;
const constants_1 = require("@common/constants");
const Event_1 = __importDefault(require("@common/models/Event"));
const utils_1 = require("@common/utils");
const cache_1 = require("@config/cache");
const firebase_1 = require("@config/firebase");
const cacheUtils_1 = require("@utils/cacheUtils");
// Collection references
const eventsCollection = firebase_1.db.collection('events');
const COLLECTION_KEY = "events";
const ITEM_KEY_PREFIX = "events";
const getUserScope = (user) => user ? `${user.role}-${user.username}` : 'guest';
const getCollectionKey = (user) => `${COLLECTION_KEY}-${getUserScope(user)}`;
const getItemKey = (eventId, user) => `${ITEM_KEY_PREFIX}-${eventId}-${getUserScope(user)}`;
const isVisibleToUser = (event, user) => {
    var _a;
    if ((event === null || event === void 0 ? void 0 : event.visibility) !== constants_1.ItemVisibility.PRIVATE)
        return true;
    return ((_a = user === null || user === void 0 ? void 0 : user.role) !== null && _a !== void 0 ? _a : constants_1.Role.GUEST) >= constants_1.Role.ADMIN;
};
/**
 * Get all events
 */
// Helper to filter sensitive fields
function filterEventForUser(event, user) {
    if (!isVisibleToUser(event, user)) {
        return null;
    }
    // Only admins or managers for this event can see managers field
    if (!user || (user.role < constants_1.Role.ADMIN && !(event.managers && event.managers.includes(user.username)))) {
        const { managers } = event, rest = __rest(event, ["managers"]);
        return rest;
    }
    return event;
}
const getEvents = (user) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, cacheUtils_1.getCachedCollection)({
        key: getCollectionKey(user),
        fetchFn: () => __awaiter(void 0, void 0, void 0, function* () {
            const snapshot = yield eventsCollection.get();
            const filteredEvents = snapshot.docs
                .map(doc => filterEventForUser(doc.data(), user))
                .filter(Boolean);
            return (0, utils_1.parseEvents)(filteredEvents);
        }),
        ttl: cache_1.TTL.EVENTS
    });
});
exports.getEvents = getEvents;
/**
 * Get event by ID
 */
const getEventById = (eventId, user) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, cacheUtils_1.getCachedItem)({
        key: getItemKey(eventId, user),
        fetchFn: () => __awaiter(void 0, void 0, void 0, function* () {
            const doc = yield eventsCollection.doc(eventId).get();
            if (!doc.exists)
                return null;
            const filteredEvent = filterEventForUser(doc.data(), user);
            if (!filteredEvent)
                return null;
            return Event_1.default.parse(filteredEvent);
        }),
        ttl: cache_1.TTL.EVENTS
    });
});
exports.getEventById = getEventById;
// Assign managers to an event (admin only)
const assignManagersToEvent = (eventId, managers) => __awaiter(void 0, void 0, void 0, function* () {
    // Store managers as an array of usernames/emails in the event document
    yield eventsCollection.doc(eventId).update({ managers });
    cache_1.cache.keys().forEach(key => {
        if (key.startsWith(`${ITEM_KEY_PREFIX}-${eventId}-`) || key.startsWith(`${COLLECTION_KEY}-`)) {
            cache_1.cache.del(key);
        }
    });
});
exports.assignManagersToEvent = assignManagersToEvent;
// Get managers for an event
const getEventManagers = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield eventsCollection.doc(eventId).get();
    if (!doc.exists)
        return [];
    const data = doc.data();
    return (data === null || data === void 0 ? void 0 : data.managers) || [];
});
exports.getEventManagers = getEventManagers;
// Check if a user is a manager for an event
const isUserEventManager = (eventId, username) => __awaiter(void 0, void 0, void 0, function* () {
    const managers = yield (0, exports.getEventManagers)(eventId);
    return managers.includes(username);
});
exports.isUserEventManager = isUserEventManager;
/**
 * Create new event
 */
const createEvent = (eventData) => __awaiter(void 0, void 0, void 0, function* () {
    const event = Event_1.default.parse(eventData);
    (0, firebase_1.sendPushNotificationToAllUsers)(`New Event: ${event.name}`, `Check out the new event: ${event.name}`);
    const created = yield (0, cacheUtils_1.createCachedItem)({
        item: event,
        collectionKey: `${COLLECTION_KEY}-guest`,
        itemKeyPrefix: ITEM_KEY_PREFIX,
        saveFn: (item) => __awaiter(void 0, void 0, void 0, function* () {
            yield eventsCollection.doc(item.id).set(item.toJSON());
        }),
        ttl: cache_1.TTL.EVENTS
    });
    (0, exports.invalidateEventsCache)();
    return created;
});
exports.createEvent = createEvent;
/**
 * Update existing event
 */
const updateEvent = (eventId, eventData) => __awaiter(void 0, void 0, void 0, function* () {
    // Only update provided fields (patch)
    yield eventsCollection.doc(eventId).update(eventData);
    // Invalidate all scoped caches for this event and collection views
    cache_1.cache.keys().forEach(key => {
        if (key.startsWith(`${ITEM_KEY_PREFIX}-${eventId}-`) || key.startsWith(`${COLLECTION_KEY}-`)) {
            cache_1.cache.del(key);
        }
    });
    return (yield eventsCollection.doc(eventId).get()).data();
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
    const deleted = yield (0, cacheUtils_1.deleteCachedItem)({
        id: eventId,
        collectionKey: `${COLLECTION_KEY}-guest`,
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
    (0, exports.invalidateEventsCache)();
    return deleted;
});
exports.deleteEvent = deleteEvent;
/**
 * Invalidate cache for all events
 */
const invalidateEventsCache = () => {
    cache_1.cache.keys().forEach(key => {
        if (key.startsWith(ITEM_KEY_PREFIX) || key.startsWith(COLLECTION_KEY)) {
            cache_1.cache.del(key);
        }
    });
    console.log("Cache invalidated successfully for events!");
    return "Cache invalidated successfully for events!";
};
exports.invalidateEventsCache = invalidateEventsCache;
