"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CulturalActivity = exports.SportsPlayer = exports.OtherSport = exports.Basketball = exports.Football = exports.Cricket = exports.SportsActivity = exports.Article = exports.Participant = exports.Event = exports.Activity = exports.UserData = void 0;
// Export base models
var UserData_1 = require("./UserData");
Object.defineProperty(exports, "UserData", { enumerable: true, get: function () { return __importDefault(UserData_1).default; } });
var Activity_1 = require("./Activity");
Object.defineProperty(exports, "Activity", { enumerable: true, get: function () { return __importDefault(Activity_1).default; } });
var Event_1 = require("./Event");
Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return __importDefault(Event_1).default; } });
var Participant_1 = require("./Participant");
Object.defineProperty(exports, "Participant", { enumerable: true, get: function () { return __importDefault(Participant_1).default; } });
var Article_1 = require("./Article");
Object.defineProperty(exports, "Article", { enumerable: true, get: function () { return __importDefault(Article_1).default; } });
// Export sports models
var SportsActivity_1 = require("./sports/SportsActivity");
Object.defineProperty(exports, "SportsActivity", { enumerable: true, get: function () { return __importDefault(SportsActivity_1).default; } });
Object.defineProperty(exports, "Cricket", { enumerable: true, get: function () { return SportsActivity_1.Cricket; } });
Object.defineProperty(exports, "Football", { enumerable: true, get: function () { return SportsActivity_1.Football; } });
Object.defineProperty(exports, "Basketball", { enumerable: true, get: function () { return SportsActivity_1.Basketball; } });
Object.defineProperty(exports, "OtherSport", { enumerable: true, get: function () { return SportsActivity_1.OtherSport; } });
var SportsPlayer_1 = require("./sports/SportsPlayer");
Object.defineProperty(exports, "SportsPlayer", { enumerable: true, get: function () { return __importDefault(SportsPlayer_1).default; } });
// Export culturals models
var CulturalActivity_1 = require("./culturals/CulturalActivity");
Object.defineProperty(exports, "CulturalActivity", { enumerable: true, get: function () { return __importDefault(CulturalActivity_1).default; } });
