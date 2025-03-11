"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Participant_1 = __importDefault(require("../Participant"));
class SportsPlayer extends Participant_1.default {
    constructor(usn, name, gender, email, phone, branch, event, teamId, position = "playing", stats) {
        super(usn, name, gender, email, phone, branch, event);
        this.teamId = teamId;
        this.position = position;
        this.stats = stats;
    }
    static parse(data) {
        const s = super.parse(data);
        return new SportsPlayer(s.usn, s.name, s.gender, s.email, s.phone, s.branch, s.event, data.teamId, data.position, data.stats);
    }
    get isPlaying() {
        return this.position != "substitute";
    }
    get detailsString() {
        return `USN: ${this.usn} • Team: ${this.teamId} • Position: ${this.position}`;
    }
}
exports.default = SportsPlayer;
