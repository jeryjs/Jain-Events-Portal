import { Activity, Judge, Participant, TeamParticipant } from '@common/models';
import { EventType } from '@common/constants';
class CulturalActivity extends Activity {
  constructor(
    id: string, 
    name: string, 
    startTime: Date,
    endTime: Date,
    type: EventType,
    participants: Participant[] | TeamParticipant[],
    public judges: Judge[] = [],
    public teams: {id: string, name: string}[] = [],
    public pollData: {teamId: string, votes: string[]}[] = [],
    public showPoll: boolean = false,
    public winners: { teamId: string, rank: number }[] = [],  // for solo events, teamId is the participant's usn
    public isSoloPerformance: boolean,
  ) {
    super(id, name, startTime, endTime, participants, type);

    this.isSoloPerformance = this.isSoloPerformance ?? (this.teams.length === 0 || this.teams.every(t => this.getTeamParticipants(t.id).length <= 1));
  }

  static parse(data: any): CulturalActivity {
    const s = super.parse({...data, type: 0});  // set type to 0 to avoid circular reference
    const judges = data.judges?.map((j: any) => Judge.parse(j));
    return new CulturalActivity(s.id, s.name, s.startTime, s.endTime, data.type || data.eventType, s.participants, judges, data.teams, data.pollData, data.showPoll, data.winners, data.isSoloPerformance);
  }

  get canVote(): boolean {
    return this.showPoll && this.startTime <= new Date() && (!this.endTime || this.endTime >= new Date());
  }

  get audienceChoice(): {teamId: string, name: string} | null {
    const best = this.pollData.reduce((prev, curr) => (curr.votes.length > prev.votes.length ? curr : prev), this.pollData[0] || {teamId: '', votes: []});
    if (!best) return null;
    if (this.isSoloPerformance) {
      // For solo events, assume pollData.teamId represents the participant's usn; customize the name as needed.
      return { teamId: best.teamId, name: this.participants.find(p => p.usn.trim() === best.teamId.trim())?.name || "Unknown Participant" };
    }
    // For team events, look up the team by id and return its info; if not found, provide default values.
    return { teamId: best.teamId, name: this.teams.find(t => t.id === best.teamId)?.name || "Unknown Team" };
  }

  getParticipantTeam(usn: string) {
    if (this.isSoloPerformance) {
      return null;
    }
    return this.teams.find(t => this.getTeamParticipants(t.id).some(p => p.usn === usn)) || null;
  }

  getTeamParticipants(teamId: string) {
    // Type guard to check if a participant is a TeamParticipant
    const isTeamParticipant = (participant: Participant | TeamParticipant): participant is TeamParticipant =>
      (participant as TeamParticipant).teamId !== undefined;

    // If participants include team participants, filter them by teamId
    if (this.participants.some(isTeamParticipant)) {
      return (this.participants.filter(isTeamParticipant) as TeamParticipant[]).filter(
        p => p.teamId === teamId,
      );
    }

    // For solo performances, filter participants by their usn
    if (this.isSoloPerformance) {
      return this.participants.filter(p => p.usn === teamId);
    }

    // Fallback in case no matching participants are found
    return [];
  }
}

export default CulturalActivity;