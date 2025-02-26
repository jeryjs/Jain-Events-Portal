import { EventType } from './constants';
import { Event, Activity } from './models';

export function parseEvents(data: any[]): Event[] {
    return data.map((it: any) => Event.parse(it));
}

export function parseActivities(data: any[]): Activity[] {
    return data.map((it: any) => Activity.parse(it));
}

export const getBaseEventType = (it: number): EventType => {
    if (it >= EventType.CULTURAL) return EventType.CULTURAL;
    else if (it >= EventType.SPORTS) return EventType.SPORTS;
    else return EventType.GENERAL;
};
