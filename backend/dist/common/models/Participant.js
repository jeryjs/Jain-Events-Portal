"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Participant {
    constructor(usn, name, gender, event) {
        this.usn = usn;
        this.name = name;
        this.gender = gender;
        this.event = event;
    }
    static parse(data) {
        return new Participant(data.usn, data.name, data.gender, data.event);
    }
}
exports.default = Participant;
