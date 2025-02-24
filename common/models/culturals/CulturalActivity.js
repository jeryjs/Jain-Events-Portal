import Activity from '@common/models/Activity';
import { EVENT_TYPE } from '@common/constants';

class CulturalActivity extends Activity {
  constructor(activityId, name, participants, performanceDetails) {
    super(activityId, name, participants, EVENT_TYPE.CULTURAL);
    this.performanceDetails = performanceDetails;
  }
}

export default CulturalActivity;