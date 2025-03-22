"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Participant_1 = __importDefault(require("./Participant"));
const constants_1 = require("../constants");
const utils_1 = require("@common/utils");
const models_1 = require("@common/models");
class Activity {
    constructor(id, name, startTime, endTime, // can be null until the activity ends
    participants, eventType) {
        this.id = id;
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.participants = participants;
        this.eventType = eventType;
        if (!this.startTime)
            this.startTime = new Date(); // TODO: Remove this line once testing is done.
        // Convert Timestamp-like objects (from firestore) to Date
        if (!(this.startTime instanceof Date))
            this.startTime = new Date(this.startTime);
        if (this.endTime && !(this.endTime instanceof Date))
            this.endTime = new Date(this.endTime);
    }
    static parse(data) {
        // Determine the type of activity based on eventType
        switch ((0, utils_1.getBaseEventType)(data.eventType)) {
            case constants_1.EventType.SPORTS: return models_1.SportsActivity.parse(data);
            case constants_1.EventType.CULTURAL: return models_1.CulturalActivity.parse(data);
            case constants_1.EventType.INFO: return models_1.InfoActivity.parse(data);
            default:
                // Default Activity parsing logic
                const participants = data.participants.map((p) => Participant_1.default.parse(p));
                return new Activity(data.id, data.name, data.startTime, data.endTime, participants, data.eventType);
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
}
exports.default = Activity;
