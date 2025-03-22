"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Activity_1 = __importDefault(require("../Activity"));
const constants_1 = require("../../constants");
class InfoActivity extends Activity_1.default {
    constructor(id, name, startTime, endTime, content // Markdown content
    ) {
        super(id, name, startTime, endTime, [], constants_1.EventType.INFO);
        this.content = content;
    }
    static parse(data) {
        return new InfoActivity(data.id || '', data.name || '', data.startTime || null, data.endTime || null, data.content || '' // Parse markdown content
        );
    }
}
exports.default = InfoActivity;
