"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityTypes = exports.getAllBaseEventTypes = exports.getBaseEventType = void 0;
exports.parseEvents = parseEvents;
exports.parseActivities = parseActivities;
exports.parseArticles = parseArticles;
const constants_1 = require("./constants");
const models_1 = require("./models");
function parseEvents(data) {
    return data
        .map(models_1.Event.parse)
        .sort((a, b) => {
        var _a, _b;
        return new Date(((_a = a.time) === null || _a === void 0 ? void 0 : _a.start) || Date.now()).getTime() -
            new Date(((_b = b.time) === null || _b === void 0 ? void 0 : _b.start) || Date.now()).getTime();
    });
}
function parseActivities(data) {
    return data
        .map(models_1.Activity.parse)
        .sort((a, b) => new Date(a.startTime || Date.now()).getTime() -
        new Date(b.startTime || Date.now()).getTime());
}
function parseArticles(data) {
    return data
        .map(models_1.Article.parse)
        .sort((a, b) => new Date(a.publishedAt || Date.now()).getTime() -
        new Date(b.publishedAt || Date.now()).getTime());
}
const getBaseEventType = (it) => {
    if (it >= constants_1.EventType.NSS)
        return constants_1.EventType.NSS;
    if (it >= constants_1.EventType.TECH)
        return constants_1.EventType.TECH;
    if (it >= constants_1.EventType.CULTURAL)
        return constants_1.EventType.CULTURAL;
    if (it >= constants_1.EventType.SPORTS)
        return constants_1.EventType.SPORTS;
    if (it >= constants_1.EventType.INFO)
        return constants_1.EventType.INFO;
    return constants_1.EventType.GENERAL;
};
exports.getBaseEventType = getBaseEventType;
const getAllBaseEventTypes = () => {
    return Object.values(constants_1.EventType)
        .filter((value) => typeof value === "number" && value % 1000 === 0);
};
exports.getAllBaseEventTypes = getAllBaseEventTypes;
const getActivityTypes = (type) => {
    const nextBaseType = type + 1000;
    const types = [];
    for (let i = type + 1; i < nextBaseType; i++) {
        if (constants_1.EventType[i]) {
            types.push(i);
        }
    }
    return types;
};
exports.getActivityTypes = getActivityTypes;
