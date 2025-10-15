import { Request, Response, Router } from 'express';
import { adminMiddleware, managerMiddleware } from '@middlewares/auth';
import {
    createEvent,
    deleteEvent,
    getEventById,
    getEvents,
    invalidateEventsCache,
    updateEvent,
    assignManagersToEvent,
    getEventManagers,
    isUserEventManager
} from "@services/events";
import { Role } from '@common/constants';

const router = Router();

/**
 * Event Routes
 */

// Get all events
router.get('/', async (req: Request & { user?: any }, res: Response) => {
    try {
        const user = req.user ? { role: req.user.role, username: req.user.username } : undefined;
        const events = await getEvents(user);
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events', details: error });
    }
});

// Get event by ID
router.get('/:eventId', async (req: Request & { user?: any }, res: Response) => {
    try {
        const user = req.user ? { role: req.user.role, username: req.user.username } : undefined;
        const event = await getEventById(req.params.eventId, user);
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
router.patch('/:eventId', managerMiddleware, async (req: Request & { user?: any }, res: Response) => {
    try {
        // Only allow if user is admin or manager for this event
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const isManager = user.role >= Role.MANAGER || await isUserEventManager(req.params.eventId, user.username);
        if (!isManager) {
            res.status(403).json({ message: 'You are not a manager for this event' });
            return;
        }
        const updatedEvent = await updateEvent(req.params.eventId, req.body);
        res.json(updatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event', details: JSON.stringify(error) });
    }
});

// Assign managers to event (admin only)
router.post('/:eventId/managers', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const { managers } = req.body; // array of usernames/emails
        await assignManagersToEvent(req.params.eventId, managers);
        res.json({ message: 'Managers assigned successfully' });
    } catch (error) {
        console.error('Error assigning managers:', error);
        res.status(500).json({ message: 'Error assigning managers', details: error });
    }
});

router.get('/:eventId/managers', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const managers = await getEventManagers(req.params.eventId);
        res.json(managers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching managers', details: error });
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