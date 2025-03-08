import { Role } from '../constants';

export default class UserData {
    constructor(
        public username: string,
        public role: Role,
        public name?: string
    ) {}

    static parse(data: any): UserData {
        return new UserData(
            data.username || '',
            data.role || Role.USER,
            data.name || ''
        );
    }

    toJSON(): object {
        return {
            username: this.username,
            role: this.role,
            name: this.name
        };
    }
}
