import { EventType, Gender } from "@common/constants";

export default class Participant {
  constructor(
    public usn: string,
    public name: string,
    public gender: Gender,
    public event: EventType
  ) {}

  static parse(data: any): Participant {
    return new Participant(data.usn, data.name, data.gender, data.event);
  }
}
