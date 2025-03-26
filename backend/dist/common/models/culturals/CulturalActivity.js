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
    getParticipantTeam(usn) {
        return this.teams.find(team => team.id === usn);
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
