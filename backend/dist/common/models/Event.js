"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@common/constants");
class Event {
    constructor(id, name, type, timings, description, venue, galleryLink, highlights, banner = [], managers) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.venue = venue;
        this.galleryLink = galleryLink;
        this.highlights = highlights;
        this.banner = banner;
        this.managers = managers;
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
    static parse(data = {}) {
        var _a, _b;
        // Make sure banner is always an array with the correct shape
        let banner = data.banner || [{ type: 'image' }];
        if (!Array.isArray(banner)) {
            // Convert legacy banner format to new format
            banner = [{
                    url: ((_a = data.banner) === null || _a === void 0 ? void 0 : _a.url) || undefined,
                    customCss: ((_b = data.banner) === null || _b === void 0 ? void 0 : _b.customCss) || undefined,
                    type: 'image'
                }];
        }
        return new Event(data.id || "", data.name || "", data.type || constants_1.EventType.GENERAL, data.timings || [], data.description || "", data.venue || "", data.galleryLink || "", data.highlights || "", banner, data.managers || []);
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
            highlights: this.highlights,
            banner: this.banner,
            managers: this.managers,
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
    get activeBanner() {
        return this.banner && this.banner.length > 0 ? this.banner[0] : { type: 'image' };
    }
    // Convert event image CSS string to object
    getBannerStyles(bannerItem) {
        if (!bannerItem.customCss)
            return {};
        return bannerItem.customCss
            .split(";")
            .filter(Boolean)
            .reduce((styleObj, rule) => {
            const [prop, value] = rule.split(":").map((s) => s.trim());
            if (prop && value) {
                // Convert kebab-case to camelCase
                const camelProp = prop.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
                styleObj[camelProp] = value;
            }
            return styleObj;
        }, {});
    }
    get activeBannerStyles() {
        return this.getBannerStyles(this.activeBanner);
    }
}
exports.default = Event;
