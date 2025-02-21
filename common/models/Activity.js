class Activity {
  constructor(activityId, name, participants, eventType) {
    this.activityId = activityId;
    this.name = name;
    this.participants = participants; // array of Participant (or subclass) instances
    this.eventType = eventType;
  }
}

export default Activity;