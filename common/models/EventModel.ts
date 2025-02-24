class EventModel {
	eventId: string;
	name: string;
	eventType: number;
	constructor(eventId: string, name: string, eventType: number) {
		this.eventId = eventId;
		this.name = name;
		// this.activities = activities; // array of Activity (or subclass) instances
		this.eventType = eventType;
	}
}

export default EventModel;
