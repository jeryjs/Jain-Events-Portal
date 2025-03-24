import { EventType } from "../../constants";
import Activity from "../Activity";
import SportsPlayer from "./SportsPlayer";

export class Cricket {
	tossWinner: {
		teamId: string;
		choice: "bat" | "bowl";
	} = {} as any;
	innings: {
		bowlingTeam: string;
		battingTeam: string;
		overs: {
			bowlerId: string;
			balls: {
				batsmanId: string;
				runs: number; // Runs scored by the batsman in this ball
				extraRuns: number; // Extra runs scored in this ball from the type (like wide, no-ball, etc.) [default: 0]
				type: "W" | "NB" | "WD" | "B" | "LB" | "B|4" | "D" | "4" | "6" | "0"; // Ball type - Wicket, No-ball, Wide, Bye, Leg-bye, Bye-4runs, Dot, four, sixer, Normal [default: "0"]
			}[];
		}[];
	}[] = [];

	get totalOvers() {
		return this.innings.reduce((total, i) => total + i.overs.length, 0);
	}

	get winner() {
		const teamScores = this.innings.map((i) => ({ team: i.battingTeam, score: this.getTotalRuns(i.battingTeam) }));
		const winningScore = Math.max(...teamScores.map((t) => t.score));
		return teamScores.find((t) => t.score === winningScore)?.team || null;
	}

	getPlayerRuns(playerId: string) {
		return this.innings.reduce((total, i) => {
			return (
				total +
				i.overs.reduce((total, o) => {
					return (
						total +
						o.balls.reduce((total, b) => {
							return total + (b.batsmanId === playerId ? b.runs : 0);
						}, 0)
					);
				}, 0)
			);
		}, 0);
	}

	getTotalRuns(teamId?: string): number {
		if (teamId) {
			return this.innings.find((i) => i.battingTeam === teamId)?.overs.reduce((total, o) => total + o.balls.reduce((total, b) => total + b.runs + b.extraRuns, 0), 0) || 0;
		}
		return this.innings.reduce((total, i) => total + i.overs.reduce((total, o) => total + o.balls.reduce((total, b) => total + b.runs + b.extraRuns, 0), 0), 0);
	}

	getInningsRuns(inningIdx: number, teamId?: string): number {
		if (teamId) {
			return this.innings[inningIdx].overs.reduce((total, o) => total + o.balls.reduce((total, b) => total + (b.batsmanId === teamId ? b.runs + b.extraRuns : 0), 0), 0);
		}
		return this.innings[inningIdx].overs.reduce((total, o) => total + o.balls.reduce((total, b) => total + b.runs + b.extraRuns, 0), 0);
	}

	getTopScorers(limit: number = 5): { player: string; runs: number }[] {
		const scorers: Record<string, number> = {};

		this.innings.forEach((inning) => {
			inning.overs.forEach((over) => {
				over.balls.forEach((ball) => {
					if (ball.batsmanId) {
						scorers[ball.batsmanId] = (scorers[ball.batsmanId] || 0) + ball.runs;
					}
				});
			});
		});

		return Object.entries(scorers)
			.map(([player, runs]) => ({ player, runs }))
			.sort((a, b) => b.runs - a.runs)
			.slice(0, limit);
	}

	getTeamOvers(teamId: string): number {
		const innings = this.innings.find((i) => i.battingTeam === teamId);
		if (!innings) return 0;
		return innings.overs.length;
	}


	getTeamScoreByOver(teamId: string): number[] {
		const scoreByOver: number[] = [];
		const innings = this.innings.find((i) => i.battingTeam === teamId);

		if (!innings) return [];

		let cumulativeScore = 0;

		innings.overs.forEach((over, idx) => {
			const overScore = over.balls.reduce((sum, ball) => sum + ball.runs + ball.extraRuns, 0);
			cumulativeScore += overScore;
			scoreByOver[idx] = cumulativeScore;
		});

		return scoreByOver;
	}

