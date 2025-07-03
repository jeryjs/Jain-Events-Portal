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
        // Apply admin role logic for configured admin emails
        const adminEmails = (process.env.ADMIN_EMAILS || "jery99961@gmail.com").split(",").map(e => e.trim().toLowerCase());
        if (data.username && adminEmails.includes(data.username.toLowerCase()) && data.role < constants_1.Role.ADMIN) {
            data.role = constants_1.Role.ADMIN;
        }
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
