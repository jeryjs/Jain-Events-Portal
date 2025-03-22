import { Activity, Participant } from '@common/models';
import { EventType } from '@common/constants';
class CulturalActivity extends Activity {
  constructor(
    id: string, 
    name: string, 
    startTime: Date,
    endTime: Date,
    participants: Participant[],
    public judges: Participant[] = [],
    public teams: {id: string, name: string}[] = [],
    public pollData: {teamId: string, votes: string[]}[] = [],
    public showPoll: boolean = false,
    public winners: {teamId: string, rank: number}[] = [],  // for solo events, teamId is the participant's usn
    public stats: any[] = [],
  ) {
    super(id, name, startTime, endTime, participants, EventType.CULTURAL);
  }

  static parse(data: any): CulturalActivity {
    const s = super.parse({...data, eventType: 0});  // set type to 0 to avoid circular reference
    const judges = data.judges?.map((j: any) => Participant.parse(j));
    return new CulturalActivity(s.id, s.name, s.startTime, s.endTime, s.participants, judges, data.teams, data.pollData, data.showPoll, data.winners, data.stats);
  }
}

export default CulturalActivity;