import { Cricket, SportsActivity } from "@common/models";
import { Sport } from "@common/models/sports/SportsActivity";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Filter6Icon from '@mui/icons-material/Filter6';
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from "@mui/material";
import { useState } from "react";
import PlayersTab from "./PlayersTab";

// Main view component that switches between tabs
export default function CricketView({ activity, tabValue }) {
  const cricket = activity.game as Cricket;

  return (
    <>
      {tabValue === 0 && <OverviewTab activity={activity} game={cricket} />}
      {tabValue === 1 && <PlayersTab activity={activity} />}
      {tabValue === 2 && <ScoreboardTab activity={activity} game={cricket} />}
    </>
  );
};

// Overview component
const OverviewTab = ({ activity, game }: { activity: SportsActivity<Sport>, game: Cricket }) => {
  const theme = useTheme();

  // Helper function to calculate 4s and 6s
  const calculateBoundaries = () => {
    const fours: Record<string, number> = {};
    const sixes: Record<string, number> = {};

    game.innings.forEach(inning => {
      inning.overs.forEach(over => {
        over.balls.forEach(ball => {
          if (ball.batsmanId) {
            if (ball.runs === 4) {
              fours[ball.batsmanId] = (fours[ball.batsmanId] || 0) + 1;
            }
            if (ball.runs === 6) {
              sixes[ball.batsmanId] = (sixes[ball.batsmanId] || 0) + 1;
            }
          }
        });
      });
    });

    return {
      topFours: Object.entries(fours)
        .map(([playerId, count]) => ({ playerId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
      topSixes: Object.entries(sixes)
        .map(([playerId, count]) => ({ playerId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
    };
  };

  const { topFours, topSixes } = calculateBoundaries();

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Match Summary Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Match Summary
              </Typography>

              {activity.teams.map(team => {
                const teamScore = game.getTotalRuns(team.id);
                const wickets = game.getWicketCount(team.id);

                return (
                  <Box
                    key={team.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: theme.palette.grey[50]
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight="medium">
                        {team.name}
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="bold">
                      {teamScore}/{wickets}
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Batsmen */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Scorers
              </Typography>

              {game.getTopScorers(5).map((scorer, idx) => {
                const player = activity.getPlayer(scorer.player);
                if (!player) return null;

                return (
                  <Box
                    key={scorer.player}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                      py: 0.5
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={`https://i.pravatar.cc/150?u=${scorer.player}`}
                        alt={player.name}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {player.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.teams.find(t => t.id === player.teamId)?.name || ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {scorer.runs} runs
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Innings Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Innings Details
              </Typography>

              {game.innings.map((inning, idx) => {
                const battingTeam = activity.teams.find(t => t.id === inning.battingTeam);
                const bowlingTeam = activity.teams.find(t => t.id === inning.bowlingTeam);

                return (
                  <Box
                    key={idx}
                    sx={{
                      mb: 2,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: theme.palette.grey[50]
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {battingTeam?.name || ''} batting
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {inning.overs.length} overs
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {game.getTotalRuns(inning.battingTeam)} runs
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Boundaries Hitters */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Boundary Hitters
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LooksTwoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Top 4s
                  </Typography>
                </Box>
                {topFours.map(({ playerId, count }) => {
                  const player = activity.getPlayer(playerId);
                  if (!player) return null;

                  return (
                    <Box
                      key={playerId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        ml: 4,
                        mb: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={`https://i.pravatar.cc/150?u=${playerId}`}
                          alt={player.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        <Typography variant="body2">
                          {player.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {count} × 4s
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Filter6Icon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Top 6s
                  </Typography>
                </Box>
                {topSixes.map(({ playerId, count }) => {
                  const player = activity.getPlayer(playerId);
                  if (!player) return null;

                  return (
                    <Box
                      key={playerId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        ml: 4,
                        mb: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={`https://i.pravatar.cc/150?u=${playerId}`}
                          alt={player.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        <Typography variant="body2">
                          {player.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {count} × 6s
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};


const ScoreboardTab = ({ activity, game }: { activity: SportsActivity<Sport>, game: Cricket }) => {
  const theme = useTheme();
  const [expandedPanel, setExpandedPanel] = useState<number | false>(0);

  const handleAccordionChange = (panel: number) => (_, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  return (
    <Grid container spacing={3}>
      {/* Innings Breakdown */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SportsCricketIcon />
              Match Scorecard
            </Typography>

            {game.innings.map((inning, inningIdx) => {
              const battingTeam = activity.teams.find(t => t.id === inning.battingTeam);
              const bowlingTeam = activity.teams.find(t => t.id === inning.bowlingTeam);
              const inningScore = inning.overs.reduce(
                (total, over) => total + over.balls.reduce((sum, ball) => sum + ball.runs + ball.extraRuns, 0),
                0
              );
              const wickets = inning.overs.reduce(
                (total, over) => total + over.balls.filter(ball => ball.type === "W").length,
                0
              );

              return (
                <Accordion
                  key={inningIdx}
                  expanded={expandedPanel === inningIdx}
                  onChange={handleAccordionChange(inningIdx)}
                  sx={{ mb: 2, '&:before': { display: 'none' } }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      bgcolor: theme.palette.grey[50],
                      borderRadius: 1,
                      '&.Mui-expanded': {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Box>
                        <Typography fontWeight="medium">
                          Innings {inningIdx + 1}: {battingTeam?.name} batting
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          vs {bowlingTeam?.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {inningScore}/{wickets} ({inning.overs.length} ov)
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ mt: 1 }}>
                      {/* Batting Section */}
                      <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        pb: 1
                      }}>
                        Batting: {battingTeam?.name}
                      </Typography>

                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Batter</TableCell>
                              <TableCell align="right">Runs</TableCell>
                              <TableCell align="right">Balls</TableCell>
                              <TableCell align="right">4s</TableCell>
                              <TableCell align="right">6s</TableCell>
                              <TableCell align="right">S/R</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {activity.participants
                              .filter(p => p.teamId === inning.battingTeam)
                              .map((player) => {
                                // Calculate player stats for this specific innings
                                let runs = 0;
                                let ballsFaced = 0;
                                let fours = 0;
                                let sixes = 0;

                                inning.overs.forEach(over => {
                                  over.balls.forEach(ball => {
                                    if (ball.batsmanId === player.usn) {
                                      runs += ball.runs;
                                      ballsFaced++;
                                      if (ball.runs === 4) fours++;
                                      if (ball.runs === 6) sixes++;
                                    }
                                  });
                                });

                                if (ballsFaced === 0) return null; // Skip players who didn't bat

                                const strikeRate = ((runs / ballsFaced) * 100).toFixed(1);
                                const showHalfCenturyBadge = runs >= 50;

                                return (
                                  <TableRow key={player.usn}>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {player.name}
                                        {showHalfCenturyBadge && (
                                          <Chip
                                            size="small"
                                            icon={<EmojiEventsIcon />}
                                            label={runs >= 100 ? "100+" : "50+"}
                                            color={runs >= 100 ? "success" : "primary"}
                                            variant="outlined"
                                            sx={{ ml: 1, height: 20, '& .MuiChip-icon': { fontSize: 14 } }}
                                          />
                                        )}
                                      </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'medium' }}>{runs}</TableCell>
                                    <TableCell align="right">{ballsFaced}</TableCell>
                                    <TableCell align="right">{fours}</TableCell>
                                    <TableCell align="right">{sixes}</TableCell>
                                    <TableCell align="right">{strikeRate}</TableCell>
                                  </TableRow>
                                );
                              })
                              .filter(Boolean)}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Bowling Section */}
                      <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        pt: 3,
                        pb: 1
                      }}>
                        Bowling: {bowlingTeam?.name}
                      </Typography>

                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Bowler</TableCell>
                              <TableCell align="right">Overs</TableCell>
                              <TableCell align="right">Runs</TableCell>
                              <TableCell align="right">Wickets</TableCell>
                              <TableCell align="right">Economy</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(() => {
                              // Collect bowling stats for this innings
                              const bowlerStats = {};
                              inning.overs.forEach(over => {
                                // Count overs bowled
                                const bowlerId = over.bowlerId;
                                if (!bowlerStats[bowlerId]) {
                                  bowlerStats[bowlerId] = {
                                    overs: 0,
                                    runs: 0,
                                    wickets: 0,
                                    balls: 0
                                  };
                                }
                                bowlerStats[bowlerId].overs++;

                                // Calculate runs and wickets
                                over.balls.forEach(ball => {
                                  bowlerStats[bowlerId].runs += ball.runs + ball.extraRuns;
                                  if (ball.type === "W") bowlerStats[bowlerId].wickets++;
                                  bowlerStats[bowlerId].balls++;
                                });
                              });

                              return Object.entries(bowlerStats).map(([bowlerId, stats]: [any, any]) => {
                                const player = activity.participants.find(p => p.usn === bowlerId);
                                if (!player) return null;

                                const economy = (stats.runs / (stats.balls / 6)).toFixed(1);

                                return (
                                  <TableRow key={bowlerId}>
                                    <TableCell>{player.name}</TableCell>
                                    <TableCell align="right">{stats.overs}</TableCell>
                                    <TableCell align="right">{stats.runs}</TableCell>
                                    <TableCell align="right" sx={{
                                      fontWeight: stats.wickets >= 3 ? 'bold' : 'regular',
                                      color: stats.wickets >= 5 ? theme.palette.success.main : 'inherit'
                                    }}>
                                      {stats.wickets}
                                    </TableCell>
                                    <TableCell align="right">{economy}</TableCell>
                                  </TableRow>
                                );
                              }).filter(Boolean);
                            })()}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </CardContent>
        </Card>
      </Grid>

      {/* Team Performance Summary */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Team Performance
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Run Rate</TableCell>
                    <TableCell align="right">Total Boundaries</TableCell>
                    <TableCell align="right">Wickets Taken</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity.teams.map(team => {
                    const score = game.getTotalRuns(team.id);
                    const overs = game.getTeamOvers(team.id);
                    const wickets = game.getWicketCount(team.id);
                    const runRate = overs > 0 ? (score / overs).toFixed(2) : '-';

                    // Calculate total boundaries for this team
                    let fours = 0, sixes = 0;
                    game.innings.forEach(inning => {
                      if (inning.battingTeam === team.id) {
                        inning.overs.forEach(over => {
                          over.balls.forEach(ball => {
                            if (ball.runs === 4) fours++;
                            if (ball.runs === 6) sixes++;
                          });
                        });
                      }
                    });

                    // Calculate wickets taken by this team (when bowling)
                    const wicketsTaken = game.innings
                      .filter(inning => inning.bowlingTeam === team.id)
                      .reduce((total, inning) => {
                        return total + inning.overs.reduce((sum, over) => {
                          return sum + over.balls.filter(ball => ball.type === "W").length;
                        }, 0);
                      }, 0);

                    return (
                      <TableRow key={team.id}>
                        <TableCell>{team.name}</TableCell>
                        <TableCell align="right">{score}/{wickets}</TableCell>
                        <TableCell align="right">{runRate}</TableCell>
                        <TableCell align="right">{fours} × 4s, {sixes} × 6s</TableCell>
                        <TableCell align="right">{wicketsTaken}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};