import { EventType, Gender } from "@common/constants";
import Participant from "../Participant";

class Judge extends Participant {
    constructor(
        public id: string,
        public name: string,
        public profilePic: string,
        public description: string,
        public portfolio: string,   // HTML Content
    ) {
        super(id, name, Gender.OTHER, '', '', '', EventType.GENERAL, '', profilePic);
    }

    static parse(data: any): Judge {
        const defaultProfilePic = `https://eu.ui-avatars.com/api/?name=${data.name}`;
        return new Judge(data.id, data.name, data.profilePic || defaultProfilePic, data.description, data.portfolio);
    }
}

export default Judge;