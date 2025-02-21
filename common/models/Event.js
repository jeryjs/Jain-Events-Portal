class Event {
	constructor(eventId, name, eventType) {
		this.eventId = eventId;
		this.name = name;
		// this.activities = activities; // array of Activity (or subclass) instances
		this.eventType = eventType
	}
}

export default Event;
