import Activity from '../Activity';
import Participant from '../Participant';
import { EventType } from '../../constants';

export default class InfoActivity extends Activity {
    constructor(
        id: string,
        name: string,
        startTime: Date,
        endTime: Date,
        public content: string // Markdown content
    ) {
        super(id, name, startTime, endTime, [], EventType.INFO);
    }

    static parse(data: any): InfoActivity {
        return new InfoActivity(
            data.id || '',
            data.name || '',
            data.startTime || null,
            data.endTime || null,
            data.content || '' // Parse markdown content
        );
    }
}
