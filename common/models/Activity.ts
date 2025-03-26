import Participant from './Participant';
import { EventType } from '../constants';
import { getBaseEventType } from '@common/utils';
import { SportsActivity, CulturalActivity, InfoActivity } from '@common/models';

export default class Activity {
  constructor(
      public id: string,
      public name: string,
      public startTime: Date,
      public endTime: Date,   // can be null until the activity ends
      public participants: Participant[],
      public type: EventType
  ) {
      if(!this.startTime) this.startTime = new Date();  // TODO: Remove this line once testing is done.

      // Convert Timestamp-like objects (from firestore) to Date
      if (!(this.startTime instanceof Date)) this.startTime = new Date(this.startTime);
      if (this.endTime && !(this.endTime instanceof Date)) this.endTime = new Date(this.endTime);
  }
  
  static parse(data: any): Activity {
      // if data contains eventType, convert it to type
      if (data.eventType) {
          data.type = data.eventType;
          delete data.eventType;
      }

      // Determine the type of activity based on eventType
      switch (getBaseEventType(data.type)) { 
          case EventType.SPORTS: return SportsActivity.parse(data);
          case EventType.CULTURAL: return CulturalActivity.parse(data);
          case EventType.INFO: return InfoActivity.parse(data);
          case EventType.TECH: return TeamActivity.parse(data);
          default:
              if (data.teams) return TeamActivity.parse(data);
              // Default Activity parsing logic
              const participants = data.participants.map((p: any) => Participant.parse(p));
              return new Activity(data.id, data.name, data.startTime, data.endTime, participants, data.type);
      }
  }

  get isOngoing(): boolean {
      const now = new Date();
      if (!this.startTime) return false;
      if (this.startTime > now && !this.endTime) return true;
      return this.startTime >= now && now < this.endTime;
  }

  get relativeStartTime(): string {
    const diff = this.startTime.getTime() - Date.now();
    const m = Math.round(diff / 60000);
    if (m < 1) return "now";
    if (m < 60) return `in ${m}m`;
    const h = Math.round(m / 60);
    if (h < 24) return `in ${h}h`;
    const d = Math.round(h / 24);
    return d <= 7 ? `in ${d}d` : 'on ' + this.startTime.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }
}

export class TeamActivity extends Activity {
  constructor(
    id: string,
    name: string,
    startTime: Date,
    endTime: Date,
    type: EventType,
    participants: Participant[],
    public teams: { id: string; name: string }[] = []
  ) {
    super(id, name, startTime, endTime, participants, type);
  }

  static parse(data: any): TeamActivity {
    return new TeamActivity(
      data.id,
      data.name,
      data.startTime,
      data.endTime,
      data.type || data.eventType,
      data.participants.map((p: any) => Participant.parse(p)),
      data.teams
    );
  }
}
