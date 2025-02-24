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

  static parse(data: any): CulturalActivity {
    const participants = data.participants.map((p: any) => Participant.parse(p));
    return new CulturalActivity(data.activityId, data.name, participants, data.performanceDetails);
  }
}

export default CulturalActivity;