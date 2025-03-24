import { Activity, Judge, Participant } from '@common/models';
import { EventType } from '@common/constants';
class CulturalActivity extends Activity {
  constructor(
    id: string, 
    name: string, 
    startTime: Date,
    endTime: Date,
    type: EventType,
    participants: Participant[],
    public judges: Judge[] = [],
    public teams: {id: string, name: string}[] = [],
    public pollData: {teamId: string, votes: string[]}[] = [],
    public showPoll: boolean = false,
    public winners: {teamId: string, rank: number}[] = [],  // for solo events, teamId is the participant's usn
    public stats: any[] = [],
  ) {
    super(id, name, startTime, endTime, participants, type);
  }

  static parse(data: any): CulturalActivity {
    const s = super.parse({...data, type: 0});  // set type to 0 to avoid circular reference
    const judges = data.judges?.map((j: any) => Participant.parse(j));
    return new CulturalActivity(s.id, s.name, s.startTime, s.endTime, data.type || data.eventType, s.participants, judges, data.teams, data.pollData, data.showPoll, data.winners, data.stats);
  }

  get isSoloPerformance() {
    return this.teams.length === 0 || this.teams.every(team => team.id.split(';').length <= 1); // check if all teams have only one participant
  }
}

export default CulturalActivity;