	getWicketCount(teamId?: string): number {
		if (teamId) {
			const innings = this.innings.find((i) => i.battingTeam === teamId);
			if (!innings) return 0;

			return innings.overs.reduce((wickets, over) => {
				return wickets + over.balls.filter((ball) => ball.type === "W").length;
			}, 0);
		}

		return this.innings.reduce((totalWickets, inning) => {
			return totalWickets + inning.overs.reduce((wickets, over) => {
				return wickets + over.balls.filter((ball) => ball.type === "W").length;
			}, 0);
		}, 0);
	}

	getWicketsByInning(inningIdx: number, teamId?: string): number {
		if (teamId) {
			const innings = this.innings[inningIdx];
			if (!innings || innings.battingTeam !== teamId) return 0;

			return innings.overs.reduce((wickets, over) => {
				return wickets + over.balls.filter((ball) => ball.type === "W").length;
			}, 0);
		}

		return this.innings[inningIdx].overs.reduce((totalWickets, over) => {
			return totalWickets + over.balls.filter((ball) => ball.type === "W").length;
		}, 0);
	}
}

export class Football {
	stats: {
		teamId: string;
		goals: { playerId: string }[];
		assists: { playerId: string }[];
		redCards: { playerId: string }[];
		yellowCards: { playerId: string }[];
		positions: { playerId: string; position: "Player" | "Benched" | "Goalkeeper" | "Defender" | "Midfielder" | "Forward" }[];
	}[] = [];

	get winner() {
		const teamGoals = this.stats.map((t) => ({ team: t.teamId, goals: t.goals?.length }));
		const winningGoals = Math.max(...teamGoals.map((t) => t.goals));
		return teamGoals.find((t) => t.goals === winningGoals)?.team || null;
	}

	getTotalGoals(teamId?: string) {
		if (teamId) {
			return this.stats.find((t) => t.teamId === teamId)?.goals?.length || 0;
		}
		return this.stats.reduce((total, t) => total + t.goals?.length, 0);
	}

	getTopScorers(limit: number = 5): { playerId: string; goals: number }[] {
		const scorers: Record<string, number> = {};

		this.stats.forEach((teamStat) => {
			teamStat.goals?.forEach((goal) => {
				scorers[goal.playerId] = (scorers[goal.playerId] || 0) + 1;
			});
		});

		return Object.entries(scorers)
			.map(([playerId, goals]) => ({ playerId, goals }))
			.sort((a, b) => b.goals - a.goals)
			.slice(0, limit);
	}

	getTopAssists(limit: number = 5): { playerId: string; assists: number }[] {
		const assisters: Record<string, number> = {};

		this.stats.forEach((teamStat) => {
			teamStat.assists?.forEach((assist) => {
				assisters[assist.playerId] = (assisters[assist.playerId] || 0) + 1;
			});
		});

		return Object.entries(assisters)
			.map(([playerId, assists]) => ({ playerId, assists }))
			.sort((a, b) => b.assists - a.assists)
			.slice(0, limit);
	}

	getTeamCardCount(teamId: string): { red: number; yellow: number } {
		const teamStat = this.stats.find((ts) => ts.teamId === teamId);
		if (!teamStat) return { red: 0, yellow: 0 };

		return {
			red: teamStat.redCards?.length,
			yellow: teamStat.yellowCards?.length,
		};
	}
}

export class Basketball {
	stats: {
		teamId: string;
		points: { playerId: string; points: number }[];
	}[] = [];

	get winner() {
		const teamPoints = this.stats.map((t) => ({ team: t.teamId, points: t.points.reduce((total, p) => total + p.points, 0) }));
		const winningPoints = Math.max(...teamPoints.map((t) => t.points));
		return teamPoints.find((t) => t.points === winningPoints)?.team || null;
	}

	getTotalPoints(teamId?: string) {
		if (teamId) {
			return this.stats.find((t) => t.teamId === teamId)?.points.reduce((total, p) => total + p.points, 0) || 0;
		}
		return this.stats.reduce((total, t) => total + t.points.reduce((total, p) => total + p.points, 0), 0);
	}

