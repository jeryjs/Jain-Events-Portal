import { EventType } from "@common/constants";
import { Timestamp } from 'firebase-admin/firestore';

export default class Event {
	public time: { start: Date; end: Date };

	constructor(
		public id: string,
		public name: string,
		public eventType: EventType,
		public timings: Timestamp[],
		public description: string,
		public venue: string
	) {
		this.time = {
			start: Date(this.timings[0]._seconds),
			end: Date(this.timings[this.timings.length - 1]._seconds),
		};
	}

	static parse(data: any): Event {
		return new Event(
			data.id,
			data.name,
			data.eventType,
			data.timings,
			data.description,
			data.venue
		);
	}

	getDuration(): number {
		const start = this.time.start.getTime();
		const end = this.timings[this.timings.length - 1].toDate().getTime();
		return end - start;
	}
}
