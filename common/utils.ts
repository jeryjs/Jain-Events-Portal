import Event from './models/Event';
import Activity from './models/Activity';
import Participant from './models/Participant';
import CulturalActivity from './models/culturals/CulturalActivity';
import SportActivity from './models/sports/SportsActivity';
import { CricketPlayer, FootballPlayer, BasketballPlayer } from './models/sports/SportsParticipant';
import { EVENT_TYPE } from './constants';

// Define types for event, activity, and participant data
interface EventData {
    id: number;
    name: string;
    type: number;
}

interface ActivityData {
    activityId: number;
    name: string;
    eventType: number;
    participants: ParticipantData[];
    rounds?: number;
    performanceDetails?: string;
}

interface ParticipantData {
    id: number;
    name: string;
    age: number;
    role: string;
    [key: string]: any; // Allows for additional dynamic properties
}

function parseEvent(data: EventData): Event {    
    return new Event(
        data.id,
        data.name,
        // data.activities.map(parseActivity), // Uncomment if needed
        data.type
    );
}

function parseActivity(data: ActivityData): Activity {
    switch (data.eventType) {
        case EVENT_TYPE.SPORTS:
        case EVENT_TYPE.VOLEYBALL:
        case EVENT_TYPE.FOOTBALL:
        case EVENT_TYPE.CRICKET:
            return new SportActivity(
                data.activityId,
                data.name,
                data.participants.map(parseParticipant),
                data.rounds
            );
        case EVENT_TYPE.CULTURAL:
            return new CulturalActivity(
                data.activityId,
                data.name,
                data.participants.map(parseParticipant),
                data.performanceDetails
            );
        default:
            return new Activity(
                data.activityId,
                data.name,
                data.participants.map(parseParticipant),
                data.eventType
            );
    }
}

function parseParticipant(data: ParticipantData): Participant {
    switch (data.role) {
        case 'CricketPlayer':
            return new CricketPlayer(data.id, data.name, data.age, data.runs, data.wickets);
        case 'FootballPlayer':
            return new FootballPlayer(data.id, data.name, data.age, data.position, data.goals, data.assists);
        case 'BasketballPlayer':
            return new BasketballPlayer(data.id, data.name, data.age, data.points, data.rebounds, data.assists, data.steals, data.blocks);
        default:
            return new Participant(data.id, data.name, data.age);
    }
}

function getPrimaryEventType(data: { eventType: number }): typeof Activity {
    if (data.eventType > EVENT_TYPE.CULTURAL) return CulturalActivity;
    if (data.eventType > EVENT_TYPE.SPORTS) return SportActivity;
    throw new Error('Invalid event type'); // Ensures safety
}

export { parseEvent, parseActivity, parseParticipant };