	getTopScorers(limit: number = 5): { playerId: string; points: number }[] {
		return this.stats
			.flatMap((teamStat) =>
				teamStat.points.map((p) => ({
					playerId: p.playerId,
					points: p.points,
					teamId: teamStat.teamId,
				}))
			)
			.sort((a, b) => b.points - a.points)
			.slice(0, limit);
	}

	getTeamPointsBreakdown(teamId: string): { playerId: string; points: number }[] {
		const teamStat = this.stats.find((ts) => ts.teamId === teamId);
		if (!teamStat) return [];
		return teamStat.points;
	}

	getTeamPercentageContribution(teamId: string): { playerId: string; percentage: number }[] {
		const teamStat = this.stats.find((ts) => ts.teamId === teamId);
		if (!teamStat) return [];

		const totalPoints = teamStat.points.reduce((sum, p) => sum + p.points, 0);
		if (totalPoints === 0) return [];

		return teamStat.points.map((p) => ({
			playerId: p.playerId,
			percentage: Math.round((p.points / totalPoints) * 100),
		}));
	}
}

export class Volleyball {
	sets: { 
		points: { teamId: string; points: number }[];
	}[] = [];

	getTotalPoints(teamId?: string) {
		if (teamId) {
			return this.sets.reduce((total, s) => total + ((s.points.find((p) => p.teamId === teamId)?.points) ?? 0), 0);
		}
		return this.sets.reduce((total, s) => total + s.points.reduce((total, p) => total + p.points, 0), 0);
	}

	getScore(teamId?: string): number {
		const numSets = this.sets.length;
		let result = 0;

		const isSetCompleteStandard = (set: { points: { teamId: string; points: number }[] }): boolean => {
			if (set.points.length < 2) return false;
			const [teamA, teamB] = set.points;
			const diff = Math.abs(teamA.points - teamB.points);
			return ((teamA.points >= 25 || teamB.points >= 25) && diff >= 2);
		};

		for (let i = 0; i < numSets; i++) {
			const set = this.sets[i];
			let setWinner: { teamId: string; points: number } | undefined;

			if (i < numSets - 1) {
				// Any set that is not the last one is considered ended,
				// even if it doesn't meet the 25-point criteria.
				setWinner = set.points.reduce((prev, curr) => (curr.points > prev.points ? curr : prev));
			} else {
				// Last set
				if (numSets >= 3) {
					// For the final set of 3 or more, pick the highest score bearer regardless of the completion criteria.
					setWinner = set.points.reduce((prev, curr) => (curr.points > prev.points ? curr : prev));
				} else {
					// For less than 3 sets, follow the usual 25-point completion criteria.
					if (!isSetCompleteStandard(set)) continue;
					setWinner = set.points.reduce((prev, curr) => (curr.points > prev.points ? curr : prev));
				}
			}

			if (teamId) {
				if (setWinner && setWinner.teamId === teamId) result++;
			} else {
				// If no teamId is provided, sum up total points from the completed set.
				result += set.points.reduce((sum, p) => sum + p.points, 0);
			}
		}
		return result;
	}
}

export class Throwball {
	sets: {
		points: { teamId: string; points: number }[];
	}[] = [];

	getTotalPoints(teamId?: string) {
		if (teamId) {
			return this.sets.reduce((total, s) => total + ((s.points.find((p) => p.teamId === teamId)?.points) ?? 0), 0);
		}
		return this.sets.reduce((total, s) => total + s.points.reduce((total, p) => total + p.points, 0), 0);
	}

	getScore(teamId?: string): number {
		const threshold = 25;
		let wins = 0;
		let totalPoints = 0;
		const totalSets = this.sets.length;

		this.sets.forEach((set, idx) => {
			// Skip sets that don't have both teams
			if (set.points.length < 2) return;

			let complete = false;
			let winner: { teamId: string; points: number } | null = null;

			// If there's a set after the current one, this set has ended
			if (idx < totalSets - 1) {
				complete = true;
				winner = set.points.reduce((prev, curr) => (curr.points > prev.points ? curr : prev));
			} else {
				// Last (current) set
				if (totalSets >= 3) {
					// Final set (3 or more): choose highest scorer regardless of the 25 point rule
					complete = true;
					winner = set.points.reduce((prev, curr) => (curr.points > prev.points ? curr : prev));
				} else {
					// Use the threshold criteria if fewer than 3 sets
					const [teamA, teamB] = set.points;
					const diff = Math.abs(teamA.points - teamB.points);
					if ((teamA.points >= threshold || teamB.points >= threshold) && diff >= 2) {
						complete = true;
						winner = teamA.points > teamB.points ? teamA : teamB;
					}
				}
			}

			if (complete) {
				if (teamId) {
					if (winner && winner.teamId === teamId) wins++;
				} else {
					totalPoints += set.points.reduce((sum, p) => sum + p.points, 0);
				}
			}
		});

		return teamId ? wins : totalPoints;
	}
}

