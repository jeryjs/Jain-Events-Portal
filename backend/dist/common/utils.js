"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseEventType = void 0;
exports.parseEvents = parseEvents;
exports.parseActivities = parseActivities;
const constants_1 = require("./constants");
const models_1 = require("./models");
function parseEvents(data) {
    return data.map((it) => models_1.Event.parse(it));
}
function parseActivities(data) {
    return data.map((it) => models_1.Activity.parse(it));
}
const getBaseEventType = (it) => {
    if (it >= constants_1.EventType.CULTURAL)
        return constants_1.EventType.CULTURAL;
    else if (it >= constants_1.EventType.SPORTS)
        return constants_1.EventType.SPORTS;
    else
        return constants_1.EventType.GENERAL;
};
exports.getBaseEventType = getBaseEventType;
