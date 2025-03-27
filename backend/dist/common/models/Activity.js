"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamActivity = void 0;
const Participant_1 = __importDefault(require("./Participant"));
const constants_1 = require("../constants");
const utils_1 = require("@common/utils");
const models_1 = require("@common/models");
class Activity {
    constructor(id, name, startTime, endTime, // can be null until the activity ends
    participants, type) {
        this.id = id;
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.participants = participants;
        this.type = type;
        if (!this.startTime)
            this.startTime = new Date(); // TODO: Remove this line once testing is done.
        // Convert Timestamp-like objects (from firestore) to Date
        if (!(this.startTime instanceof Date))
            this.startTime = new Date(this.startTime);
        if (this.endTime && !(this.endTime instanceof Date))
            this.endTime = new Date(this.endTime);
    }
    static parse(data) {
        // if data contains eventType, convert it to type
        if (data.eventType) {
            data.type = data.eventType;
            delete data.eventType;
        }
        // Determine the type of activity based on eventType
        switch ((0, utils_1.getBaseEventType)(data.type)) {
            case constants_1.EventType.SPORTS: return models_1.SportsActivity.parse(data);
            case constants_1.EventType.CULTURAL: return models_1.CulturalActivity.parse(data);
            case constants_1.EventType.INFO: return models_1.InfoActivity.parse(data);
            case constants_1.EventType.TECH: return TeamActivity.parse(data);
            default:
                if (data.teams)
                    return TeamActivity.parse(data);
                // Default Activity parsing logic
                const participants = data.participants.map((p) => Participant_1.default.parse(p));
                return new Activity(data.id, data.name, data.startTime, data.endTime, participants, data.type);
        }
    }
    get isOngoing() {
        const now = new Date();
        if (!this.startTime)
            return false;
        if (this.startTime > now && !this.endTime)
            return true;
        return this.startTime >= now && now < this.endTime;
    }
    get relativeStartTime() {
        const diff = this.startTime.getTime() - Date.now();
        const m = Math.round(diff / 60000);
        if (m < 1)
            return "now";
        if (m < 60)
            return `in ${m}m`;
        const h = Math.round(m / 60);
        if (h < 24)
            return `in ${h}h`;
        const d = Math.round(h / 24);
        return d <= 7 ? `in ${d}d` : 'on ' + this.startTime.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        });
    }
}
exports.default = Activity;
class TeamActivity extends Activity {
    constructor(id, name, startTime, endTime, type, participants, teams = [], winners = []) {
        super(id, name, startTime, endTime, participants, type);
        this.teams = teams;
        this.winners = winners;
    }
    static parse(data) {
        return new TeamActivity(data.id, data.name, data.startTime, data.endTime, data.type || data.eventType, data.participants.map((p) => Participant_1.default.parse(p)), data.teams, data.winners);
    }
}
exports.TeamActivity = TeamActivity;
