import express, { Request, Response } from 'express';
import { 
    getActivities, 
    getActivityById, 
    createActivity, 
    updateActivity, 
    deleteActivity,
} from '../services/activities';

const router = express.Router();

/**
 * Activity Routes
 */

// Get all activities for an event
router.get('/activities/:eventId', async (req: Request, res: Response) => {
    try {
        const activities = await getActivities(req.params.eventId);
        res.json(activities || []);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Error fetching activities' });
    }
});

// Get specific activity by ID
router.get('/activities/:eventId/:activityId', async (req: Request, res: Response) => {
    try {
        const activity = await getActivityById(req.params.eventId, req.params.activityId);
        if (activity) {
            res.json(activity);
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ message: 'Error fetching activity' });
    }
});

// Create new activity
router.post('/activities/:eventId', async (req: Request, res: Response) => {
    try {
        const newActivity = await createActivity(req.params.eventId, req.body);
        res.status(201).json(newActivity);
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ message: 'Error creating activity' });
    }
});

// Update activity
router.patch('/activities/:eventId/:activityId', async (req: Request, res: Response) => {
    try {
        const updatedActivity = await updateActivity(
            req.params.eventId, 
            req.params.activityId, 
            req.body
        );
        if (updatedActivity) {
            res.json(updatedActivity);
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({ message: 'Error updating activity' });
    }
});

// Delete activity
router.delete('/activities/:eventId/:activityId', async (req: Request, res: Response) => {
    try {
        const result = await deleteActivity(req.params.eventId, req.params.activityId);
        if (result) {
            res.json({ message: 'Activity successfully deleted' });
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ message: 'Error deleting activity' });
    }
});

export default router;