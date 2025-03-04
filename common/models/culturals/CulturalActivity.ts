import Activity from '../Activity';
import { EventType } from '../../constants';
import Participant from '../Participant';

class CulturalActivity extends Activity {
  constructor(
    id: string, 
    name: string, 
    time: Date,
    participants: Participant[], 
    public performanceDetails: string
  ) {
    super(id, name, time, participants, EventType.CULTURAL);
  }

  static parse(data: any): CulturalActivity {
    const participants = data.participants.map((p: any) => Participant.parse(p));
    return new CulturalActivity(data.id, data.name, data.time, participants, data.performanceDetails);
  }
}

export default CulturalActivity;