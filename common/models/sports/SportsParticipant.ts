import Participant from '../Participant';
import { EventType, Gender } from '../../constants';

export interface Volleyball {
  points: number;
  spikes: number;
  blocks: number;
}

export interface Football {
  position: string;
  goals: number;
  assists: number;
}
export interface Cricket {
  runs: number;
  wickets: number;
}

export interface Basketball {
  points: number;
  rebounds: number;
  assists: number;
}

export interface Throwball {
  points: number;
  catches: number;
}

export type Sport = Volleyball | Football | Cricket;

export default class SportsPlayer<T extends Sport> extends Participant {
  constructor(
    usn: string,
    name: string,
    gender: Gender,
    event: EventType,
    public stats: T
  ) {
    // let event: EventType;
    // switch (stats) {
    //   case stats as Volleyball: event = EventType.VOLLEYBALL; break;
    //   case stats as Football: event = EventType.FOOTBALL; break;
    //   case stats as Cricket: event = EventType.CRICKET; break;
    //   default: throw new Error("Invalid sport type");
    // };
    super(usn, name, gender, event);
  }

  static parse(data: any): SportsPlayer<Sport> {
    const s = super.parse(data);
    const stats = data.stats as Sport;
    return new SportsPlayer(s.usn, s.name, s.gender, s.event, stats);
  }
  

  getPlayerType(): string {
    if ('points' in this.stats) {
      return 'Volleyball Player';
    } else if ('position' in this.stats) {
      return 'Football Player';
    } else if ('runs' in this.stats) {
      return 'Cricket Player';
    } 
    return 'Unknown Player Type';
  }
}

/*
// Example usage:
let volleyballPlayer = new SportsPlayer<Volleyball>('1MS17IS004', 'David', Gender.MALE, EventType.VOLLEYBALL, { points: 20, spikes: 15, blocks: 5 });
console.log(volleyballPlayer.stats.spikes);

let footballPlayer = new SportsPlayer<Football>('1MS17IS002', 'Bob', Gender.MALE, EventType.FOOTBALL, { position: 'Forward', goals: 20, assists: 10 });
console.log(footballPlayer.stats.goals);

let cricketPlayer = new SportsPlayer<Cricket>('1MS17IS001', 'Alice', Gender.FEMALE, EventType.CRICKET, { runs: 1000, wickets: 50 });
console.log(cricketPlayer.stats.runs);
*/