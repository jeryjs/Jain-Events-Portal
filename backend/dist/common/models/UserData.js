"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class UserData {
    constructor(username, role, name) {
        this.username = username;
        this.role = role;
        this.name = name;
    }
    static parse(data) {
        return new UserData(data.username || '', data.role || constants_1.Role.USER, data.name || '');
    }
    toJSON() {
        return {
            username: this.username,
            role: this.role,
            name: this.name
        };
    }
}
exports.default = UserData;
