import { getBaseEventType } from "@common/utils";
import { EventType } from "../../constants";
import Activity from "../Activity";
import SportsPlayer from "./SportsPlayer";

export class Cricket {
	innings: {
		bowlingTeam: string;
		battingTeam: string;
		overs: {
			bowlerId: string;
			balls: {
				batsmanId: string;
				runs: number;	// Runs scored by the batsman in this ball
				extraRuns: number;	// Extra runs scored in this ball from the type (like wide, no-ball, etc.)
				type: "W" | "NB" | "WD" | "B" | "LB";
			}[];
		}[];
	}[];

	get totalOvers() {
		return this.innings.reduce((total, i) => total + i.overs.length, 0);
	}

	getPlayerRuns(playerId: string) {
		return this.innings.reduce((total, i) => {
			return total + i.overs.reduce((total, o) => {
				return total + o.balls.reduce((total, b) => {
					return total + (b.batsmanId === playerId ? b.runs : 0);
				}, 0);
			}, 0);
		}, 0);
	}

	getTeamScore(teamId: string) {
		return (
			this.innings
				.find((i) => i.battingTeam === teamId)
				?.overs.reduce((total, o) => total + o.balls.reduce((total, b) => total + b.runs + b.extraRuns, 0), 0) || 0
		);
	}
}

export class Football {
	stats: {
		teamId: string;
		goals: { playerId: string }[];
		assists: { playerId: string }[];
		redCards: { playerId: string }[];
		yellowCards: { playerId: string }[];
		positions: { playerId: string; position: "Player" | "Benched" | "Goalkeeper" | "Defender" | "Midfielder" | "Forward"; }[];
	}[];

	getTotalGoals(teamId?: string) {
		if (teamId) {
			return this.stats.find((t) => t.teamId === teamId)?.goals.length || 0;
		}
		return this.stats.reduce((total, t) => total + t.goals.length, 0);
	}
}

export class Basketball {
	stats: {
		teamId: string;
		points: { playerId: string; points: number }[];
	}[];

	getTotalPoints(teamId?: string) {
		if (teamId) {
			return this.stats.find((t) => t.teamId === teamId)?.points.reduce((total, p) => total + p.points, 0) || 0;
		}
		return this.stats.reduce((total, t) => total + t.points.reduce((total, p) => total + p.points, 0), 0);
	}
}

// Generic sports specific stats
export class OtherSport {
	points: { teamId: string; points: number }[];
}

type Sport = Cricket | Football | Basketball | OtherSport;

class SportsActivity<T extends Sport> extends Activity {
	constructor(
		id: string,
		name: string,
		eventType: EventType,
		public teams: { id: string; name: string }[],
		public participants: SportsPlayer[],
		public game: T
	) {
		super(id, name, participants, eventType);
	}

	static parse(data: any): SportsActivity<Sport> {
		let gameType: Sport;
		switch (data.eventType as EventType) {
			case EventType.CRICKET: gameType = new Cricket(); break;
			case EventType.FOOTBALL: gameType = new Football(); break;
			case EventType.BASKETBALL: gameType = new Basketball(); break;
			default: gameType = new OtherSport();
		}

		const participants = data.participants.map((p: any) => SportsPlayer.parse(p));
		return new SportsActivity<typeof gameType>(data.id, data.name, data.eventType, data.teams, participants, data.game as typeof gameType);
	}

	getPlayer(playerId: string): SportsPlayer {
		return this.participants.find((p) => p.usn === playerId);
	}

	getTeamPlayers(teamId: string): SportsPlayer[] {
		return this.participants.filter((p) => p.teamId === teamId);
	}

	getTotalParticipants(): number {
		return this.participants.length;
	}
}

export default SportsActivity;
