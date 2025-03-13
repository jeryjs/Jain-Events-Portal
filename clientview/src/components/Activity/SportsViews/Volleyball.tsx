import { useState } from 'react';
import { SportsActivity } from "@common/models";
import { Volleyball as VolleyballModel, OtherSport, Sport } from "@common/models/sports/SportsActivity";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
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
  useMediaQuery,
  Stack
} from "@mui/material";
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import PlayersTab from "./PlayersTab";
import React from "react";

// Helper functions for volleyball data
const isLegacyFormat = (game: any): game is OtherSport => {
  return game.points !== undefined && !('sets' in game);
};

const isVolleyballFormat = (game: any): game is VolleyballModel => {
  return 'sets' in game;
};

const getTeamTotalPoints = (game: any, teamId: string): number => {
  if (isVolleyballFormat(game)) {
    return game.getTotalPoints(teamId);
  }
  return (game as OtherSport).getTotalPoints(teamId);
};

const getTeamSetsWon = (game: any, teamId: string): number => {
  if (!isVolleyballFormat(game)) return 0;
  
  const volleyballGame = game as VolleyballModel;
  return volleyballGame.sets.reduce((wins, set) => {
    const teamPoints = set.points.find(p => p.teamId === teamId)?.points || 0;
    if (teamPoints === 0) return wins;
    
    const maxPoints = Math.max(...set.points.map(p => p.points));
    return wins + (teamPoints === maxPoints ? 1 : 0);
  }, 0);
};

export default function VolleyballView({ activity }) {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const game = activity.game as (VolleyballModel | OtherSport);

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
        {tabValue === 0 && <VolleyballOverview activity={activity} game={game} />}
        {tabValue === 1 && <PlayersTab activity={activity} />}
      </Box>
    </Paper>
  );
};

