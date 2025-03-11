"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@common/constants");
class Event {
    constructor(id, name, type, timings, description, venue, galleryLink, banner) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.venue = venue;
        this.galleryLink = galleryLink;
        this.banner = banner;
        // Convert Timestamp-like objects (from firestore) to Date
        this.timings = timings.map((t) => {
            // If already a Date object
            if (t instanceof Date)
                return t;
            // If it's a seconds+nanoseconds format (Firestore serialized timestamp)
            if (t && typeof t._seconds === "number" && typeof t._nanoseconds === "number") {
                return new Date(t._seconds * 1000 + t._nanoseconds / 1000000);
            }
            return new Date(t);
        });
    }
    static parse(data) {
        return new Event(data.id || '', data.name || '', data.type || constants_1.EventType.GENERAL, data.timings || [], data.description || '', data.venue || '', data.galleryLink || '', data.banner || {});
    }
    toJSON() {
        // If there are timings, ensure they're stored as Firestore timestamps
        if (this.timings && Array.isArray(this.timings)) {
            this.timings = this.timings.map((date) => (date instanceof Date ? date : new Date(date)));
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
    // Convert event image CSS string to object
    get eventBannerStyles() {
        if (!this.banner.customCss)
            return {};
        return this.banner.customCss
            .split(";")
            .filter(Boolean)
            .reduce((styleObj, rule) => {
            const [prop, value] = rule.split(":").map(s => s.trim());
            if (prop && value) {
                // Convert kebab-case to camelCase
                const camelProp = prop.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
                styleObj[camelProp] = value;
            }
            return styleObj;
        }, {});
    }
}
exports.default = Event;
