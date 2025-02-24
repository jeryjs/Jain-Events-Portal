import Activity from '@common/models/Activity';
import { EVENT_TYPE } from '@common/constants';

class SportActivity extends Activity {
  constructor(activityId, name, participants, rounds) {
    super(activityId, name, participants, EVENT_TYPE.SPORTS);
    this.rounds = rounds;
  }
}

export default SportActivity;