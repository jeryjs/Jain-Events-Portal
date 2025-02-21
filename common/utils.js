import Activity from '@common/models/Activity';
import Participant from '@common/models/Participant';
import CulturalActivity from '@common/models/culturals/CulturalActivity';
import SportActivity from '@common/models/sports/SportsActivity';
import { CricketPlayer, FootballPlayer, BasketballPlayer } from '@common/models/sports/SportsParticipant';
import { EVENT_TYPE } from '@common/constants';

function parseActivity(data) {
    switch (data.eventType) {
        case EVENT_TYPE.SPORTS:
            return new SportActivity(data.activityId, data.name, data.participants.map(parseParticipant), data.rounds);
        case EVENT_TYPE.VOLEYBALL:
        case EVENT_TYPE.FOOTBALL:
        case EVENT_TYPE.CRICKET:
            return new SportActivity(data.activityId, data.name, data.participants.map(parseParticipant), data.rounds);
        case EVENT_TYPE.CULTURAL:
            return new CulturalActivity(data.activityId, data.name, data.participants.map(parseParticipant), data.performanceDetails);
        default:
            return new Activity(data.activityId, data.name, data.participants.map(parseParticipant), data.eventType);
    }
}

function parseParticipant(data) {
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

function getPrimaryEventType(data) {
    if (data.eventType > 2000) return CulturalActivity;
    if (data.eventType > 1000) return SportActivity;
}

export { parseActivity, parseParticipant };