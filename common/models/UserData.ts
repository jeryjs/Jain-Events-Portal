import { Role } from '../constants';

export default class UserData {
    constructor(
        public name: string,
        public username: string,
        public role: Role,
        public profilePic: string,
    ) {}

    static parse(data: any): UserData {
        if (typeof data === 'string') data = JSON.parse(data);

		// Apply admin role logic for configured admin emails
		const adminEmails = (process.env.ADMIN_EMAILS || "jery99961@gmail.com").split(",").map(e => e.trim().toLowerCase());
		if (data.username && adminEmails.includes(data.username.toLowerCase()) && data.role < Role.ADMIN) {
			data.role = Role.ADMIN;
		}
        
        return new UserData(
            data.name || '',
            data.username || data.email || '',
            data.role || Role.USER,
            data.profilePic || data.profile || `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`
        );
    }

    toJSON(): object {
        return {
            name: this.name,
            username: this.username,
            role: this.role,
            profilePic: this.profilePic,
        };
    }
}
