import { Suspense, useState } from 'react';
import { Cricket, SportsActivity } from "@common/models";
import { Sport } from "@common/models/sports/SportsActivity";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import LooksFourIcon from '@mui/icons-material/Looks4Outlined';
import Filter6Icon from '@mui/icons-material/Filter6';
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
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

// Main view component with its own tabs
export default function CricketView({ activity }) {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const cricket = activity.game as Cricket;

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
        <Tab icon={<ScoreboardIcon />} label="Scoreboard" iconPosition="start" />
      </Tabs>

      <Box>
        <Suspense fallback={<Typography>Loading...</Typography>}>
          {tabValue === 0 && <OverviewTab activity={activity} game={cricket} />}
          {tabValue === 1 && <PlayersTab activity={activity} />}
          {tabValue === 2 && <ScoreboardTab activity={activity} game={cricket} />}
        </Suspense>
      </Box>
    </Paper>
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

  // Get current match status
  const getMatchStatus = () => {
    const now = new Date();
    const isMatchEnded = activity.endTime && new Date(activity.endTime) < now;

    if (isMatchEnded) {
      // Match has ended
      const winner = determineWinner();
      return {
        isComplete: true,
        winner
      };
    } else if (!activity.startTime || activity.startTime > now || !game.innings || game.innings.length === 0) {
      return "Match not started";
    } else {
      const currentInnings = game.innings[game.innings.length - 1];
      const battingTeam = activity.teams.find(t => t.id === currentInnings.battingTeam);
      const bowlingTeam = activity.teams.find(t => t.id === currentInnings.bowlingTeam);

      const totalOvers = currentInnings.overs.length;
      const ballsInLastOver = currentInnings.overs.length > 0
        ? currentInnings.overs[currentInnings.overs.length - 1].balls.length
        : 0;

      const oversPlayed = totalOvers + (ballsInLastOver / 6);

      return {
        currentInnings: game.innings.length,
        battingTeam,
        bowlingTeam,
        oversPlayed: oversPlayed.toFixed(1),
        isComplete: false
      };
    }
  };

  // Determine the winner of the match
  const determineWinner = () => {
    if (!game.innings || game.innings.length === 0) return null;

    // Get scores for each team
    const scores = activity.teams.map(team => ({
      team,
      runs: game.getTotalRuns(team.id),
      wickets: game.getWicketCount(team.id)
    })).sort((a, b) => b.runs - a.runs); // Sort by runs (highest first)

    // If tie, return both teams
    if (scores.length >= 2 && scores[0].runs === scores[1].runs) {
      return { isTie: true, teams: [scores[0].team, scores[1].team] };
    }

    // Return winner
    return { isTie: false, team: scores[0].team, margin: `${scores[0].runs - scores[1].runs} runs` };
  };

  const matchStatus = getMatchStatus();

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Match Status Section - Replaced and Enhanced */}
        <Grid item xs={12}>
          <Card sx={{
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bgcolor: typeof matchStatus === 'string'
                  ? 'info.main'
                  : matchStatus.isComplete ? 'error.main' : 'success.main',
                color: 'white',
                px: 2,
                py: 0.5,
                borderBottomRightRadius: 8
              }}
            >
              {typeof matchStatus === 'string'
                ? 'UPCOMING'
                : matchStatus.isComplete
                  ? 'COMPLETED'
                  : `INNINGS ${matchStatus.currentInnings}`}
            </Box>

            <CardContent sx={{ pt: 5 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                Match Status
              </Typography>

              {typeof matchStatus === 'string' ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6">{matchStatus}</Typography>
                  <Typography variant="body2" color="text.secondary">The match will start at {new Date(activity.startTime).toLocaleString()}</Typography>
                </Box>
              ) : matchStatus.isComplete ? (
                <Box>
                  {/* Match Result Display */}
                  <Box sx={{
                    textAlign: 'center',
                    py: 2,
                    mb: 3,
                    bgcolor: 'rgba(0,0,0,0.03)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="h6" color="error.main" gutterBottom fontWeight="bold">
                      MATCH COMPLETED
                    </Typography>

                    {matchStatus.winner && (
                      matchStatus.winner.isTie ? (
                        <Typography variant="body1" fontWeight="medium">
                          Match Tied
                        </Typography>
                      ) : (
                        <>
                          <Typography variant="body1" fontWeight="medium">
                            {matchStatus.winner.team.name} won by {matchStatus.winner.margin}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {activity.endTime && `Finished: ${new Date(activity.endTime).toLocaleString()}`}
                          </Typography>
                        </>
                      )
                    )}
                  </Box>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Current Innings: {matchStatus.currentInnings}
                    </Typography>
                    <Typography variant="subtitle1">
                      Overs: {matchStatus.oversPlayed}
                    </Typography>
                  </Box>

                  {activity.teams.map(team => {
                    const teamScore = game.getTotalRuns(team.id);
                    const wickets = game.getWicketCount(team.id);
                    const overs = game.getTeamOvers(team.id);
                    const runRate = overs > 0 ? (teamScore / overs).toFixed(2) : '-';
                    const isBatting = matchStatus.battingTeam?.id === team.id;

                    return (
                      <Box
                        key={team.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                          // p: 2,
                          borderRadius: 2,
                          bgcolor: isBatting ? 'rgba(76, 175, 80, 0.12)' : 'background.paper',
                          border: `1px solid ${isBatting ? theme.palette.success.light : theme.palette.divider}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {isBatting && (
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: 0,
                              bgcolor: 'success.main',
                              color: 'white',
                              fontSize: '0.7rem',
                              px: 1,
                              py: 0.25,
                              borderBottomLeftRadius: 8
                            }}
                          >
                            BATTING
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            width: 40,
                            height: 40,
                            mr: 2,
                            fontWeight: 'bold'
                          }}>
                            {team.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {team.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              RR: {runRate}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h5" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                            {teamScore}/{wickets}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {overs > 0 ? `${overs} overs` : 'Yet to bat'}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}

                  {game.tossWinner && (
                    <Box sx={{
                      mt: 2,
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'rgba(0, 0, 0, 0.03)',
                      border: '1px dashed',
                      borderColor: 'divider',
                      fontSize: '0.9rem'
                    }}>
                      <Typography variant="body2">
                        <strong>{activity.teams.find(t => t.id === game.tossWinner.teamId)?.name}</strong> won the toss and elected to <strong>{game.tossWinner.choice}</strong> first
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {typeof matchStatus !== "string" && <>
          {/* Top Batsmen - Updated to match Basketball style */}
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
                        <TableCell align="right">Runs</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {game.getTopScorers(5).filter(scorer => scorer.runs > 0).map((scorer, idx) => {
                        const player = activity.getPlayer(scorer.player);
                        if (!player) return null;
                        const team = activity.teams.find(t => t.id === player.teamId);

                        return (
                          <TableRow
                            key={scorer.player}
                            sx={{
                              bgcolor: idx < 3 ? `rgba(255,215,0,${0.1 - idx * 0.03})` : 'inherit',
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  sx={{ width: 24, height: 24, mr: 1 }}
                                  src={`https://eu.ui-avatars.com/api/?name=${player.name}&size=50`}
                                >
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
                              {scorer.runs}
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

          {/* Top Boundaries Hitters */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Boundary Hitters
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LooksFourIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
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
                            src={`https://eu.ui-avatars.com/api/?name=${player.name}&size=50`}
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
                    <Filter6Icon sx={{ mr: 1, color: theme.palette.primary.main }} />
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
                            src={`https://eu.ui-avatars.com/api/?name=${player.name}&size=50`}
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


          {/* Innings Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Innings Details
                </Typography>

                {game.innings.map((inning, idx) => {
                  const battingTeam = activity.getTeam(inning.battingTeam);
                  const bowlingTeam = activity.getTeam(inning.bowlingTeam);

                  return (
                    <Box
                      key={idx}
                      sx={{
                        mb: 2,
                        p: 1,
                        borderRadius: 1,
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

        </>}
      </Grid>
    </Box >
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
              const battingTeam = activity.getTeam(inning.battingTeam);
              const bowlingTeam = activity.getTeam(inning.bowlingTeam);
              const inningScore = game.getInningsRuns(inningIdx);
              const wickets = game.getWicketsByInning(inningIdx);

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
                      bgcolor: theme.palette.divider,
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
                            {/* Playing Batters */}
                            {activity.participants
                              .filter(p => p.teamId === inning.battingTeam && p.isPlaying)
                              .map((player) => {
                                // Calculate player stats for this specific innings
                                let runs = 0;
                                let ballsFaced = 0;
                                let fours = 0;
                                let sixes = 0;

                                inning.overs.forEach(over => {
                                  over.balls.forEach(ball => {
                                    if (ball.batsmanId === player.usn && ball.type !== 'WD' && ball.type !== 'NB') {
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
                              
                            {/* Substitutes Section Header */}
                            {activity.participants
                              .filter(p => p.teamId === inning.battingTeam && !p.isPlaying)
                              .some(player => {
                                // Check if this substitute batted
                                let ballsFaced = 0;
                                inning.overs.forEach(over => {
                                  over.balls.forEach(ball => {
                                    if (ball.batsmanId === player.usn && ball.type !== 'WD' && ball.type !== 'NB') {
                                      ballsFaced++;
                                    }
                                  });
                                });
                                return ballsFaced > 0;
                              }) && (
                                <TableRow>
                                  <TableCell colSpan={6} sx={{ py: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="medium">
                                      Substitutes
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              )
                            }
                            
                            {/* Substitute Batters */}
                            {activity.participants
                              .filter(p => p.teamId === inning.battingTeam && !p.isPlaying)
                              .map((player) => {
                                // Calculate player stats for this specific innings
                                let runs = 0;
                                let ballsFaced = 0;
                                let fours = 0;
                                let sixes = 0;

                                inning.overs.forEach(over => {
                                  over.balls.forEach(ball => {
                                    if (ball.batsmanId === player.usn && ball.type !== 'WD' && ball.type !== 'NB') {
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
                                  <TableRow key={player.usn} sx={{ }}>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography color="text.secondary">{player.name}</Typography>
                                        {showHalfCenturyBadge && (
                                          <Chip
                                            size="small"
                                            icon={<EmojiEventsIcon />}
                                            label={runs >= 100 ? "100+" : "50+"}
                                            color={runs >= 100 ? "success" : "primary"}
                                            variant="outlined"
                                            sx={{ ml: 1, height: 20, opacity: 0.8, '& .MuiChip-icon': { fontSize: 14 } }}
                                          />
                                        )}
                                      </Box>
                                    </TableCell>
                                    <TableCell align="right">{runs}</TableCell>
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

                      {/* Bowling Section - Now update this section to separate playing and substitute bowlers */}
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
                                // Get the bowler ID for this over
                                const bowlerId = over.bowlerId;

                                if (!bowlerStats[bowlerId]) {
                                  bowlerStats[bowlerId] = {
                                    balls: 0,
                                    runs: 0,
                                    wickets: 0,
                                    playerId: bowlerId
                                  };
                                }

                                // Count balls bowled and other stats for this bowler
                                over.balls.forEach(ball => {
                                  if (ball.type !== 'NB' && ball.type !== 'WD') {
                                    bowlerStats[bowlerId].balls++;
                                  }
                                  bowlerStats[bowlerId].runs += ball.runs + ball.extraRuns;
                                  if (ball.type === "W") bowlerStats[bowlerId].wickets++;
                                });
                              });

                              // First render playing bowlers
                              const playingBowlers = Object.values(bowlerStats)
                                .filter((stats: any) => {
                                  const player = activity.participants.find(p => p.usn === stats.playerId);
                                  return player && player.isPlaying;
                                })
                                .map((stats: any) => {
                                  const player = activity.participants.find(p => p.usn === stats.playerId);
                                  if (!player) return null;

                                  // Calculate complete overs and remaining balls
                                  const completeOvers = Math.floor(stats.balls / 6);
                                  const remainingBalls = stats.balls % 6;

                                  // Format as "overs.balls" (e.g., "4.3" means 4 overs and 3 balls)
                                  const oversDisplay = remainingBalls > 0
                                    ? `${completeOvers}.${remainingBalls}`
                                    : completeOvers.toString();

                                  // Calculate economy rate (runs per over)
                                  const economy = (stats.balls > 0)
                                    ? (stats.runs / (stats.balls / 6)).toFixed(2)
                                    : '0.00';

                                  return (
                                    <TableRow key={stats.playerId}>
                                      <TableCell>{player.name}</TableCell>
                                      <TableCell align="right">{oversDisplay}</TableCell>
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
                                
                              // Check if there are any substitute bowlers
                              const substituteStats = Object.values(bowlerStats)
                                .filter((stats: any) => {
                                  const player = activity.participants.find(p => p.usn === stats.playerId);
                                  return player && !player.isPlaying;
                                });
                                
                              // Return playing bowlers first
                              if (playingBowlers.length === 0 && substituteStats.length === 0) {
                                return (
                                  <TableRow>
                                    <TableCell colSpan={5} align="center">
                                      <Typography color="text.secondary" sx={{ py: 1 }}>
                                        No bowling data available
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                );
                              }
                              
                              return (
                                <>
                                  {playingBowlers}
                                  
                                  {/* Substitute Bowlers Header */}
                                  {substituteStats.length > 0 && (
                                    <TableRow>
                                      <TableCell colSpan={5} sx={{ py: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="medium">
                                          Substitute Bowlers
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                  
                                  {/* Substitute Bowlers */}
                                  {substituteStats.map((stats: any) => {
                                    const player = activity.participants.find(p => p.usn === stats.playerId);
                                    if (!player) return null;

                                    // Calculate complete overs and remaining balls
                                    const completeOvers = Math.floor(stats.balls / 6);
                                    const remainingBalls = stats.balls % 6;

                                    // Format as "overs.balls" (e.g., "4.3" means 4 overs and 3 balls)
                                    const oversDisplay = remainingBalls > 0
                                      ? `${completeOvers}.${remainingBalls}`
                                      : completeOvers.toString();

                                    // Calculate economy rate (runs per over)
                                    const economy = (stats.balls > 0)
                                      ? (stats.runs / (stats.balls / 6)).toFixed(2)
                                      : '0.00';

                                    return (
                                      <TableRow key={stats.playerId} sx={{ }}>
                                        <TableCell>
                                          <Typography color="text.secondary">{player.name}</Typography>
                                        </TableCell>
                                        <TableCell align="right">{oversDisplay}</TableCell>
                                        <TableCell align="right">{stats.runs}</TableCell>
                                        <TableCell align="right" sx={{
                                          color: stats.wickets >= 5 ? theme.palette.success.main : 'inherit'
                                        }}>
                                          {stats.wickets}
                                        </TableCell>
                                        <TableCell align="right">{economy}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </>
                              );
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