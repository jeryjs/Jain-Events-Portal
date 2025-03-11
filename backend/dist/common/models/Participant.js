"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Participant {
    constructor(usn, name, gender, email, phone, branch, event) {
        this.usn = usn;
        this.name = name;
        this.gender = gender;
        this.email = email;
        this.phone = phone;
        this.branch = branch;
        this.event = event;
    }
    static parse(data) {
        return new Participant(data.usn, data.name, data.gender, data.email, data.phone, data.branch, data.event);
    }
    get detailsString() {
        return `USN: ${this.usn} • Phone: ${this.phone} • Email: ${this.email}`;
    }
}
exports.default = Participant;
