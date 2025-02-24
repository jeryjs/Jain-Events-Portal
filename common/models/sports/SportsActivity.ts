import Activity from "../Activity";
import { EventType } from "../../constants";
import Participant from "../Participant";

class SportActivity extends Activity {
	constructor(
    activityId: string, 
    name: string,   
    participants: Participant[], 
    public rounds: number
	) {
		super(activityId, name, participants, EventType.SPORTS);
	}
}

export default SportActivity;