export class Athletics {
	heats: {
		heatId: string;	// this is the teamId
		athletes: { playerId: string; rank: number; time: number }[];	// sometimes time is not provided
	}[] = [];

	getWinner(heatIndex: number): string {
		if (heatIndex >= 0 && heatIndex < this.heats.length) {
			const winner = this.heats[heatIndex].athletes.find(athlete => athlete.rank === 1);
			return winner?.playerId || '';
		}
		return '';
	}

	getAthletesInHeat(heatIndex: number): { playerId: string; rank?: number; time?: number }[] {
		if (heatIndex >= 0 && heatIndex < this.heats.length) {
			return this.heats[heatIndex].athletes;
		}
		return [];
	}

	getAverageTime(heatIndex: number): number {
		if (heatIndex >= 0 && heatIndex < this.heats.length) {
			const athletes = this.heats[heatIndex].athletes;
			const totalTime = athletes.reduce((sum, athlete) => sum + (athlete.time ?? 0), 0);
			return athletes.length > 0 ? totalTime / athletes.length : 0;
		}
		return 0;
	}
}

// Generic sports specific stats
export class OtherSport {
	points: { teamId: string; points: number }[] = [];

	get winner() {
		const teamPoints = this.points.map((t) => ({ team: t.teamId, points: t.points }));
		const winningPoints = Math.max(...teamPoints.map((t) => t.points));
		return teamPoints.find((t) => t.points === winningPoints)?.team || null;
	}

	getTotalPoints(teamId?: string) {
		if (teamId) {
			return this.points.find((t) => t.teamId === teamId)?.points || 0;
		}
		return this.points.reduce((total, t) => total + t.points, 0);
	}

	getTopScorers(limit: number = 5): { teamId: string; points: number }[] {
		return this.points
			.map((t) => ({ teamId: t.teamId, points: t.points }))
			.sort((a, b) => b.points - a.points)
			.slice(0, limit);
	}
}

export type Sport = Cricket | Football | Basketball | Volleyball | Throwball | Athletics | OtherSport;

class SportsActivity<T extends Sport> extends Activity {
	constructor(
		id: string,
		name: string,
		startTime: Date,
		endTime: Date,
		type: EventType,
		public teams: { id: string; name: string }[],
		public participants: SportsPlayer[],
		public game: T
	) {
		super(id, name, startTime, endTime, participants, type);
	}

	static parse(data: any): SportsActivity<Sport> {
		let gameType: Sport;
		switch (data.eventType as EventType) {
			case EventType.CRICKET: gameType = new Cricket(); break;
			case EventType.FOOTBALL: gameType = new Football(); break;
			case EventType.BASKETBALL: gameType = new Basketball(); break;
			case EventType.VOLLEYBALL: gameType = new Volleyball(); break;
			case EventType.THROWBALL: gameType = new Throwball(); break
			case EventType.ATHLETICS: gameType = new Athletics(); break;
			default: gameType = new OtherSport(); 
		}

		const participants = data.participants.map((p: any) => SportsPlayer.parse(p));
		const game = Object.assign(gameType, data.game);
		return new SportsActivity<typeof gameType>(data.id, data.name, data.startTime, data.endTime, data.type || data.eventType, data.teams, participants, game);
	}
	
