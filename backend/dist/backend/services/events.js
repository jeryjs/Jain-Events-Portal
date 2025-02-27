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
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventById = exports.getEvents = void 0;
const Event_1 = __importDefault(require("@common/models/Event"));
const utils_1 = require("@common/utils");
const cache_1 = require("@config/cache");
const firebase_1 = __importDefault(require("@config/firebase"));
// Collection references
const eventsCollection = firebase_1.default.collection('events');
/**
 * Get all events
 */
const getEvents = () => __awaiter(void 0, void 0, void 0, function* () {
    const cachedEvents = cache_1.cache.get("events");
    if (cachedEvents) {
        console.log(`📦 Serving cached events`);
        return cachedEvents;
    }
    const snapshot = yield eventsCollection.get();
    const events = (0, utils_1.parseEvents)(snapshot.docs.map(doc => doc.data()));
    cache_1.cache.set("events", events, cache_1.TTL.EVENTS);
    return events;
});
exports.getEvents = getEvents;
/**
 * Get event by ID
 */
const getEventById = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const cachedEvent = cache_1.cache.get(`events-${eventId}`);
    if (cachedEvent) {
        console.log(`📦 Serving cached event ${eventId}`);
        return cachedEvent;
    }
    const doc = yield eventsCollection.doc(eventId).get();
    if (!doc.exists)
        return null;
    const eventData = Event_1.default.parse(doc.data());
    cache_1.cache.set(`events-${eventId}`, eventData, cache_1.TTL.EVENTS);
    return eventData;
});
exports.getEventById = getEventById;
/**
 * Create new event
 */
const createEvent = (eventData) => __awaiter(void 0, void 0, void 0, function* () {
    const event = Event_1.default.parse(eventData);
    const eventDoc = eventsCollection.doc(event.id);
    yield eventDoc.set(event.toJSON());
    cache_1.cache.set(`events-${event.id}`, event, cache_1.TTL.EVENTS);
    cache_1.cache.del("events");
    return event;
});
exports.createEvent = createEvent;
/**
 * Update existing event
 */
const updateEvent = (eventId, eventData) => __awaiter(void 0, void 0, void 0, function* () {
    const event = Event_1.default.parse(eventData);
    const eventDoc = eventsCollection.doc(event.id);
    yield eventDoc.update(event.toJSON());
    cache_1.cache.set(`events-${eventId}`, event, cache_1.TTL.EVENTS);
    cache_1.cache.del("events");
    return event;
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
    // Delete all activities/subCollections first
    const eventSubCollections = yield eventDoc.listCollections();
    const batch = firebase_1.default.batch();
    yield Promise.all(eventSubCollections.map((collection) => __awaiter(void 0, void 0, void 0, function* () {
        const collectionDocs = yield collection.get();
        collectionDocs.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
    })));
    // Then delete the event itself
    batch.delete(eventDoc);
    yield batch.commit();
    return true;
});
exports.deleteEvent = deleteEvent;
