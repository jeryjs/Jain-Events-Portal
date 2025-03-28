"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class UserData {
    constructor(name, username, role, profilePic) {
        this.name = name;
        this.username = username;
        this.role = role;
        this.profilePic = profilePic;
    }
    static parse(data) {
        if (typeof data === 'string')
            data = JSON.parse(data);
        return new UserData(data.name || '', data.username || data.email || '', data.role || constants_1.Role.USER, data.profilePic || data.profile || `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`);
    }
    toJSON() {
        return {
            name: this.name,
            username: this.username,
            role: this.role,
            profilePic: this.profilePic,
        };
    }
}
exports.default = UserData;
