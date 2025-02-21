class Event {
	constructor(eventId, name, activities) {
		this.eventId = eventId;
		this.name = name;
		this.activities = activities; // array of Activity (or subclass) instances
	}
}

export default Event;
