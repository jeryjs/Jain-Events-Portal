"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamParticipant = void 0;
const constants_1 = require("@common/constants");
class Participant {
    constructor(usn, name, gender, email, phone, branch, event, college = 'FET, JU', profilePic = '') {
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
    /**
     * Parses the provided data to create a Participant instance.
     * @param data - The data to parse
     * @param force - Whether to force parsing as the base class (Participant) or get the derived class (TeamParticipant)
     * @returns A Participant instance or a derived class instance (TeamParticipant)
     */
    static parse(data, force = false) {
        if (!force && data.teamId)
            return TeamParticipant.parse(data); // for backward compatibility
        return new Participant(data.usn || '', data.name || '', data.gender || constants_1.Gender.OTHER, data.email || '', data.phone || '', data.branch || '', data.event || constants_1.EventType.GENERAL, data.college || 'FET, JU', data.profilePic || `https://eu.ui-avatars.com/api/?name=${data.name}`);
    }
    get detailsString() {
        return `USN: ${this.usn} • Phone: ${this.phone} • Email: ${this.email} • Branch: ${this.branch} • College: ${this.college}`;
    }
}
exports.default = Participant;
class TeamParticipant extends Participant {
    constructor(usn, name, gender, email, phone, branch, event, college, profilePic, teamId, position = "playing") {
        super(usn, name, gender, email, phone, branch, event, college, profilePic);
        this.teamId = teamId;
        this.position = position;
    }
    static parse(data) {
        const s = Participant.parse(data, true); // force parse to get the base class properties
        return new TeamParticipant(s.usn, s.name, s.gender, s.email, s.phone, s.branch, s.event, s.college, s.profilePic, data.teamId || '', data.position || "playing");
    }
    get isParticipating() {
        return this.position != "substitute";
    }
    // backward compatibility for SportsPlayer
    get isPlaying() {
        return this.isParticipating;
    }
    get detailsString() {
        return `ID: ${this.usn} • College: ${this.college} • Team: ${this.teamId} • Position: ${this.position}`;
    }
}
exports.TeamParticipant = TeamParticipant;
