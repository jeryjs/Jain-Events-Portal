"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtherSport = exports.Athletics = exports.Throwball = exports.Volleyball = exports.Basketball = exports.Football = exports.Cricket = void 0;
const constants_1 = require("../../constants");
const Activity_1 = __importDefault(require("../Activity"));
const SportsPlayer_1 = __importDefault(require("./SportsPlayer"));
class Cricket {
    constructor() {
        this.tossWinner = {};
        this.innings = [];
    }
    get totalOvers() {
        return this.innings.reduce((total, i) => total + i.overs.length, 0);
    }
    get winner() {
        var _a;
        const teamScores = this.innings.map((i) => ({ team: i.battingTeam, score: this.getTotalRuns(i.battingTeam) }));
        const winningScore = Math.max(...teamScores.map((t) => t.score));
        return ((_a = teamScores.find((t) => t.score === winningScore)) === null || _a === void 0 ? void 0 : _a.team) || null;
    }
    getPlayerRuns(playerId) {
        return this.innings.reduce((total, i) => {
            return (total +
                i.overs.reduce((total, o) => {
                    return (total +
                        o.balls.reduce((total, b) => {
                            return total + (b.batsmanId === playerId ? b.runs : 0);
                        }, 0));
                }, 0));
        }, 0);
    }
    getTotalRuns(teamId) {
        var _a;
        if (teamId) {
            return ((_a = this.innings.find((i) => i.battingTeam === teamId)) === null || _a === void 0 ? void 0 : _a.overs.reduce((total, o) => total + o.balls.reduce((total, b) => total + b.runs + b.extraRuns, 0), 0)) || 0;
        }
        return this.innings.reduce((total, i) => total + i.overs.reduce((total, o) => total + o.balls.reduce((total, b) => total + b.runs + b.extraRuns, 0), 0), 0);
    }
    getInningsRuns(inningIdx, teamId) {
        if (teamId) {
            return this.innings[inningIdx].overs.reduce((total, o) => total + o.balls.reduce((total, b) => total + (b.batsmanId === teamId ? b.runs + b.extraRuns : 0), 0), 0);
        }
        return this.innings[inningIdx].overs.reduce((total, o) => total + o.balls.reduce((total, b) => total + b.runs + b.extraRuns, 0), 0);
    }
    getTopScorers(limit = 5) {
        const scorers = {};
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
    getTeamOvers(teamId) {
        const innings = this.innings.find((i) => i.battingTeam === teamId);
        if (!innings)
            return 0;
        return innings.overs.length;
    }
    getTeamScoreByOver(teamId) {
        const scoreByOver = [];
        const innings = this.innings.find((i) => i.battingTeam === teamId);
        if (!innings)
            return [];
        let cumulativeScore = 0;
        innings.overs.forEach((over, idx) => {
            const overScore = over.balls.reduce((sum, ball) => sum + ball.runs + ball.extraRuns, 0);
            cumulativeScore += overScore;
            scoreByOver[idx] = cumulativeScore;
        });
        return scoreByOver;
    }
    getWicketCount(teamId) {
        if (teamId) {
            const innings = this.innings.find((i) => i.battingTeam === teamId);
            if (!innings)
                return 0;
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
    getWicketsByInning(inningIdx, teamId) {
        if (teamId) {
            const innings = this.innings[inningIdx];
            if (!innings || innings.battingTeam !== teamId)
                return 0;
            return innings.overs.reduce((wickets, over) => {
                return wickets + over.balls.filter((ball) => ball.type === "W").length;
            }, 0);
        }
        return this.innings[inningIdx].overs.reduce((totalWickets, over) => {
            return totalWickets + over.balls.filter((ball) => ball.type === "W").length;
        }, 0);
    }
}
exports.Cricket = Cricket;
class Football {
    constructor() {
        this.stats = [];
    }
    get winner() {
        var _a;
        const teamGoals = this.stats.map((t) => { var _a; return ({ team: t.teamId, goals: (_a = t.goals) === null || _a === void 0 ? void 0 : _a.length }); });
        const winningGoals = Math.max(...teamGoals.map((t) => t.goals));
        return ((_a = teamGoals.find((t) => t.goals === winningGoals)) === null || _a === void 0 ? void 0 : _a.team) || null;
    }
    getTotalGoals(teamId) {
        var _a, _b;
        if (teamId) {
            return ((_b = (_a = this.stats.find((t) => t.teamId === teamId)) === null || _a === void 0 ? void 0 : _a.goals) === null || _b === void 0 ? void 0 : _b.length) || 0;
        }
        return this.stats.reduce((total, t) => { var _a; return total + ((_a = t.goals) === null || _a === void 0 ? void 0 : _a.length); }, 0);
    }
    getTopScorers(limit = 5) {
        const scorers = {};
        this.stats.forEach((teamStat) => {
            var _a;
            (_a = teamStat.goals) === null || _a === void 0 ? void 0 : _a.forEach((goal) => {
                scorers[goal.playerId] = (scorers[goal.playerId] || 0) + 1;
            });
        });
        return Object.entries(scorers)
            .map(([playerId, goals]) => ({ playerId, goals }))
            .sort((a, b) => b.goals - a.goals)
            .slice(0, limit);
    }
    getTopAssists(limit = 5) {
        const assisters = {};
        this.stats.forEach((teamStat) => {
            var _a;
            (_a = teamStat.assists) === null || _a === void 0 ? void 0 : _a.forEach((assist) => {
                assisters[assist.playerId] = (assisters[assist.playerId] || 0) + 1;
            });
        });
        return Object.entries(assisters)
            .map(([playerId, assists]) => ({ playerId, assists }))
            .sort((a, b) => b.assists - a.assists)
            .slice(0, limit);
    }
    getTeamCardCount(teamId) {
        var _a, _b;
        const teamStat = this.stats.find((ts) => ts.teamId === teamId);
        if (!teamStat)
            return { red: 0, yellow: 0 };
        return {
            red: (_a = teamStat.redCards) === null || _a === void 0 ? void 0 : _a.length,
            yellow: (_b = teamStat.yellowCards) === null || _b === void 0 ? void 0 : _b.length,
        };
    }
}
exports.Football = Football;
class Basketball {
    constructor() {
        this.stats = [];
    }
    get winner() {
        var _a;
        const teamPoints = this.stats.map((t) => ({ team: t.teamId, points: t.points.reduce((total, p) => total + p.points, 0) }));
        const winningPoints = Math.max(...teamPoints.map((t) => t.points));
        return ((_a = teamPoints.find((t) => t.points === winningPoints)) === null || _a === void 0 ? void 0 : _a.team) || null;
    }
    getTotalPoints(teamId) {
        var _a;
        if (teamId) {
            return ((_a = this.stats.find((t) => t.teamId === teamId)) === null || _a === void 0 ? void 0 : _a.points.reduce((total, p) => total + p.points, 0)) || 0;
        }
        return this.stats.reduce((total, t) => total + t.points.reduce((total, p) => total + p.points, 0), 0);
    }
    getTopScorers(limit = 5) {
        return this.stats
            .flatMap((teamStat) => teamStat.points.map((p) => ({
            playerId: p.playerId,
            points: p.points,
            teamId: teamStat.teamId,
        })))
            .sort((a, b) => b.points - a.points)
            .slice(0, limit);
    }
    getTeamPointsBreakdown(teamId) {
        const teamStat = this.stats.find((ts) => ts.teamId === teamId);
        if (!teamStat)
            return [];
        return teamStat.points;
    }
    getTeamPercentageContribution(teamId) {
        const teamStat = this.stats.find((ts) => ts.teamId === teamId);
        if (!teamStat)
            return [];
        const totalPoints = teamStat.points.reduce((sum, p) => sum + p.points, 0);
        if (totalPoints === 0)
            return [];
        return teamStat.points.map((p) => ({
            playerId: p.playerId,
            percentage: Math.round((p.points / totalPoints) * 100),
        }));
    }
}
exports.Basketball = Basketball;
class Volleyball {
    constructor() {
        this.sets = [];
    }
    getTotalPoints(teamId) {
        if (teamId) {
            return this.sets.reduce((total, s) => { var _a, _b; return total + ((_b = ((_a = s.points.find((p) => p.teamId === teamId)) === null || _a === void 0 ? void 0 : _a.points)) !== null && _b !== void 0 ? _b : 0); }, 0);
        }
        return this.sets.reduce((total, s) => total + s.points.reduce((total, p) => total + p.points, 0), 0);
    }
    getScore(teamId) {
        const numSets = this.sets.length;
        let result = 0;
        const isSetCompleteStandard = (set) => {
            if (set.points.length < 2)
                return false;
            const [teamA, teamB] = set.points;
            const diff = Math.abs(teamA.points - teamB.points);
            return ((teamA.points >= 25 || teamB.points >= 25) && diff >= 2);
        };
        for (let i = 0; i < numSets; i++) {
            const set = this.sets[i];
            let setWinner;
            if (i < numSets - 1) {
                // Any set that is not the last one is considered ended,
                // even if it doesn't meet the 25-point criteria.
                setWinner = set.points.reduce((prev, curr) => (curr.points > prev.points ? curr : prev));
            }
            else {
                // Last set
                if (numSets >= 3) {
                    // For the final set of 3 or more, pick the highest score bearer regardless of the completion criteria.
                    setWinner = set.points.reduce((prev, curr) => (curr.points > prev.points ? curr : prev));
                }
                else {
                    // For less than 3 sets, follow the usual 25-point completion criteria.
                    if (!isSetCompleteStandard(set))
                        continue;
                    setWinner = set.points.reduce((prev, curr) => (curr.points > prev.points ? curr : prev));
                }
            }
            if (teamId) {
                if (setWinner && setWinner.teamId === teamId)
                    result++;
            }
            else {
                // If no teamId is provided, sum up total points from the completed set.
                result += set.points.reduce((sum, p) => sum + p.points, 0);
            }
        }
        return result;
    }
}
exports.Volleyball = Volleyball;
class Throwball {
    constructor() {
        this.sets = [];
    }
    getTotalPoints(teamId) {
        if (teamId) {
            return this.sets.reduce((total, s) => { var _a, _b; return total + ((_b = ((_a = s.points.find((p) => p.teamId === teamId)) === null || _a === void 0 ? void 0 : _a.points)) !== null && _b !== void 0 ? _b : 0); }, 0);
        }
        return this.sets.reduce((total, s) => total + s.points.reduce((total, p) => total + p.points, 0), 0);
    }
    getScore(teamId) {
        const threshold = 25;
        let wins = 0;
        let totalPoints = 0;
        const totalSets = this.sets.length;
        this.sets.forEach((set, idx) => {
            // Skip sets that don't have both teams
            if (set.points.length < 2)
                return;
            let complete = false;
            let winner = null;
            // If there's a set after the current one, this set has ended
            if (idx < totalSets - 1) {
                complete = true;
                winner = set.points.reduce((prev, curr) => (curr.points > prev.points ? curr : prev));
            }
            else {
                // Last (current) set
                if (totalSets >= 3) {
                    // Final set (3 or more): choose highest scorer regardless of the 25 point rule
                    complete = true;
                    winner = set.points.reduce((prev, curr) => (curr.points > prev.points ? curr : prev));
                }
                else {
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
                    if (winner && winner.teamId === teamId)
                        wins++;
                }
                else {
                    totalPoints += set.points.reduce((sum, p) => sum + p.points, 0);
                }
            }
        });
        return teamId ? wins : totalPoints;
    }
}
exports.Throwball = Throwball;
class Athletics {
    constructor() {
        this.heats = [];
    }
    getWinner(heatIndex) {
        if (heatIndex >= 0 && heatIndex < this.heats.length) {
            const winner = this.heats[heatIndex].athletes.find(athlete => athlete.rank === 1);
            return (winner === null || winner === void 0 ? void 0 : winner.playerId) || '';
        }
        return '';
    }
    getAthletesInHeat(heatIndex) {
        if (heatIndex >= 0 && heatIndex < this.heats.length) {
            return this.heats[heatIndex].athletes;
        }
        return [];
    }
    getAverageTime(heatIndex) {
        if (heatIndex >= 0 && heatIndex < this.heats.length) {
            const athletes = this.heats[heatIndex].athletes;
            const totalTime = athletes.reduce((sum, athlete) => { var _a; return sum + ((_a = athlete.time) !== null && _a !== void 0 ? _a : 0); }, 0);
            return athletes.length > 0 ? totalTime / athletes.length : 0;
        }
        return 0;
    }
}
exports.Athletics = Athletics;
// Generic sports specific stats
class OtherSport {
    constructor() {
        this.points = [];
    }
    get winner() {
        var _a;
        const teamPoints = this.points.map((t) => ({ team: t.teamId, points: t.points }));
        const winningPoints = Math.max(...teamPoints.map((t) => t.points));
        return ((_a = teamPoints.find((t) => t.points === winningPoints)) === null || _a === void 0 ? void 0 : _a.team) || null;
    }
    getTotalPoints(teamId) {
        var _a;
        if (teamId) {
            return ((_a = this.points.find((t) => t.teamId === teamId)) === null || _a === void 0 ? void 0 : _a.points) || 0;
        }
        return this.points.reduce((total, t) => total + t.points, 0);
    }
    getTopScorers(limit = 5) {
        return this.points
            .map((t) => ({ teamId: t.teamId, points: t.points }))
            .sort((a, b) => b.points - a.points)
            .slice(0, limit);
    }
}
exports.OtherSport = OtherSport;
class SportsActivity extends Activity_1.default {
    constructor(id, name, startTime, endTime, type, teams, participants, game) {
        super(id, name, startTime, endTime, participants, type);
        this.teams = teams;
        this.participants = participants;
        this.game = game;
    }
    static parse(data) {
        let gameType;
        switch (data.eventType) {
            case constants_1.EventType.CRICKET:
                gameType = new Cricket();
                break;
            case constants_1.EventType.FOOTBALL:
                gameType = new Football();
                break;
            case constants_1.EventType.BASKETBALL:
                gameType = new Basketball();
                break;
            case constants_1.EventType.VOLLEYBALL:
                gameType = new Volleyball();
                break;
            case constants_1.EventType.THROWBALL:
                gameType = new Throwball();
                break;
            case constants_1.EventType.ATHLETICS:
                gameType = new Athletics();
                break;
            default: gameType = new OtherSport();
        }
        const participants = data.participants.map((p) => SportsPlayer_1.default.parse(p));
        const game = Object.assign(gameType, data.game);
        return new SportsActivity(data.id, data.name, data.startTime, data.endTime, data.type || data.eventType, data.teams, participants, game);
    }
    // Get winning team details
    get winningTeam() {
        const result = this.getMatchResult();
        if (result.isDraw || result.isOngoing || !result.winner)
            return null;
        return this.teams.find((t) => t.id === result.winner) || null;
    }
    getTeam(teamId) {
        return this.teams.find((t) => t.id === teamId) || null;
    }
    getPlayer(playerId) {
        return this.participants.find((p) => p.usn === playerId) || null;
    }
    getTeamPlayers(teamId) {
        return this.participants.filter((p) => p.teamId === teamId);
    }
    getTotalParticipants() {
        return this.participants.length;
    }
    getTotalScore(teamId) {
        var _a;
        if (this.game instanceof Cricket)
            return this.game.getTotalRuns(teamId);
        if (this.game instanceof Football)
            return this.game.getTotalGoals(teamId);
        if (this.game instanceof Basketball)
            return this.game.getTotalPoints(teamId);
        if (this.game instanceof Volleyball)
            return this.game.getScore(teamId);
        if (this.game instanceof Throwball)
            return this.game.getScore(teamId);
        if (this.game instanceof OtherSport)
            return ((_a = this.game.points.find((p) => p.teamId === teamId)) === null || _a === void 0 ? void 0 : _a.points) || 0;
        return 0;
    }
    getSecondaryStat(teamId) {
        if (this.game instanceof Cricket)
            return `${this.game.getWicketCount(teamId)}`;
        // if (this.game instanceof Football) return `${this.game.getYellowCardCount(teamId)} Yellow Cards`;
        // if (this.game instanceof Basketball) return `${this.game.getFoulCount(teamId)} Fouls`;
        return '';
    }
    // Get match result - winner, draw or ongoing
    getMatchResult() {
        var _a;
        if (((_a = this.teams) === null || _a === void 0 ? void 0 : _a.length) !== 2)
            return { isDraw: false, isOngoing: true };
        let team1Id = this.teams[0].id;
        let team2Id = this.teams[1].id;
        if (this.game instanceof Cricket) {
            const score1 = this.game.getTotalRuns(team1Id);
            const score2 = this.game.getTotalRuns(team2Id);
            // If any team hasn't batted yet, match is ongoing
            if (score1 === 0 || score2 === 0)
                return { isDraw: false, isOngoing: true };
            if (score1 > score2)
                return { winner: team1Id, isDraw: false, isOngoing: false };
            if (score2 > score1)
                return { winner: team2Id, isDraw: false, isOngoing: false };
            return { isDraw: true, isOngoing: false };
        }
        if (this.game instanceof Football) {
            const goals1 = this.game.getTotalGoals(team1Id);
            const goals2 = this.game.getTotalGoals(team2Id);
            if (goals1 > goals2)
                return { winner: team1Id, isDraw: false, isOngoing: false };
            if (goals2 > goals1)
                return { winner: team2Id, isDraw: false, isOngoing: false };
            return { isDraw: true, isOngoing: false };
        }
        if (this.game instanceof Basketball) {
            const points1 = this.game.getTotalPoints(team1Id);
            const points2 = this.game.getTotalPoints(team2Id);
            if (points1 > points2)
                return { winner: team1Id, isDraw: false, isOngoing: false };
            if (points2 > points1)
                return { winner: team2Id, isDraw: false, isOngoing: false };
            return { isDraw: true, isOngoing: false };
        }
        if (this.game instanceof Volleyball || this.game instanceof Throwball) {
            const points1 = this.game.getScore(team1Id);
            const points2 = this.game.getScore(team2Id);
            if (points1 > points2)
                return { winner: team1Id, isDraw: false, isOngoing: false };
            if (points2 > points1)
                return { winner: team2Id, isDraw: false, isOngoing: false };
            return { isDraw: true, isOngoing: false };
        }
        if (this.game instanceof OtherSport) {
            const points1 = this.game.getTotalPoints(team1Id);
            const points2 = this.game.getTotalPoints(team2Id);
            if (points1 > points2)
                return { winner: team1Id, isDraw: false, isOngoing: false };
            if (points2 > points1)
                return { winner: team2Id, isDraw: false, isOngoing: false };
            return { isDraw: true, isOngoing: false };
        }
        return { isDraw: false, isOngoing: true };
    }
}
exports.default = SportsActivity;