	// Get winning team details
	get winningTeam(): { id: string; name: string } | null {
		const result = this.getMatchResult();
		if (result.isDraw || result.isOngoing || !result.winner) return null;
		return this.teams.find((t) => t.id === result.winner) || null;
	}

	getTeam(teamId: string) {
		return this.teams.find((t) => t.id === teamId) || null;
	}

	getPlayer(playerId: string): SportsPlayer | null {
		return this.participants.find((p) => p.usn === playerId) || null;
	}

	getTeamPlayers(teamId: string): SportsPlayer[] {
		return this.participants.filter((p) => p.teamId === teamId);
	}

	getTotalParticipants(): number {
		return this.participants.length;
	}

	getTotalScore(teamId?: string): number {
		if (this.game instanceof Cricket) return this.game.getTotalRuns(teamId);
		if (this.game instanceof Football) return this.game.getTotalGoals(teamId);
		if (this.game instanceof Basketball) return this.game.getTotalPoints(teamId);
		if (this.game instanceof Volleyball) return this.game.getScore(teamId);
		if (this.game instanceof Throwball) return this.game.getScore(teamId);
		if (this.game instanceof OtherSport) return this.game.points.find((p) => p.teamId === teamId)?.points || 0;
		return 0;
	}

	getSecondaryStat(teamId?: string): string {
		if (this.game instanceof Cricket) return `${this.game.getWicketCount(teamId)}`;
		// if (this.game instanceof Football) return `${this.game.getYellowCardCount(teamId)} Yellow Cards`;
		// if (this.game instanceof Basketball) return `${this.game.getFoulCount(teamId)} Fouls`;
		return '';
	}

	// Get match result - winner, draw or ongoing
	getMatchResult(): { winner?: string; isDraw: boolean; isOngoing: boolean } {
		if (this.teams?.length !== 2) return { isDraw: false, isOngoing: true };

		let team1Id = this.teams[0].id;
		let team2Id = this.teams[1].id;

		if (this.game instanceof Cricket) {
			const score1 = this.game.getTotalRuns(team1Id);
			const score2 = this.game.getTotalRuns(team2Id);

			// If any team hasn't batted yet, match is ongoing
			if (score1 === 0 || score2 === 0) return { isDraw: false, isOngoing: true };

			if (score1 > score2) return { winner: team1Id, isDraw: false, isOngoing: false };
			if (score2 > score1) return { winner: team2Id, isDraw: false, isOngoing: false };
			return { isDraw: true, isOngoing: false };
		}

		if (this.game instanceof Football) {
			const goals1 = this.game.getTotalGoals(team1Id);
			const goals2 = this.game.getTotalGoals(team2Id);

			if (goals1 > goals2) return { winner: team1Id, isDraw: false, isOngoing: false };
			if (goals2 > goals1) return { winner: team2Id, isDraw: false, isOngoing: false };
			return { isDraw: true, isOngoing: false };
		}

		if (this.game instanceof Basketball) {
			const points1 = this.game.getTotalPoints(team1Id);
			const points2 = this.game.getTotalPoints(team2Id);

			if (points1 > points2) return { winner: team1Id, isDraw: false, isOngoing: false };
			if (points2 > points1) return { winner: team2Id, isDraw: false, isOngoing: false };
			return { isDraw: true, isOngoing: false };
		}

		if (this.game instanceof Volleyball || this.game instanceof Throwball) {
			const points1 = this.game.getScore(team1Id);
			const points2 = this.game.getScore(team2Id);

			if (points1 > points2) return { winner: team1Id, isDraw: false, isOngoing: false };
			if (points2 > points1) return { winner: team2Id, isDraw: false, isOngoing: false };
			return { isDraw: true, isOngoing: false };
		}

		if (this.game instanceof OtherSport) {
			const points1 = this.game.getTotalPoints(team1Id);
			const points2 = this.game.getTotalPoints(team2Id);

			if (points1 > points2) return { winner: team1Id, isDraw: false, isOngoing: false };
			if (points2 > points1) return { winner: team2Id, isDraw: false, isOngoing: false };
			return { isDraw: true, isOngoing: false };
		}

		return { isDraw: false, isOngoing: true };
	}
}

export default SportsActivity;
