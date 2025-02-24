import { Router, Request, Response } from 'express';
import { getEvents, getActivities } from "@services/events";

const router = Router();

router.get('/events', async (_: Request, res: Response) => {
    try {
        const events = await getEvents();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

router.get('/event/:eventId', async (req: Request, res: Response) => {
    try {
        const events = await getEvents();
        const event = events.find((event) => event.id === req.params.eventId);
        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Error fetching event' });
    }
});

router.get('/activities/:eventId', async (req: Request, res: Response) => {
    try {
        const activities = await getActivities(req.params.eventId);
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Error fetching activities' });
    }
});

export default router;