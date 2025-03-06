import { EventType, Gender } from "@common/constants";

export default class Participant {
  constructor(
    public usn: string,
    public name: string,
    public gender: Gender,
    public email: string,
    public phone: string,
    public branch: string,
    public event: EventType
  ) {}

  static parse(data: any): Participant {
    return new Participant(data.usn, data.name, data.gender, data.email, data.phone, data.branch, data.event);
  }

  get detailsString() {
    return `USN: ${this.usn} • Phone: ${this.phone} • Email: ${this.email}`
  }
}
