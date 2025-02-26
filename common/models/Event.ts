import { EventType } from "@common/constants";

type heroImageFit = "cover" | "contain" | "fill" | "none" | "scale-down";

export default class Event {
	public timings: Date[];
	public heroImage?: {
		url?: string;
		position?: heroImageFit;
		showHero?: boolean;
	};

	constructor(
		public id: string,
		public name: string,
		public type: EventType,
		timings: any[] | Date[],
		public description: string,
		public venue: string,
		heroImage?: { url?: string; position?: heroImageFit; showHero?: boolean }
	) {
		// Convert Timestamp-like objects (from firestore) to Date
		this.timings = timings.map((t) => {
			// If already a Date object
			if (t instanceof Date) return t;

			// If it's a seconds+nanoseconds format (Firestore serialized timestamp)
			if (t && typeof t._seconds === "number" && typeof t._nanoseconds === "number") {
				return new Date(t._seconds * 1000 + t._nanoseconds / 1000000);
			}
			return new Date(t as any);
		});

		// Set hero image if provided
		if (heroImage) {
			this.heroImage = {
				url: heroImage.url,
				position: heroImage.position as heroImageFit,
				showHero: heroImage.showHero ?? true,
			};
		}
	}

	static parse(data: any): Event {
		return new Event(
			data.id,
			data.name,
			data.type,
			data.timings || (data.time ? [data.time.start, data.time.end] : []),
			data.description,
			data.venue,
			data.heroImage
		);
	}

	toJSON() {
		// If there are timings, ensure they're stored as Firestore timestamps
		if (this.timings && Array.isArray(this.timings)) {
			this.timings = this.timings.map((date: any) => (date instanceof Date ? date : new Date(date)));
		}
		return {
			id: this.id,
			name: this.name,
			type: this.type,
			timings: this.timings.map((t) => t.toISOString()),
			description: this.description,
			venue: this.venue,
			heroImage: this.heroImage,
		};
	}

	get time() {
		return {
			start: this.timings[0],
			end: this.timings[this.timings.length - 1],
		};
	}

	get duration() {
		const start = this.time.start.getTime();
		const end = this.time.end.getTime();
		return end - start;
	}
}
