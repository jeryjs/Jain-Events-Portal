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
        public eventType: EventType
    ) {
        if(!this.startTime) this.startTime = new Date();  // TODO: Remove this line once testing is done.

        // Convert Timestamp-like objects (from firestore) to Date
        if (!(this.startTime instanceof Date)) this.startTime = new Date(this.startTime);
        if (this.endTime && !(this.endTime instanceof Date)) this.endTime = new Date(this.endTime);
    }
    
    static parse(data: any): Activity {
        // Determine the type of activity based on eventType
        switch (getBaseEventType(data.eventType)) { 
            case EventType.SPORTS: return SportsActivity.parse(data);
            case EventType.CULTURAL: return CulturalActivity.parse(data);
            case EventType.INFO: return InfoActivity.parse(data);
            default:
                // Default Activity parsing logic
                const participants = data.participants.map((p: any) => Participant.parse(p));
                return new Activity(data.id, data.name, data.startTime, data.endTime, participants, data.eventType);
        }
    }

    get isOngoing(): boolean {
        const now = new Date();
        if (!this.startTime) return false;
        if (this.startTime > now && !this.endTime) return true;
        return this.startTime >= now && now < this.endTime;
    }
}
