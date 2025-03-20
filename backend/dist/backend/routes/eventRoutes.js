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
Object.defineProperty(exports, "__esModule", { value: true });
// filepath: y:\All-Projects\Jain-Events-Portal\backend\routes\eventRoutes.ts
const express_1 = require("express");
const auth_1 = require("@middlewares/auth");
const events_1 = require("@services/events");
const router = (0, express_1.Router)();
/**
 * Event Routes
 */
// Get all events
router.get('/events', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield (0, events_1.getEvents)();
        res.json(events);
    }
    catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events', details: error });
    }
}));
// Get event by ID
router.get('/events/:eventId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield (0, events_1.getEventById)(req.params.eventId);
        if (event) {
            res.json(event);
        }
        else {
            res.status(404).json({ message: 'Event not found' });
        }
    }
    catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Error fetching event', details: error });
    }
}));
// Create new event
router.post('/events', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newEvent = yield (0, events_1.createEvent)(req.body);
        res.status(201).json(newEvent);
    }
    catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Error creating event', details: error });
    }
}));
// Update event
router.patch('/events/:eventId', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedEvent = yield (0, events_1.updateEvent)(req.params.eventId, req.body);
        res.json(updatedEvent);
    }
    catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event', details: JSON.stringify(error) });
    }
}));
// Delete event
router.delete('/events/:eventId', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, events_1.deleteEvent)(req.params.eventId);
        if (result) {
            res.json({ message: 'Event successfully deleted' });
        }
        else {
            res.status(404).json({ message: 'Event not found' });
        }
    }
    catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event', details: error });
    }
}));
// Invalidate cache for all events
router.post('/events/invalidate-cache', auth_1.adminMiddleware, (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = yield (0, events_1.invalidateEventsCache)();
        res.json({ message });
    }
    catch (error) {
        console.error('Error invalidating cache:', error);
        res.status(500).json({ message: 'Error invalidating cache' });
    }
}));
exports.default = router;
