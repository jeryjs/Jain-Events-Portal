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
    constructor(id, name, participants, eventType) {
        this.id = id;
        this.name = name;
        this.participants = participants;
        this.eventType = eventType;
    }
    static parse(data) {
        // Determine the type of activity based on eventType
        switch ((0, utils_1.getBaseEventType)(data.eventType)) {
            case constants_1.EventType.SPORTS:
                return models_1.SportsActivity.parse(data);
            case constants_1.EventType.CULTURAL:
                return models_1.CulturalActivity.parse(data);
            default:
                // Default Activity parsing logic
                const participants = data.participants.map((p) => Participant_1.default.parse(p));
                return new Activity(data.activityId, data.name, participants, data.eventType);
        }
    }
}
exports.default = Activity;
