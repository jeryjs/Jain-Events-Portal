import Activity from '../Activity';
import { EventType } from '../../constants';
import Participant from '../Participant';

class CulturalActivity extends Activity {
  constructor(
    activityId: string, 
    name: string, 
    participants: Participant[], 
    public performanceDetails: string
  ) {
    super(activityId, name, participants, EventType.CULTURAL);
  }
}

export default CulturalActivity;