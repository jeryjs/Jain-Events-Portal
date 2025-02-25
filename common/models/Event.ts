import { EventType } from "@common/constants";

export default class Event {
  public timings: Date[];

  constructor(
    public id: string,
    public name: string,
    public type: EventType,
    timings: any[] | Date[],
    public description: string,
    public venue: string
  ) {
    // Convert Timestamp-like objects (from firestore) to Date
    this.timings = timings.map(t => {
		// If already a Date object
		if (t instanceof Date) return t;
		
		// If it's a seconds+nanoseconds format (Firestore serialized timestamp)
		if (t && typeof t._seconds === 'number' && typeof t._nanoseconds === 'number') {
		  return new Date((t._seconds * 1000) + (t._nanoseconds / 1000000));
		}
      return new Date(t as any);
    });
  }

  static parse(data: any): Event {
    return new Event(
      data.id,
      data.name,
      data.type,
      data.timings,
      data.description,
      data.venue
    );
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