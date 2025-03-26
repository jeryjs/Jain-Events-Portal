import { EventType, Gender } from "@common/constants";

export default class Participant {
  constructor(
    public usn: string,
    public name: string,
    public gender: Gender,
    public email: string,
    public phone: string,
    public branch: string,
    public event: EventType,
    public college: string = 'FET, JU',
    public profilePic: string = '',
  ) {
    if (this.profilePic === 'https://eu.ui-avatars.com/api/?name=undefined') {
      this.profilePic = (this.name ? `https://eu.ui-avatars.com/api/?name=${this.name}` : '');
    }
  }

  /**
   * Parses the provided data to create a Participant instance.
   * @param data - The data to parse
   * @param force - Whether to force parsing as the base class (Participant) or get the derived class (TeamParticipant)
   * @returns A Participant instance or a derived class instance (TeamParticipant)
   */
  static parse(data: any, force=false): Participant {
    if (!force && data.teamId) return TeamParticipant.parse(data); // for backward compatibility

    return new Participant(
      data.usn || '',
      data.name || '',
      data.gender || Gender.OTHER,
      data.email || '',
      data.phone || '',
      data.branch || '',
      data.event || EventType.GENERAL,
      data.college || 'FET, JU',
      data.profilePic || (data.name ? `https://eu.ui-avatars.com/api/?name=${data.name}` : '')
    );
  }

  get id() {
    return this.usn;
  }
  
  get detailsString() {
    return `USN: ${this.usn} • Phone: ${this.phone} • Email: ${this.email} • Branch: ${this.branch} • College: ${this.college}`;
  }
}

export class TeamParticipant extends Participant {
  constructor(
    usn: string,
    name: string,
    gender: Gender,
    email: string,
    phone: string,
    branch: string,
    event: EventType,
    college: string,
    profilePic: string,
    public teamId: string,
    public position: "playing" | "substitute" = "playing",
  ) {
    super(usn, name, gender, email, phone, branch, event, college, profilePic);
  }
  
  static parse(data: any): TeamParticipant {
    const s = Participant.parse(data, true); // force parse to get the base class properties
    return new TeamParticipant(
      s.usn, s.name, s.gender, s.email, s.phone,
      s.branch, s.event, s.college, s.profilePic,
      data.teamId || '',
      data.position || "playing",
    );
  }
  
  get isParticipating() {
    return this.position != "substitute";
  }

  // backward compatibility for SportsPlayer
  get isPlaying() {
    return this.isParticipating
  }
  
  get detailsString() {
    return `ID: ${this.usn} • College: ${this.college} • Team: ${this.teamId} • Position: ${this.position}`;
  }
}