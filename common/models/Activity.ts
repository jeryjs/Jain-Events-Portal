import Participant from './Participant';
import { EventType } from '../constants';
import { getBaseEventType } from '@common/utils';
import { SportsActivity, CulturalActivity } from '@common/models';

export default class Activity {
    constructor(
        public id: string,
        public name: string,
        public participants: Participant[],
        public eventType: EventType
    ) {}
    
    static parse(data: any): Activity {
        // Determine the type of activity based on eventType
        switch (getBaseEventType(data.eventType)) {
            case EventType.SPORTS: 
                return SportsActivity.parse(data);
            case EventType.CULTURAL: 
                return CulturalActivity.parse(data);
            default:
                // Default Activity parsing logic
                const participants = data.participants.map((p: any) => Participant.parse(p));
                return new Activity(data.activityId, data.name, participants, data.eventType);
        }
    }
}
