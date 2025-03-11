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
exports.default = router;
