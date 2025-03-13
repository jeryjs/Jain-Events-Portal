import { Suspense, useState } from 'react';
import { Basketball, SportsActivity } from "@common/models";
import { Sport } from "@common/models/sports/SportsActivity";
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
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import PlayersTab from "./PlayersTab";
import React from "react";

export default function BasketballView({ activity }) {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const basketball = activity.game as Basketball;

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
      </Tabs>

      <Box sx={{ p: 3 }}>
        <Suspense fallback={<Typography>Loading...</Typography>}>
          {tabValue === 0 && <BasketballOverview activity={activity} game={basketball} />}
          {tabValue === 1 && <PlayersTab activity={activity} />}
        </Suspense>
      </Box>
    </Paper>
  );
};

const BasketballOverview = ({ activity, game }: { activity: SportsActivity<Sport>, game: Basketball }) => {
  const theme = useTheme();

  const matchStatus = {
    isNotStarted: !activity.startTime || activity.startTime > new Date(),
    isComplete: activity.endTime && new Date(activity.endTime) < new Date(),
    winner: game.winner ? activity.teams.find(t => t.id === game.winner) : null
  };

  if (matchStatus.isNotStarted) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{
          // bgcolor: 'primary.main', 
          color: 'white',
          p: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h6" fontWeight="bold">
            Upcoming Match
          </Typography>
        </Box>
        <CardContent>
          <Typography variant="subtitle1" color="text.secondary" align="center">
            Get ready! The match is scheduled for:
          </Typography>
          <Typography variant="h5" align="center" fontWeight="bold" sx={{ my: 2 }}>
            {new Date(activity.startTime).toLocaleString()}
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
            {matchStatus.isComplete ? 'COMPLETED' : 'Ongoing'}
          </Box>

          <Box sx={{ p: 3, pt: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SportsBasketballIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                Basketball Match
              </Typography>
            </Box>

            {matchStatus.isComplete ? (
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
                    game.getTotalPoints(matchStatus.winner.id) -
                    game.getTotalPoints(activity.teams.find(t => t.id !== matchStatus.winner?.id)?.id || '')
                    )} points`
                    : 'Match ended in a tie'}
                  </Typography>
                  {matchStatus.winner && <Chip label="Winner" color="primary" size="small" sx={{ ml: 1 }} />}
                </Box>
              </Box>
            ) : (
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

            {activity.teams.map(team => (
              <Box key={team.id} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {team.name}
              </Typography>
              <TableContainer>
                <Table size="small">
                <TableHead>
                  <TableRow>
                  <TableCell>Player</TableCell>
                  <TableCell align="center">1-PT</TableCell>
                  <TableCell align="center">2-PT</TableCell>
                  <TableCell align="center">3-PT</TableCell>
                  <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Playing Players */}
                  {activity.participants
                  .filter(player => player.teamId === team.id && player.isPlaying)
                  .map(player => {
                    const playerPoints = game.stats
                    ?.find(s => s.teamId === team.id)
                    ?.points.filter(p => p.playerId === player.usn) || [];

                    const onePoints = playerPoints.filter(p => p.points === 1).length;
                    const twoPoints = playerPoints.filter(p => p.points === 2).length;
                    const threePoints = playerPoints.filter(p => p.points === 3).length;
                    const totalPoints = playerPoints.reduce((sum, p) => sum + p.points, 0);

                    return {
                    ...player,
                    onePoints,
                    twoPoints,
                    threePoints,
                    totalPoints
                    };
                  })
                  .sort((a, b) => b.totalPoints - a.totalPoints)
                  .map((playerWithPoints: any) => (
                    <TableRow key={playerWithPoints.usn}>
                    <TableCell>{playerWithPoints.name}</TableCell>
                    <TableCell align="center">{playerWithPoints.onePoints || '-'}</TableCell>
                    <TableCell align="center">{playerWithPoints.twoPoints || '-'}</TableCell>
                    <TableCell align="center">{playerWithPoints.threePoints || '-'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'medium' }}>{playerWithPoints.totalPoints}</TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Substitutes Section */}
                  {activity.participants
                  .filter(player => player.teamId === team.id && !player.isPlaying)
                  .length > 0 && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ py: 1 }}>
                        <Typography variant="subtitle2" fontWeight="medium">
                          Substitutes
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Substitutes Players */}
                  {activity.participants
                  .filter(player => player.teamId === team.id && !player.isPlaying)
                  .map(player => {
                    const playerPoints = game.stats
                    ?.find(s => s.teamId === team.id)
                    ?.points.filter(p => p.playerId === player.usn) || [];

                    const onePoints = playerPoints.filter(p => p.points === 1).length;
                    const twoPoints = playerPoints.filter(p => p.points === 2).length;
                    const threePoints = playerPoints.filter(p => p.points === 3).length;
                    const totalPoints = playerPoints.reduce((sum, p) => sum + p.points, 0);

                    return {
                    ...player,
                    onePoints,
                    twoPoints,
                    threePoints,
                    totalPoints
                    };
                  })
                  .sort((a, b) => b.totalPoints - a.totalPoints)
                  .map((playerWithPoints: any) => (
                    <TableRow key={playerWithPoints.usn}>
                    <TableCell>
                      <Typography color="text.secondary">{playerWithPoints.name}</Typography>
                    </TableCell>
                    <TableCell align="center">{playerWithPoints.onePoints || '-'}</TableCell>
                    <TableCell align="center">{playerWithPoints.twoPoints || '-'}</TableCell>
                    <TableCell align="center">{playerWithPoints.threePoints || '-'}</TableCell>
                    <TableCell align="right">{playerWithPoints.totalPoints}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </TableContainer>
              <Divider />
              </Box>
            ))}
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
                    <TableCell align="right">Points</TableCell>
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
                          {scorer.points}
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

      {/* Point Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <ScoreboardIcon sx={{ mr: 1 }} /> Point Distribution
            </Typography>

            {activity.teams.map(team => {
              const teamStats = game.stats?.find(s => s.teamId === team.id);
              if (!teamStats) return null;

              // Count point types
              const onePoints = teamStats.points.filter(p => p.points === 1).length;
              const twoPoints = teamStats.points.filter(p => p.points === 2).length;
              const threePoints = teamStats.points.filter(p => p.points === 3).length;

              // Calculate point values
              const onePointValue = onePoints * 1;
              const twoPointValue = twoPoints * 2;
              const threePointValue = threePoints * 3;
              const totalPoints = onePointValue + twoPointValue + threePointValue;

              return (
                <Box key={team.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, mr: 1 }}>{team.name.charAt(0)}</Avatar>
                    <Typography variant="subtitle1">{team.name}</Typography>
                  </Box>

                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <Card variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold" color="secondary.main">
                          {threePoints}
                        </Typography>
                        <Typography variant="caption">3-pointers ({threePointValue} pts)</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                          {twoPoints}
                        </Typography>
                        <Typography variant="caption">2-pointers ({twoPointValue} pts)</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold" color="success.main">
                          {onePoints}
                        </Typography>
                        <Typography variant="caption">Free throws ({onePointValue} pts)</Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  <Divider />
                </Box>
              );
            })}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const ScoreboardView = ({ activity, game }: { activity: SportsActivity<Sport>, game: Basketball }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Team Statistics</Typography>


      </CardContent>
    </Card>
  );
};