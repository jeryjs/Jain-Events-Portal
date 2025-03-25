"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("@common/models");
class CulturalActivity extends models_1.Activity {
    constructor(id, name, startTime, endTime, type, participants, judges = [], teams = [], pollData = [], showPoll = false, winners = [], // for solo events, teamId is the participant's usn
    stats = []) {
        super(id, name, startTime, endTime, participants, type);
        this.judges = judges;
        this.teams = teams;
        this.pollData = pollData;
        this.showPoll = showPoll;
        this.winners = winners;
        this.stats = stats;
    }
    static parse(data) {
        var _a;
        const s = super.parse(Object.assign(Object.assign({}, data), { type: 0 })); // set type to 0 to avoid circular reference
        const judges = (_a = data.judges) === null || _a === void 0 ? void 0 : _a.map((j) => models_1.Judge.parse(j));
        return new CulturalActivity(s.id, s.name, s.startTime, s.endTime, data.type || data.eventType, s.participants, judges, data.teams, data.pollData, data.showPoll, data.winners, data.stats);
    }
    get isSoloPerformance() {
        return this.teams.length === 0 || (this.teams.length > 0 && this.participants.length > 0 && this.teams.every(team => this.participants.filter(p => p.usn === team.id).length === 1)); // check if all teams have only one participant
    }
}
exports.default = CulturalActivity;
