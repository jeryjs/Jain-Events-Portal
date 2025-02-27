"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Participant_1 = __importDefault(require("../Participant"));
class SportsPlayer extends Participant_1.default {
    constructor(usn, name, gender, event, stats) {
        // let event: EventType;
        // switch (stats) {
        //   case stats as Volleyball: event = EventType.VOLLEYBALL; break;
        //   case stats as Football: event = EventType.FOOTBALL; break;
        //   case stats as Cricket: event = EventType.CRICKET; break;
        //   default: throw new Error("Invalid sport type");
        // };
        super(usn, name, gender, event);
        this.stats = stats;
    }
    static parse(data) {
        const s = super.parse(data);
        const stats = data.stats;
        return new SportsPlayer(s.usn, s.name, s.gender, s.event, stats);
    }
    getPlayerType() {
        if ('points' in this.stats) {
            return 'Volleyball Player';
        }
        else if ('position' in this.stats) {
            return 'Football Player';
        }
        else if ('runs' in this.stats) {
            return 'Cricket Player';
        }
        return 'Unknown Player Type';
    }
}
exports.default = SportsPlayer;
/*
// Example usage:
let volleyballPlayer = new SportsPlayer<Volleyball>('1MS17IS004', 'David', Gender.MALE, EventType.VOLLEYBALL, { points: 20, spikes: 15, blocks: 5 });
console.log(volleyballPlayer.stats.spikes);

let footballPlayer = new SportsPlayer<Football>('1MS17IS002', 'Bob', Gender.MALE, EventType.FOOTBALL, { position: 'Forward', goals: 20, assists: 10 });
console.log(footballPlayer.stats.goals);

let cricketPlayer = new SportsPlayer<Cricket>('1MS17IS001', 'Alice', Gender.FEMALE, EventType.CRICKET, { runs: 1000, wickets: 50 });
console.log(cricketPlayer.stats.runs);
*/ 
