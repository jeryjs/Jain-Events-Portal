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
const express_1 = __importDefault(require("express"));
const activities_1 = require("@services/activities");
const auth_1 = require("@middlewares/auth");
const authUtils_1 = require("@utils/authUtils");
const router = express_1.default.Router();
/**
 * Activity Routes
 */
// Get all activities for an event
router.get('/activities/:eventId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activities = yield (0, activities_1.getActivities)(req.params.eventId);
        res.json(activities || []);
    }
    catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Error fetching activities' });
    }
}));
// Get specific activity by ID
router.get('/activities/:eventId/:activityId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activity = yield (0, activities_1.getActivityById)(req.params.eventId, req.params.activityId);
        if (activity) {
            res.json(activity);
        }
        else {
            res.status(404).json({ message: 'Activity not found' });
        }
    }
    catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ message: 'Error fetching activity' });
    }
}));
// Create new activity
router.post('/activities/:eventId', auth_1.managerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newActivity = yield (0, activities_1.createActivity)(req.params.eventId, req.body);
        res.status(201).json(newActivity);
    }
    catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ message: 'Error creating activity' });
    }
}));
// Update activity
router.patch('/activities/:eventId/:activityId', auth_1.managerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedActivity = yield (0, activities_1.updateActivity)(req.params.eventId, req.params.activityId, req.body);
        if (updatedActivity) {
            res.json(updatedActivity);
        }
        else {
            res.status(404).json({ message: 'Activity not found' });
        }
    }
    catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({ message: 'Error updating activity' });
    }
}));
// Delete activity
router.delete('/activities/:eventId/:activityId', auth_1.managerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, activities_1.deleteActivity)(req.params.eventId, req.params.activityId);
        if (result) {
            res.json({ message: 'Activity successfully deleted' });
        }
        else {
            res.status(404).json({ message: 'Activity not found' });
        }
    }
    catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ message: 'Error deleting activity' });
    }
}));
// Invalidate cache for activities
router.post('/activities/invalidate-cache', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, activities_1.invalidateActivitiesCache)();
        res.json({ message: result });
    }
    catch (error) {
        console.error('Error invalidating cache:', error);
        res.status(500).json({ message: 'Error invalidating cache' });
    }
}));
// Get poll results for an activity
router.get('/activities/:eventId/:activityId/poll', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield (0, activities_1.getPollResults)(req.params.eventId, req.params.activityId);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching poll results:', error);
        res.status(500).json({ message: 'Error fetching poll results' });
    }
}));
// Cast a vote for a participant
router.post('/activities/:eventId/:activityId/vote/:teamId', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userdata = (0, authUtils_1.getUserFromToken)(req.headers.authorization || '');
        if (!userdata) {
            res.status(400).json({ message: 'User data missing from token' });
            return;
        }
        const result = yield (0, activities_1.castVote)(req.params.eventId, req.params.activityId, req.params.teamId, userdata.username);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error casting vote:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error casting vote';
        if (errorMessage.includes('already voted')) {
            res.status(400).json({ message: errorMessage });
            return;
        }
        res.status(500).json({ message: errorMessage });
    }
}));
exports.default = router;
