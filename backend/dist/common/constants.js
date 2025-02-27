"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gender = exports.Role = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType[EventType["GENERAL"] = 0] = "GENERAL";
    EventType[EventType["SPORTS"] = 1000] = "SPORTS";
    EventType[EventType["VOLLEYBALL"] = 1001] = "VOLLEYBALL";
    EventType[EventType["FOOTBALL"] = 1002] = "FOOTBALL";
    EventType[EventType["CRICKET"] = 1003] = "CRICKET";
    EventType[EventType["CULTURAL"] = 2000] = "CULTURAL";
    EventType[EventType["DANCE"] = 2001] = "DANCE";
    EventType[EventType["SINGING"] = 2002] = "SINGING";
    EventType[EventType["DJ"] = 2003] = "DJ";
    EventType[EventType["TECH"] = 3000] = "TECH";
    EventType[EventType["CODING"] = 3001] = "CODING";
    EventType[EventType["HACKATHON"] = 3002] = "HACKATHON";
    EventType[EventType["QUIZ"] = 3003] = "QUIZ";
    EventType[EventType["WORKSHOP"] = 3004] = "WORKSHOP";
})(EventType || (exports.EventType = EventType = {}));
/*
// Create a mapping of Events
export const EventType = {
    GENERAL: { id: 0, name: 'General' },
    SPORTS: { id: 1000, name: 'Sports' },
    CULTURAL: { id: 2000, name: 'Cultural' },
    TECH: { id: 3000, name: 'Tech' },
} as const;

// Create a mapping of Activities
export const ActivityType = {
    GENERAL: { id: 0, name: 'General', event: EventType.GENERAL },

    VOLLEYBALL: { id: 1001, name: 'Volleyball', event: EventType.SPORTS },
    FOOTBALL: { id: 1002, name: 'Football', event: EventType.SPORTS },
    CRICKET: { id: 1003, name: 'Cricket', event: EventType.SPORTS },

    DANCE: { id: 2001, name: 'Dance', event: EventType.CULTURAL },
    SINGING: { id: 2002, name: 'Singing', event: EventType.CULTURAL },
    DJ: { id: 2003, name: 'DJ', event: EventType.CULTURAL },

    CODING: { id: 3001, name: 'Coding', event: EventType.TECH },
    HACKATHON: { id: 3002, name: 'Hackathon', event: EventType.TECH },
    QUIZ: { id: 3003, name: 'Quiz', event: EventType.TECH },
    WORKSHOP: { id: 3004, name: 'Workshop', event: EventType.TECH },
} as const;


type NewEventType = {
    GENERAL: {
        id: 0
    },

    SPORTS: {
        id: 1000,
        activity: {
            VOLLEYBALL: 1001,
            FOOTBALL: 1002,
            CRICKET: 1003,
        }
    },
    
    CULTURAL: {
        id: 2000,
        activity: {
            DANCE: 2001,
            SINGING: 2002,
            DJ: 2003,
        }
    },

    TECH: {
        id: 3000,
        activity: {
            CODING: 3001,
            HACKATHON: 3002,
            QUIZ: 3003,
            WORKSHOP: 3004,
        }
    }
}

type NewEventType2 = {
    GENERAL: {
        id: 0
    },

    SPORTS: {
        id: 1000,
        VOLLEYBALL: 1001,
        FOOTBALL: 1002,
        CRICKET: 1003,
    },

    CULTURAL: {
        id: 2000,
        DANCE: 2001,
        SINGING: 2002,
        DJ: 2003,
    },

    TECH: {
        id: 3000,
        CODING: 3001,
        HACKATHON: 3002,
        QUIZ: 3003,
        WORKSHOP: 3004,
    }
}
*/
var Role;
(function (Role) {
    Role["ADMIN"] = "admin";
    Role["USER"] = "user";
    Role["GUEST"] = "guest";
    Role["MANAGER"] = "manager";
})(Role || (exports.Role = Role = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
})(Gender || (exports.Gender = Gender = {}));
