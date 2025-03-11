import Participant from '../Participant';
import { EventType, Gender } from '../../constants';

export default class SportsPlayer extends Participant {
  constructor(
    usn: string,
    name: string,
    gender: Gender,
    email: string,
    phone: string,
    branch: string,
    event: EventType,
    public teamId: string,
    public position: string,
    public stats: {}
  ) {
    super(usn, name, gender, email, phone, branch, event);
  }

  static parse(data: any): SportsPlayer {
    const s = super.parse(data);
    return new SportsPlayer(s.usn, s.name, s.gender, s.email, s.phone, s.branch, s.event, data.teamId, data.position, data.stats);
  }

  get detailsString() {
    return `USN: ${this.usn} • Phone: ${this.phone} • Email: ${this.email} • Team: ${this.teamId} • Position: ${this.position}`;
  }
}