import { EventType } from './constants';
import Activity from './models/Activity';
import CulturalActivity from './models/culturals/CulturalActivity';
import SportsActivity from './models/sports/SportsActivity';

function parseActivity(data: any): Activity {
    switch (getBaseEventType(data.eventType)) {
        case EventType.SPORTS: return SportsActivity.parse(data);
        case EventType.CULTURAL: return CulturalActivity.parse(data);
        default: return Activity.parse(data);
    }
}

const getBaseEventType = (it: number): EventType => {
    if (it >= EventType.CULTURAL) return EventType.CULTURAL;
    else if (it >= EventType.SPORTS) return EventType.SPORTS;
    else return EventType.GENERAL;
};

export { parseActivity };

