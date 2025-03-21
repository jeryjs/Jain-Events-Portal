"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Participant {
    constructor(usn, name, gender, email, phone, branch, event, college = 'FET, JU', profilePic) {
        this.usn = usn;
        this.name = name;
        this.gender = gender;
        this.email = email;
        this.phone = phone;
        this.branch = branch;
        this.event = event;
        this.college = college;
        this.profilePic = profilePic;
    }
    static parse(data) {
        return new Participant(data.usn, data.name, data.gender, data.email, data.phone, data.branch, data.event, data.college, data.profilePic);
    }
    get detailsString() {
        return `USN: ${this.usn} • Phone: ${this.phone} • Email: ${this.email} • Branch: ${this.branch} • College: ${this.college}`;
    }
}
exports.default = Participant;
