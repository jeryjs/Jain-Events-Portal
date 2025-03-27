"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("@common/models");
class CulturalActivity extends models_1.Activity {
    constructor(id, name, startTime, endTime, type, participants, judges = [], teams = [], pollData = [], showPoll = false, winners = [], // for solo events, teamId is the participant's usn
    isSoloPerformance) {
        var _a;
        super(id, name, startTime, endTime, participants, type);
        this.judges = judges;
        this.teams = teams;
        this.pollData = pollData;
        this.showPoll = showPoll;
        this.winners = winners;
        this.isSoloPerformance = isSoloPerformance;
        this.isSoloPerformance = (_a = this.isSoloPerformance) !== null && _a !== void 0 ? _a : (this.teams.length === 0 || this.teams.every(t => this.getTeamParticipants(t.id).length <= 1));
    }
    static parse(data) {
        var _a;
        const s = super.parse(Object.assign(Object.assign({}, data), { type: 0 })); // set type to 0 to avoid circular reference
        const judges = (_a = data.judges) === null || _a === void 0 ? void 0 : _a.map((j) => models_1.Judge.parse(j));
        return new CulturalActivity(s.id, s.name, s.startTime, s.endTime, data.type || data.eventType, s.participants, judges, data.teams, data.pollData, data.showPoll, data.winners, data.isSoloPerformance);
    }
    get canVote() {
        return this.showPoll && this.startTime <= new Date() && (!this.endTime || this.endTime >= new Date());
    }
    get audienceChoice() {
        var _a, _b;
        const best = this.pollData.reduce((prev, curr) => (curr.votes.length > prev.votes.length ? curr : prev), this.pollData[0] || { teamId: '', votes: [] });
        if (!best)
            return null;
        if (this.isSoloPerformance) {
            // For solo events, assume pollData.teamId represents the participant's usn; customize the name as needed.
            return { teamId: best.teamId, name: ((_a = this.participants.find(p => p.usn.trim() === best.teamId.trim())) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Participant" };
        }
        // For team events, look up the team by id and return its info; if not found, provide default values.
        return { teamId: best.teamId, name: ((_b = this.teams.find(t => t.id === best.teamId)) === null || _b === void 0 ? void 0 : _b.name) || "Unknown Team" };
    }
    getParticipantTeam(usn) {
        if (this.isSoloPerformance) {
            return null;
        }
        return this.teams.find(t => this.getTeamParticipants(t.id).some(p => p.usn === usn)) || null;
    }
    getTeamParticipants(teamId) {
        // Type guard to check if a participant is a TeamParticipant
        const isTeamParticipant = (participant) => participant.teamId !== undefined;
        // If participants include team participants, filter them by teamId
        if (this.participants.some(isTeamParticipant)) {
            return this.participants.filter(isTeamParticipant).filter(p => p.teamId === teamId);
        }
        // For solo performances, filter participants by their usn
        if (this.isSoloPerformance) {
            return this.participants.filter(p => p.usn === teamId);
        }
        // Fallback in case no matching participants are found
        return [];
    }
}
exports.default = CulturalActivity;
