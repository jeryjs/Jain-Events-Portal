import { Suspense, useState } from 'react';
import { Football, SportsActivity } from "@common/models";
import { Sport } from "@common/models/sports/SportsActivity";
import AssistantIcon from "@mui/icons-material/Assistant";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import CardIcon from '@mui/icons-material/Style';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery
} from "@mui/material";
import PlayersTab from "./PlayersTab";

// Main view component with tabs
export default function FootballView({ activity }) {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const football = activity.game as Football;

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant={isMobile ? "fullWidth" : "standard"}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<AssessmentIcon />} label="Overview" iconPosition="start" />
        <Tab icon={<GroupIcon />} label="Players" iconPosition="start" />
        <Tab icon={<ScoreboardIcon />} label="Statistics" iconPosition="start" />
      </Tabs>

      <Box>
        <Suspense fallback={<LinearProgress />}>
          {tabValue === 0 && <FootballOverview activity={activity} game={football} />}
          {tabValue === 1 && <PlayersTab activity={activity} />}
          {tabValue === 2 && <StatisticsTab activity={activity} game={football} />}
        </Suspense>
      </Box>
    </Paper>
  );
};

// Overview component - completely redesigned
const FootballOverview = ({ activity, game }: { activity: SportsActivity<Sport>, game: Football }) => {
  const theme = useTheme();

  // Determine match status 
  const matchStatus = {
    isNotStarted: !activity.startTime || activity.startTime > new Date(),
    isComplete: activity.endTime && activity.endTime < new Date(),
    winner: game.winner ? activity.teams.find(t => t.id === game.winner) : null
  };

  // Handle upcoming match
  if (matchStatus.isNotStarted) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ color: 'white', p: 2, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Upcoming Match
          </Typography>
        </Box>
        <CardContent>
          <Typography variant="subtitle1" color="text.secondary" align="center">
            Get ready! The match is scheduled for:
          </Typography>
          <Typography variant="h5" align="center" fontWeight="bold" sx={{ my: 2 }}>
            {activity.startTime.toLocaleString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })}
          </Typography>
          <LinearProgress variant="determinate" value={0} sx={{ height: 8, borderRadius: 4 }} />
          <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 1 }}>
            Stay tuned for live updates!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Score Card */}
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bgcolor: matchStatus.isComplete ? 'error.main' : 'success.main',
              color: 'white',
              px: 2,
              py: 0.5,
              borderBottomRightRadius: 8
            }}
          >
            {matchStatus.isComplete ? 'COMPLETED' : 'ONGOING'}
          </Box>

          <Box sx={{ pt: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SportsSoccerIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                Football Match
              </Typography>
            </Box>

            {/* Winner announcement for completed matches */}
            {matchStatus.isComplete && (
              <Box sx={{
                textAlign: 'center',
                mt: 2,
                p: 1.5,
                bgcolor: 'rgba(0,0,0,0.03)',
                borderRadius: 1
              }}>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <EmojiEventsIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {matchStatus.winner
                      ? `${matchStatus.winner.name} won by ${Math.abs(
                        (game.getTotalGoals(matchStatus.winner.id) || 0) -
                        (game.getTotalGoals(activity.teams.find(t => t.id !== matchStatus.winner?.id)?.id || '') || 0)
                      )} goals`
                      : 'Match ended in a draw'}
                  </Typography>
                  {matchStatus.winner && <Chip label="Winner" color="primary" size="small" sx={{ ml: 1 }} />}
                </Box>
              </Box>
            )}

            {/* Live indicator for ongoing matches */}
            {!matchStatus.isComplete && (
              <Box sx={{
                textAlign: 'center',
                mt: 2,
                p: 1.5,
                bgcolor: 'rgba(76, 175, 80, 0.08)',
                borderRadius: 1
              }}>
                <Typography variant="body1" color="success.main">
                  Match in progress
                </Typography>
              </Box>
            )}

            {/* Player Statistics Table */}
            <Grid item xs={12}>
              <Card elevation={4} sx={{ borderRadius: 8 }}>
                <CardContent>
                  {/* <Typography variant="h6" gutterBottom>
                    Player Statistics
                  </Typography> */}

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Player</TableCell>
                          <TableCell>Team</TableCell>
                          <TableCell align="center">Goals</TableCell>
                          <TableCell align="center">Assists</TableCell>
                          <TableCell align="center">Yellow Cards</TableCell>
                          <TableCell align="center">Red Cards</TableCell>
                          <TableCell align="center">G+A</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Playing Players */}
                        {activity.participants
                          .filter(player => player.isPlaying)
                          .map(player => {
                            // Count goals
                            const goals = game.stats?.reduce((total, teamStat) => {
                              return total + (teamStat.goals?.filter(g => g.playerId === player.usn)?.length || 0);
                            }, 0) || 0;

                            // Count assists
                            const assists = game.stats?.reduce((total, teamStat) => {
                              return total + (teamStat.assists?.filter(a => a.playerId === player.usn)?.length || 0);
                            }, 0) || 0;

                            // Count red cards
                            const redCards = game.stats?.reduce((total, teamStat) => {
                              return total + (teamStat.redCards?.filter(c => c.playerId === player.usn)?.length || 0);
                            }, 0) || 0;

                            // Count yellow cards
                            const yellowCards = game.stats?.reduce((total, teamStat) => {
                              return total + (teamStat.yellowCards?.filter(c => c.playerId === player.usn)?.length || 0);
                            }, 0) || 0;

                            return {
                              player,
                              goals,
                              assists,
                              redCards,
                              yellowCards,
                              goalPlusAssist: goals + assists
                            };
                          })
                          .sort((a, b) => b.goalPlusAssist - a.goalPlusAssist)
                          .map(({ player, goals, assists, redCards, yellowCards, goalPlusAssist }) => {
                            const team = activity.teams.find(t => t.id === player.teamId);

                            // Skip players with no statistics
                            if (goals === 0 && assists === 0 && redCards === 0 && yellowCards === 0) return null;

                            return (
                              <TableRow key={player.usn}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                      {player.name.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body2">
                                      {player.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{team?.name}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: goals > 0 ? 'bold' : 'normal' }}>
                                  {goals}
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: assists > 0 ? 'bold' : 'normal' }}>
                                  {assists}
                                </TableCell>
                                <TableCell align="center">
                                  {yellowCards > 0 && (
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                      <Box sx={{ width: 12, height: 16, bgcolor: '#ffeb3b', mr: 1 }} />
                                      {yellowCards}
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {redCards > 0 && (
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                      <Box sx={{ width: 12, height: 16, bgcolor: '#f44336', mr: 1 }} />
                                      {redCards}
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell align="center" sx={{
                                  fontWeight: 'bold',
                                  color: goalPlusAssist > 0 ? theme.palette.primary.main : 'inherit'
                                }}>
                                  {goalPlusAssist}
                                </TableCell>
                              </TableRow>
                            );
                          }).filter(Boolean)}

                        {/* Substitutes heading if there are any with statistics */}
                        {activity.participants
                          .filter(player => !player.isPlaying)
                          .some(player => {
                            const goals = game.stats?.reduce((total, teamStat) => {
                              return total + (teamStat.goals?.filter(g => g.playerId === player.usn)?.length || 0);
                            }, 0) || 0;
                            const assists = game.stats?.reduce((total, teamStat) => {
                              return total + (teamStat.assists?.filter(a => a.playerId === player.usn)?.length || 0);
                            }, 0) || 0;
                            const redCards = game.stats?.reduce((total, teamStat) => {
                              return total + (teamStat.redCards?.filter(c => c.playerId === player.usn)?.length || 0);
                            }, 0) || 0;
                            const yellowCards = game.stats?.reduce((total, teamStat) => {
                              return total + (teamStat.yellowCards?.filter(c => c.playerId === player.usn)?.length || 0);
                            }, 0) || 0;
                            
                            return goals > 0 || assists > 0 || redCards > 0 || yellowCards > 0;
                          }) && (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ bgcolor: 'grey.100', py: 1 }}>
                              <Typography variant="subtitle2" fontWeight="medium">
                                Substitutes
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* Substitutes with statistics */}
                        {activity.participants
                          .filter(player => !player.isPlaying)
                          .map(player => {
                            // Count goals
                            const goals = game.stats?.reduce((total, teamStat) => {
                              return total + (teamStat.goals?.filter(g => g.playerId === player.usn)?.length || 0);
                            }, 0) || 0;

                            // Count assists
                            const assists = game.stats?.reduce((total, teamStat) => {
                              return total + (teamStat.assists?.filter(a => a.playerId === player.usn)?.length || 0);
                            }, 0) || 0;

                            // Count red cards
                            const redCards = game.stats?.reduce((total, teamStat) => {
                              return total + (teamStat.redCards?.filter(c => c.playerId === player.usn)?.length || 0);
                            }, 0) || 0;

                            // Count yellow cards
                            const yellowCards = game.stats?.reduce((total, teamStat) => {
                              return total + (teamStat.yellowCards?.filter(c => c.playerId === player.usn)?.length || 0);
                            }, 0) || 0;

                            return {
                              player,
                              goals,
                              assists,
                              redCards,
                              yellowCards,
                              goalPlusAssist: goals + assists
                            };
                          })
                          .sort((a, b) => b.goalPlusAssist - a.goalPlusAssist)
                          .map(({ player, goals, assists, redCards, yellowCards, goalPlusAssist }) => {
                            const team = activity.teams.find(t => t.id === player.teamId);

                            // Skip players with no statistics
                            if (goals === 0 && assists === 0 && redCards === 0 && yellowCards === 0) return null;

                            return (
                              <TableRow key={player.usn} sx={{ bgcolor: 'grey.50' }}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ width: 24, height: 24, mr: 1, opacity: 0.8 }}>
                                      {player.name.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body2" color="text.secondary">
                                      {player.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{team?.name}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: goals > 0 ? 'bold' : 'normal' }}>
                                  {goals}
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: assists > 0 ? 'bold' : 'normal' }}>
                                  {assists}
                                </TableCell>
                                <TableCell align="center">
                                  {yellowCards > 0 && (
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                      <Box sx={{ width: 12, height: 16, bgcolor: '#ffeb3b', mr: 1 }} />
                                      {yellowCards}
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {redCards > 0 && (
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                      <Box sx={{ width: 12, height: 16, bgcolor: '#f44336', mr: 1 }} />
                                      {redCards}
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell align="center" sx={{
                                  fontWeight: 'bold',
                                  color: goalPlusAssist > 0 ? theme.palette.primary.main : 'inherit'
                                }}>
                                  {goalPlusAssist}
                                </TableCell>
                              </TableRow>
                            );
                          }).filter(Boolean)}
                          
                        {(!game.stats || game.stats.every(s => !s.goals?.length && !s.assists?.length && !s.yellowCards?.length && !s.redCards?.length)) && (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ textAlign: 'center' }}>
                              <Typography color="text.secondary" sx={{ py: 2 }}>
                                No player statistics recorded yet
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Goals Timeline */}
            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SportsSoccerIcon sx={{ mr: 1 }} /> Goals Timeline
              </Typography>
              <Card variant="outlined" sx={{ p: 2 }}>
                {(game.stats?.flatMap(teamStat =>
                  teamStat.goals?.map(goal => ({
                    teamId: teamStat.teamId,
                    teamName: activity.teams.find(t => t.id === teamStat.teamId)?.name,
                    player: activity.participants.find(p => p.usn === goal.playerId)?.name || 'Unknown Player',
                    playerId: goal.playerId
                  }))
                )?.length || 0) > 0 ? (
                  <Box>
                    {game.stats?.flatMap(teamStat =>
                      teamStat.goals?.map((goal, idx) => ({
                        teamId: teamStat.teamId,
                        teamName: activity.teams.find(t => t.id === teamStat.teamId)?.name,
                        player: activity.participants.find(p => p.usn === goal.playerId)?.name || 'Unknown Player',
                        playerId: goal.playerId,
                        index: idx
                      }))
                    )?.map((goal, idx) => (
                      <Box
                        key={`${goal?.playerId}-${goal?.index}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          mb: 1,
                          pb: 1,
                          borderBottom: idx !== (game.stats?.flatMap(t => t.goals)?.length || 0) - 1 ? `1px dashed ${theme.palette.divider}` : 'none'
                        }}
                      >
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                          {goal?.teamName?.charAt(0)}
                        </Avatar>
                        <Typography>
                          <strong>{goal?.player}</strong>
                          <Typography component="span" color="text.secondary">
                            {' '}({goal?.teamName})
                          </Typography>
                        </Typography>
                        <SportsSoccerIcon color="primary" fontSize="small" sx={{ ml: 1 }} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary" align="center" py={2}>
                    No goals recorded yet
                  </Typography>
                )}
              </Card>
            </Box>

            {/* Cards Section */}
            {(game.stats?.some(stat => (stat.redCards?.length || 0) > 0 || (stat.yellowCards?.length || 0) > 0)) && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <CardIcon sx={{ mr: 1 }} /> Cards Issued
                </Typography>
                <Grid container spacing={2}>
                  {/* Yellow cards */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box component="span" sx={{ display: 'inline-block', width: 16, height: 22, bgcolor: '#ffeb3b', mr: 1 }} />
                          Yellow Cards
                        </Typography>
                        {(game.stats?.flatMap(teamStat =>
                          teamStat.yellowCards?.map(card => ({
                            teamId: teamStat.teamId,
                            teamName: activity.teams.find(t => t.id === teamStat.teamId)?.name,
                            player: activity.participants.find(p => p.usn === card.playerId)?.name || 'Unknown Player'
                          }))
                        )?.length || 0) > 0 ? (
                          <List>
                            {game.stats?.flatMap(teamStat =>
                              teamStat.yellowCards?.map(card => ({
                                teamId: teamStat.teamId,
                                teamName: activity.teams.find(t => t.id === teamStat.teamId)?.name,
                                player: activity.participants.find(p => p.usn === card.playerId)?.name || 'Unknown Player'
                              }))
                            )?.map((card, idx) => (
                              <Box key={idx} sx={{ display: 'flex', mb: 1 }}>
                                <Typography>
                                  <strong>{card?.player}</strong>
                                  <Typography component="span" color="text.secondary">
                                    {' '}({card.teamName})
                                  </Typography>
                                </Typography>
                              </Box>
                            ))}
                          </List>
                        ) : (
                          <Typography color="text.secondary" sx={{ mt: 1 }}>
                            No yellow cards issued
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Red cards */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box component="span" sx={{ display: 'inline-block', width: 16, height: 22, bgcolor: '#f44336', mr: 1 }} />
                          Red Cards
                        </Typography>
                        {(game.stats?.flatMap(teamStat =>
                          teamStat.redCards?.map(card => ({
                            teamId: teamStat.teamId,
                            teamName: activity.teams.find(t => t.id === teamStat.teamId)?.name,
                            player: activity.participants.find(p => p.usn === card.playerId)?.name || 'Unknown Player'
                          }))
                        )?.length || 0) > 0 ? (
                          <List>
                            {game.stats?.flatMap(teamStat =>
                              teamStat.redCards?.map(card => ({
                                teamId: teamStat.teamId,
                                teamName: activity.teams.find(t => t.id === teamStat.teamId)?.name,
                                player: activity.participants.find(p => p.usn === card.playerId)?.name || 'Unknown Player'
                              }))
                            )?.map((card, idx) => (
                              <Box key={idx} sx={{ display: 'flex', mb: 1 }}>
                                <Typography>
                                  <strong>{card?.player}</strong>
                                  <Typography component="span" color="text.secondary">
                                    {' '}({card?.teamName})
                                  </Typography>
                                </Typography>
                              </Box>
                            ))}
                          </List>
                        ) : (
                          <Typography color="text.secondary" sx={{ mt: 1 }}>
                            No red cards issued
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* Top Scorers */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <EmojiEventsIcon sx={{ mr: 1 }} /> Top Scorers
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Player</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell align="right">Goals</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {game.getTopScorers(5).map((scorer, idx) => {
                    const player = activity.getPlayer(scorer.playerId);
                    if (!player) return null;
                    const team = activity.teams.find(t => t.id === player.teamId);

                    return (
                      <TableRow
                        key={scorer.playerId}
                        sx={{
                          bgcolor: idx < 3 ? `rgba(255,215,0,${0.1 - idx * 0.03})` : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                              {player.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={idx === 0 ? 'bold' : 'normal'}>
                              {player.name}
                              {idx === 0 && ' 👑'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{team?.name}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "medium" }}>
                          {scorer.goals}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {(!game.stats || game.stats.every(s => (s.goals?.length || 0) === 0)) && (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center' }}>
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                          No goals scored yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Assists */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <AssistantIcon sx={{ mr: 1 }} /> Top Assists
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Player</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell align="right">Assists</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {game.getTopAssists(5).map((assist, idx) => {
                    const player = activity.getPlayer(assist.playerId);
                    if (!player) return null;
                    const team = activity.teams.find(t => t.id === player.teamId);

                    return (
                      <TableRow
                        key={assist.playerId}
                        sx={{
                          bgcolor: idx < 3 ? `rgba(200,230,255,${0.1 - idx * 0.03})` : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                              {player.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={idx === 0 ? 'bold' : 'normal'}>
                              {player.name}
                              {idx === 0 && ' 🎯'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{team?.name}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "medium" }}>
                          {assist.assists}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {(!game.stats || game.stats.every(s => (s.assists?.length || 0) === 0)) && (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center' }}>
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                          No assists recorded yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Statistics tab - Enhanced and redesigned
const StatisticsTab = ({ activity, game }: { activity: SportsActivity<Sport>, game: Football }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      {/* Team Stats Comparison */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Team Comparison
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell align="center">Goals</TableCell>
                    <TableCell align="center">Assists</TableCell>
                    <TableCell align="center">Yellow Cards</TableCell>
                    <TableCell align="center">Red Cards</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity.teams.map(team => {
                    const teamStats = game.stats?.find(s => s.teamId === team.id);
                    const goals = teamStats?.goals?.length || 0;
                    const assists = teamStats?.assists?.length || 0;
                    const yellowCards = teamStats?.yellowCards?.length || 0;
                    const redCards = teamStats?.redCards?.length || 0;

                    return (
                      <TableRow key={team.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: theme.palette.primary.main }}>
                              {team.name.charAt(0)}
                            </Avatar>
                            <Typography>{team.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ color: theme.palette.success.main, fontWeight: 'medium' }}>
                          {goals}
                        </TableCell>
                        <TableCell align="center" sx={{ color: theme.palette.info.main }}>
                          {assists}
                        </TableCell>
                        <TableCell align="center">
                          {yellowCards > 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Box sx={{ width: 12, height: 16, bgcolor: '#ffeb3b', mr: 1 }} />
                              {yellowCards}
                            </Box>
                          ) : '0'}
                        </TableCell>
                        <TableCell align="center">
                          {redCards > 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Box sx={{ width: 12, height: 16, bgcolor: '#f44336', mr: 1 }} />
                              {redCards}
                            </Box>
                          ) : '0'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Player Statistics Table */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Player Statistics
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Player</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell align="center">Goals</TableCell>
                    <TableCell align="center">Assists</TableCell>
                    <TableCell align="center">Yellow Cards</TableCell>
                    <TableCell align="center">Red Cards</TableCell>
                    <TableCell align="center">G+A</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity.participants
                    .map(player => {
                      // Count goals
                      const goals = game.stats?.reduce((total, teamStat) => {
                        return total + (teamStat.goals?.filter(g => g.playerId === player.usn)?.length || 0);
                      }, 0) || 0;

                      // Count assists
                      const assists = game.stats?.reduce((total, teamStat) => {
                        return total + (teamStat.assists?.filter(a => a.playerId === player.usn)?.length || 0);
                      }, 0) || 0;

                      // Count red cards
                      const redCards = game.stats?.reduce((total, teamStat) => {
                        return total + (teamStat.redCards?.filter(c => c.playerId === player.usn)?.length || 0);
                      }, 0) || 0;

                      // Count yellow cards
                      const yellowCards = game.stats?.reduce((total, teamStat) => {
                        return total + (teamStat.yellowCards?.filter(c => c.playerId === player.usn)?.length || 0);
                      }, 0) || 0;

                      return {
                        player,
                        goals,
                        assists,
                        redCards,
                        yellowCards,
                        goalPlusAssist: goals + assists
                      };
                    })
                    .sort((a, b) => b.goalPlusAssist - a.goalPlusAssist)
                    .map(({ player, goals, assists, redCards, yellowCards, goalPlusAssist }) => {
                      const team = activity.teams.find(t => t.id === player.teamId);

                      // Skip players with no statistics
                      if (goals === 0 && assists === 0 && redCards === 0 && yellowCards === 0) return null;

                      return (
                        <TableRow key={player.usn}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                {player.name.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">
                                {player.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{team?.name}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: goals > 0 ? 'bold' : 'normal' }}>
                            {goals}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: assists > 0 ? 'bold' : 'normal' }}>
                            {assists}
                          </TableCell>
                          <TableCell align="center">
                            {yellowCards > 0 && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                <Box sx={{ width: 12, height: 16, bgcolor: '#ffeb3b', mr: 1 }} />
                                {yellowCards}
                              </Box>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {redCards > 0 && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                <Box sx={{ width: 12, height: 16, bgcolor: '#f44336', mr: 1 }} />
                                {redCards}
                              </Box>
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{
                            fontWeight: 'bold',
                            color: goalPlusAssist > 0 ? theme.palette.primary.main : 'inherit'
                          }}>
                            {goalPlusAssist}
                          </TableCell>
                        </TableRow>
                      );
                    }).filter(Boolean)}

                  {(!game.stats || game.stats.every(s => !s.goals?.length && !s.assists?.length && !s.yellowCards?.length && !s.redCards?.length)) && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center' }}>
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                          No player statistics recorded yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Define a List component to fix the earlier error
const List = ({ children, dense = false, sx = {} }) => {
  return (
    <Box component="ul" sx={{
      listStyle: 'none',
      padding: 0,
      margin: 0,
      ...sx
    }}>
      {children}
    </Box>
  );
};
