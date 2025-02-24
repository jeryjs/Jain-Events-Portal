import Participant from './Participant';
import { EventType } from '../constants';

class Activity {
    constructor(
        public activityId: string,
        public name: string,
        public participants: Participant[],
        public eventType: EventType
    ) {}
}

export default Activity;