"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@common/constants");
const Participant_1 = __importDefault(require("../Participant"));
class Judge extends Participant_1.default {
    constructor(id, name, profilePic, description, portfolio) {
        super(id, name, constants_1.Gender.OTHER, '', '', '', constants_1.EventType.GENERAL, '', profilePic);
        this.id = id;
        this.name = name;
        this.profilePic = profilePic;
        this.description = description;
        this.portfolio = portfolio;
    }
    static parse(data) {
        return new Judge(data.id, data.name, data.profilePic || `https://eu.ui-avatars.com/api/?name=${data.name}`, data.description, data.portfolio);
    }
}
exports.default = Judge;
