"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CulturalActivity = exports.SportsPlayer = exports.SportsActivity = exports.Participant = exports.Event = exports.Activity = void 0;
// Export base models
var Activity_1 = require("./Activity");
Object.defineProperty(exports, "Activity", { enumerable: true, get: function () { return __importDefault(Activity_1).default; } });
var Event_1 = require("./Event");
Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return __importDefault(Event_1).default; } });
var Participant_1 = require("./Participant");
Object.defineProperty(exports, "Participant", { enumerable: true, get: function () { return __importDefault(Participant_1).default; } });
// Export sports models
var SportsActivity_1 = require("./sports/SportsActivity");
Object.defineProperty(exports, "SportsActivity", { enumerable: true, get: function () { return __importDefault(SportsActivity_1).default; } });
var SportsParticipant_1 = require("./sports/SportsParticipant");
Object.defineProperty(exports, "SportsPlayer", { enumerable: true, get: function () { return __importDefault(SportsParticipant_1).default; } });
// Export culturals models
var CulturalActivity_1 = require("./culturals/CulturalActivity");
Object.defineProperty(exports, "CulturalActivity", { enumerable: true, get: function () { return __importDefault(CulturalActivity_1).default; } });
