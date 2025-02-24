class Activity {
    activityId: number;
    name: string;
    participants: any[]; // This will be an array of Participant (or subclasses) instances
    eventType: number;
  
    constructor(activityId: number, name: string, participants: any[], eventType: number) { 
        this.activityId = activityId;
        this.name = name;
        this.participants = participants;
        this.eventType = eventType;
    }
}

export default Activity;