const VolleyballOverview = ({ activity, game }: { activity: SportsActivity<Sport>, game: VolleyballModel | OtherSport }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const matchStatus = {
    isComplete: activity.endTime && new Date(activity.endTime) < new Date(),
    isNotStarted: !activity.startTime || new Date(activity.startTime) > new Date()
  };

  // Get winner team based on sets won
  const getWinnerTeam = () => {
    if (!isVolleyballFormat(game) && !isLegacyFormat(game)) return null;
    
    const teams = activity.teams || [];
    if (teams.length < 2) return null;
    
    if (isVolleyballFormat(game)) {
      // In volleyball, the winner is determined by sets won
      const teamStats = teams.map(team => ({
        team,
        setsWon: getTeamSetsWon(game, team.id)
      }));
      
      teamStats.sort((a, b) => b.setsWon - a.setsWon);
      
      // If one team has more sets than others, they're the winner
      if (teamStats[0] && teamStats[1] && teamStats[0].setsWon > teamStats[1].setsWon) {
        return teamStats[0].team;
      }
      
      return null;
    } else {
      // Legacy format - determine winner by points
      const teamPoints = teams.map(team => ({
        team,
        points: getTeamTotalPoints(game, team.id)
      }));
      
      teamPoints.sort((a, b) => b.points - a.points);
      
      if (teamPoints[0] && teamPoints[1] && teamPoints[0].points > teamPoints[1].points) {
        return teamPoints[0].team;
      }
      
      return null;
    }
  };

  const winnerTeam = getWinnerTeam();

  if (matchStatus.isNotStarted) {
    return (
      <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.dark', color: 'white', textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Upcoming Volleyball Match</Typography>
        </Box>
        <CardContent>
          <Typography variant="subtitle1" color="text.secondary" align="center">
            Match starts at:
          </Typography>
          <Typography variant="h5" align="center" fontWeight="bold" sx={{ my: 2 }}>
            {new Date(activity.startTime).toLocaleString()}
          </Typography>
          
          <Box sx={{ my: 3 }}>
            <Grid container spacing={2}>
              {activity.teams.map(team => (
                <Grid item xs={6} key={team.id}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
                      {team.name?.charAt(0) || '?'}
                    </Avatar>
                    <Typography variant="body1" fontWeight="medium">{team.name}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Match Summary Card */}
      <Grid item xs={12}>
        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bgcolor: matchStatus.isComplete ? (winnerTeam ? 'success.main' : 'primary.main') : 'info.main',
              color: 'white',
              py: 0.5,
              borderBottomRightRadius: 8
            }}
          >
            {matchStatus.isComplete ? (winnerTeam ? 'COMPLETED' : 'DRAW') : 'ONGOING'}
          </Box>

          <Box sx={{ pt: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SportsVolleyballIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                Volleyball Match
              </Typography>
            </Box>

            {matchStatus.isComplete && winnerTeam && (
              <Box sx={{
                textAlign: 'center',
                mt: 2,
                p: 1.5,
                bgcolor: 'success.light',
                color: 'success.contrastText',
                borderRadius: 1
              }}>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <EmojiEventsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {winnerTeam.name} won the match
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Sets Summary */}
            {isVolleyballFormat(game) && game.sets.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScoreboardIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                  Sets Summary
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Set</TableCell>
                        {activity.teams.map(team => (
                          <TableCell align="center" key={team.id} sx={{ fontWeight: 'bold' }}>
                            {team.name}
                          </TableCell>
                        ))}
                        <TableCell align="right">Winner</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {game.sets.map((set, idx) => {
                        // Find winning team for this set
                        const maxPoints = Math.max(...set.points.map(p => p.points));
                        const winningTeamId = set.points.find(p => p.points === maxPoints && p.points > 0)?.teamId;
                        const setWinnerTeam = activity.teams.find(t => t.id === winningTeamId);
                        
                        return (
                          <TableRow 
                            key={idx}
                            sx={{ 
                              '&:nth-of-type(odd)': { bgcolor: 'background.default' }
                            }}
                          >
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              Set {idx + 1}
                            </TableCell>
                            
                            {activity.teams.map(team => {
                              const points = set.points.find(p => p.teamId === team.id)?.points || 0;
                              const isWinner = team.id === winningTeamId && points > 0;
                              
                              return (
                                <TableCell 
                                  align="center" 
                                  key={team.id}
                                  sx={{ 
                                    fontWeight: isWinner ? 'bold' : 'regular',
                                    color: isWinner ? 'success.main' : 'text.primary'
                                  }}
                                >
                                  {points}
                                </TableCell>
                              );
                            })}
                            
                            <TableCell align="right">
                              {setWinnerTeam && maxPoints > 0 ? (
                                <Chip 
                                  size="small" 
                                  label={setWinnerTeam.name}
                                  color="success"
                                  variant="outlined"
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            {/* Players summary */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                Team Players
              </Typography>
              
              <Grid container spacing={2}>
                {activity.teams.map(team => (
                  <Grid item xs={12} sm={6} key={team.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          {team.name}
                        </Typography>
                        
                        {/* Players list */}
                        <Stack spacing={1}>
                          <Box>
                            <Typography variant="body2" color="success.main" gutterBottom fontWeight="medium">
                              Playing
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {activity.getTeamPlayers(team.id)
                                .filter(p => p.isPlaying)
                                .map((player, idx) => (
                                  <Chip 
                                    key={player.usn || idx}
                                    label={player.name} 
                                    size="small"
                                    avatar={<Avatar>{player.name.charAt(0)}</Avatar>}
                                  />
                                ))
                              }
                            </Box>
                          </Box>
                          
                          {activity.getTeamPlayers(team.id).filter(p => !p.isPlaying).length > 0 && (
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                                Substitutes
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {activity.getTeamPlayers(team.id)
                                  .filter(p => !p.isPlaying)
                                  .map((player, idx) => (
                                    <Chip 
                                      key={player.usn || idx}
                                      label={player.name} 
                                      size="small"
                                      variant="outlined"
                                      avatar={<Avatar sx={{ bgcolor: 'grey.300' }}>{player.name.charAt(0)}</Avatar>}
                                    />
                                  ))
                                }
                              </Box>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
