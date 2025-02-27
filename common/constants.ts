export enum EventType {
    GENERAL = 0,

    SPORTS = 1000,
    VOLLEYBALL = 1001,
    FOOTBALL = 1002,
    CRICKET = 1003,
    
    CULTURAL = 2000,
    DANCE = 2001,
    SINGING = 2002,
    DJ = 2003,

    TECH = 3000,
    CODING = 3001,
    HACKATHON = 3002,
    QUIZ = 3003,
    WORKSHOP = 3004,
}

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

export enum Role {
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest',
    MANAGER = 'manager',
}

export enum Gender {
    MALE = 'male',    
    FEMALE = 'female',
    OTHER = 'other',
}