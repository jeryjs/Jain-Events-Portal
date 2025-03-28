// filepath: y:\All-Projects\Jain-Events-Portal\backend\routes\eventRoutes.ts
import { Request, Response, Router } from 'express';
import { adminMiddleware } from '@middlewares/auth';
import {
    createEvent,
    deleteEvent,
    getEventById,
    getEvents,
    invalidateEventsCache,
    updateEvent,
} from "@services/events";

const router = Router();

/**
 * Event Routes
 */

// Get all events
router.get('/', async (_: Request, res: Response) => {
    try {
        const events = await getEvents();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events', details: error });
    }
});

// Get event by ID
router.get('/:eventId', async (req: Request, res: Response) => {
    try {
        const event = await getEventById(req.params.eventId);
        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Error fetching event', details: error });
    }
});

// Create new event
router.post('/', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const newEvent = await createEvent(req.body);
        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Error creating event', details: error });
    }
});

// Update event
router.patch('/:eventId', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const updatedEvent = await updateEvent(req.params.eventId, req.body);
        res.json(updatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event', details: JSON.stringify(error) });
    }
});

// Delete event
router.delete('/:eventId', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const result = await deleteEvent(req.params.eventId);
        if (result) {
            res.json({ message: 'Event successfully deleted' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event', details: error });
    }
});

// Invalidate cache for all events
router.post('/invalidate-cache', adminMiddleware, async (_: Request, res: Response) => {
    try {
        const message = await invalidateEventsCache();
        res.json({ message });
    } catch (error) {
        console.error('Error invalidating cache:', error);
        res.status(500).json({ message: 'Error invalidating cache' });
    }
});

export default router;