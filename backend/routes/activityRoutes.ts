import express, { Request, Response } from 'express';
import { 
    getActivities, 
    getActivityById, 
    createActivity, 
    updateActivity, 
    deleteActivity,
    invalidateActivitiesCache,
    getPollResults,
    castVote,
} from '@services/activities';
import { adminMiddleware, authMiddleware, managerMiddleware } from '@middlewares/auth';
import { getUserFromToken } from '@utils/authUtils';

const router = express.Router();

/**
 * Activity Routes
 */

// Get all activities for an event
router.get('/:eventId', async (req: Request, res: Response) => {
    try {
        const activities = await getActivities(req.params.eventId);
        res.json(activities || []);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Error fetching activities' });
    }
});

// Get specific activity by ID
router.get('/:eventId/:activityId', async (req: Request, res: Response) => {
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
router.post('/:eventId', managerMiddleware, async (req: Request, res: Response) => {
    try {
        const newActivity = await createActivity(req.params.eventId, req.body);
        res.status(201).json(newActivity);
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ message: 'Error creating activity' });
    }
});

// Update activity
router.patch('/:eventId/:activityId', managerMiddleware, async (req: Request, res: Response) => {
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
router.delete('/:eventId/:activityId', managerMiddleware, async (req: Request, res: Response) => {
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

// Invalidate cache for activities
router.post('/invalidate-cache', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const result = await invalidateActivitiesCache();
        res.json({ message: result });
    } catch (error) {
        console.error('Error invalidating cache:', error);
        res.status(500).json({ message: 'Error invalidating cache' });
    }
});

// Get poll results for an activity
router.get('/:eventId/:activityId/poll', async (req: Request, res: Response) => {
    try {
        const results = await getPollResults(req.params.eventId, req.params.activityId);
        res.json(results);
    } catch (error) {
        console.error('Error fetching poll results:', error);
        res.status(500).json({ message: 'Error fetching poll results' });
    }
});

// Cast a vote for a participant
router.post('/:eventId/:activityId/vote/:teamId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userdata = getUserFromToken(req.headers.authorization || '');
        if (!userdata) {
            res.status(400).json({ message: 'User data missing from token' });
            return;
        }
        const result = await castVote(req.params.eventId, req.params.activityId, req.params.teamId, userdata.username);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error casting vote:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error casting vote';
        
        if (errorMessage.includes('already voted')) {
            res.status(400).json({ message: errorMessage });
            return;
        }

        res.status(500).json({ message: errorMessage });
    }
});
export default router;