import Participant from '../Participant';
import { EventType, Gender } from '../../constants';

export default class SportsPlayer extends Participant {
  constructor(
    usn: string,
    name: string,
    gender: Gender,
    event: EventType,
    public teamId: string,
    public stats: {}
  ) {
    super(usn, name, gender, event);
  }

  static parse(data: any): SportsPlayer {
    const s = super.parse(data);
    return new SportsPlayer(s.usn, s.name, s.gender, s.event, data.teamId, data.stats);
  }
}