"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Activity_1 = __importDefault(require("../Activity"));
const constants_1 = require("../../constants");
const Participant_1 = __importDefault(require("../Participant"));
class CulturalActivity extends Activity_1.default {
    constructor(activityId, name, participants, performanceDetails) {
        super(activityId, name, participants, constants_1.EventType.CULTURAL);
        this.performanceDetails = performanceDetails;
    }
    static parse(data) {
        const participants = data.participants.map((p) => Participant_1.default.parse(p));
        return new CulturalActivity(data.activityId, data.name, participants, data.performanceDetails);
    }
}
exports.default = CulturalActivity;
