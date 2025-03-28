import { EventType } from "@common/constants";

export interface BannerItem {
	url?: string;
	customCss?: string;
	type?: 'image' | 'video';
}

export default class Event {
	public timings: Date[];

	constructor(
		public id: string,
		public name: string,
		public type: EventType,
		timings: any[] | Date[],
		public description: string,
		public venue: string,
		public galleryLink: string,
		public banner: BannerItem[] = []
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
	}

	static parse(data: any): Event {
		// Make sure banner is always an array with the correct shape
		let banner = data.banner || [{ type: 'image' }];
		if (!Array.isArray(banner)) {
			// Convert legacy banner format to new format
			banner = [{ 
				url: data.banner?.url || undefined, 
				customCss: data.banner?.customCss || undefined,
				type: 'image' 
			}];
		}
		
		// Ensure each banner item has a type
		banner = banner.map(item => ({
			...item,
			type: item.type || 'image'
		}));
		
		return new Event(
			data.id || "",
			data.name || "",
			data.type || EventType.GENERAL,
			data.timings || [],
			data.description || "",
			data.venue || "",
			data.galleryLink || "",
			banner
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
			galleryLink: this.galleryLink,
			banner: this.banner,
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

	// Get the current active banner item or return first one
	get activeBanner(): BannerItem {
		return this.banner && this.banner.length > 0 ? this.banner[0] : { type: 'image' };
	}

	// Convert event image CSS string to object
	getBannerStyles(bannerItem: BannerItem): Record<string, string> {
		if (!bannerItem.customCss) return {};

		return bannerItem.customCss
			.split(";")
			.filter(Boolean)
			.reduce<Record<string, string>>((styleObj, rule) => {
				const [prop, value] = rule.split(":").map((s) => s.trim());
				if (prop && value) {
					// Convert kebab-case to camelCase
					const camelProp = prop.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
					styleObj[camelProp] = value;
				}
				return styleObj;
			}, {});
	}

	get eventBannerStyles(): Record<string, string> {
		return this.getBannerStyles(this.activeBanner);
	}
}
