import Participant from './Participant';
import { EventType } from '../constants';

export default class Activity {
    constructor(
        public id: string,
        public name: string,
        public participants: Participant[],
        public eventType: EventType
    ) {}

    static parse(data: any): Activity {
        const participants = data.participants.map((p: any) => Participant.parse(p));
        return new Activity(data.activityId, data.name, participants, data.eventType);
    }
}
