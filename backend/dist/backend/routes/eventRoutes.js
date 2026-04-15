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
const express_1 = require("express");
const auth_1 = require("@middlewares/auth");
const events_1 = require("@services/events");
const constants_1 = require("@common/constants");
const router = (0, express_1.Router)();
/**
 * Event Routes
 */
// Get all events
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user ? { role: req.user.role, username: req.user.username } : undefined;
        const events = yield (0, events_1.getEvents)(user);
        res.json(events);
    }
    catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events', details: error });
    }
}));
// Get event by ID
router.get('/:eventId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user ? { role: req.user.role, username: req.user.username } : undefined;
        const event = yield (0, events_1.getEventById)(req.params.eventId, user);
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
router.post('/', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newEvent = yield (0, events_1.createEvent)(req.body);
        res.status(201).json(newEvent);
    }
    catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Error creating event', details: error });
    }
}));
router.patch('/:eventId', auth_1.managerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only allow if user is admin or manager for this event
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const isManager = user.role >= constants_1.Role.MANAGER || (yield (0, events_1.isUserEventManager)(req.params.eventId, user.username));
        if (!isManager) {
            res.status(403).json({ message: 'You are not a manager for this event' });
            return;
        }
        const updatedEvent = yield (0, events_1.updateEvent)(req.params.eventId, req.body);
        res.json(updatedEvent);
    }
    catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event', details: JSON.stringify(error) });
    }
}));
// Assign managers to event (admin only)
router.post('/:eventId/managers', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { managers } = req.body; // array of usernames/emails
        yield (0, events_1.assignManagersToEvent)(req.params.eventId, managers);
        res.json({ message: 'Managers assigned successfully' });
    }
    catch (error) {
        console.error('Error assigning managers:', error);
        res.status(500).json({ message: 'Error assigning managers', details: error });
    }
}));
router.get('/:eventId/managers', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const managers = yield (0, events_1.getEventManagers)(req.params.eventId);
        res.json(managers);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching managers', details: error });
    }
}));
// Delete event
router.delete('/:eventId', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
router.post('/invalidate-cache', auth_1.adminMiddleware, (_, res) => __awaiter(void 0, void 0, void 0, function* () {
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
