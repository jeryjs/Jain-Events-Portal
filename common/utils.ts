import { EventType } from './constants';
import { Event, Activity, Article } from './models';

export function parseEvents(data: any[]): Event[] {
    return data
        .map(Event.parse)
        .sort((a, b) => 
            new Date(a.time?.start || Date.now()).getTime() -
            new Date(b.time?.start || Date.now()).getTime()
        );
}

export function parseActivities(data: any[]): Activity[] {
    return data
        .map(Activity.parse)
        .sort((a, b) =>
            new Date(a.startTime || Date.now()).getTime() -
            new Date(b.startTime || Date.now()).getTime()
        );
}

export function parseArticles(data: any[]): Article[] {
    return data
        .map(Article.parse)
        .sort((a, b) =>
            new Date(a.publishedAt || Date.now()).getTime() -
            new Date(b.publishedAt || Date.now()).getTime()
        );
}

export const getBaseEventType = (it: number): EventType => {
    if (it >= EventType.TECH) return EventType.TECH;
    if (it >= EventType.CULTURAL) return EventType.CULTURAL;
    if (it >= EventType.SPORTS) return EventType.SPORTS;
    return EventType.GENERAL;
};

export const getActivityTypes = (type: EventType): EventType[] => {
    const nextBaseType = type + 1000;
    const types: EventType[] = [];
    for (let i = type + 1; i < nextBaseType; i++) {
        if (EventType[i]) {
            types.push(i);
        }
    }
    return types;
}
