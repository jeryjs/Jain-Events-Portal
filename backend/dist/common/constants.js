"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gender = exports.Role = exports.ArticleStatus = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType[EventType["GENERAL"] = 0] = "GENERAL";
    EventType[EventType["INFO"] = 1] = "INFO";
    EventType[EventType["SPORTS"] = 1000] = "SPORTS";
    EventType[EventType["BASKETBALL"] = 1001] = "BASKETBALL";
    EventType[EventType["FOOTBALL"] = 1002] = "FOOTBALL";
    EventType[EventType["CRICKET"] = 1003] = "CRICKET";
    EventType[EventType["VOLLEYBALL"] = 1004] = "VOLLEYBALL";
    EventType[EventType["THROWBALL"] = 1005] = "THROWBALL";
    EventType[EventType["ATHLETICS"] = 1006] = "ATHLETICS";
    EventType[EventType["CULTURAL"] = 2000] = "CULTURAL";
    EventType[EventType["DANCE"] = 2001] = "DANCE";
    EventType[EventType["SINGING"] = 2002] = "SINGING";
    EventType[EventType["DJ"] = 2003] = "DJ";
    EventType[EventType["TECH"] = 3000] = "TECH";
    EventType[EventType["CODING"] = 3001] = "CODING";
    EventType[EventType["HACKATHON"] = 3002] = "HACKATHON";
    EventType[EventType["QUIZ"] = 3003] = "QUIZ";
    EventType[EventType["WORKSHOP"] = 3004] = "WORKSHOP";
})(EventType || (exports.EventType = EventType = {}));
var ArticleStatus;
(function (ArticleStatus) {
    ArticleStatus["DRAFT"] = "draft";
    ArticleStatus["PUBLISHED"] = "published";
    ArticleStatus["ARCHIVED"] = "archived";
})(ArticleStatus || (exports.ArticleStatus = ArticleStatus = {}));
var Role;
(function (Role) {
    Role[Role["GUEST"] = 0] = "GUEST";
    Role[Role["USER"] = 1] = "USER";
    Role[Role["MANAGER"] = 2] = "MANAGER";
    Role[Role["ADMIN"] = 3] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
})(Gender || (exports.Gender = Gender = {}));
