"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Activity_1 = __importDefault(require("../Activity"));
const SportsParticipant_1 = __importDefault(require("./SportsParticipant"));
class SportsActivity extends Activity_1.default {
    constructor(id, name, participants, eventType) {
        super(id, name, participants, eventType);
        this.id = id;
        this.name = name;
        this.participants = participants;
        this.eventType = eventType;
    }
    static parse(data) {
        const participants = data.participants.map((p) => SportsParticipant_1.default.parse(p));
        return new SportsActivity(data.id, data.name, participants, data.eventType);
    }
    getTotalParticipants() {
        return this.participants.length;
    }
}
exports.default = SportsActivity;
