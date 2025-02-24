import Activity from "../Activity";
import { EventType } from "../../constants";
import SportsPlayer, { Sport } from "./SportsParticipant";

class SportActivity extends Activity {
    constructor(
        public id: string, 
        public name: string,   
        public participants: SportsPlayer<Sport>[],
        public eventType: EventType
    ) {
        super(id, name, participants, eventType);
    }

    static parse(data: any): SportActivity {
        const participants = data.participants.map((p: any) => SportsPlayer.parse(p));
        return new SportActivity(data.id, data.name, participants, data.eventType);
    }

    getTotalParticipants(): number {
        return this.participants.length;
    }
}

export default SportActivity;
