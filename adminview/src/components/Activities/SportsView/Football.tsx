import AddIcon from '@mui/icons-material/Add';
import CardIcon from '@mui/icons-material/Style';
import DeleteIcon from '@mui/icons-material/Delete';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { SportsActivity } from '@common/models';
import { Football, Sport } from '@common/models/sports/SportsActivity';

interface FootballFormProps {
  formData: SportsActivity<Sport>;
  setFormData: (data: SportsActivity<Sport>) => void;
}

export const FootballForm = ({ formData, setFormData }: FootballFormProps) => {
  const theme = useTheme();
  const game = useMemo(() => (formData.game as Football || new Football()), [formData.game]);
  const teams = formData.teams || [];
  const players = formData.participants || [];

  const [hoveredPlayer, setHoveredPlayer] = useState<{ teamId: string, playerId: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]); // Track actions
  const [confirmDelete, setConfirmDelete] = useState<{ teamId: string, actionType: string, index: number } | null>(null);

  // Initialize game stats if needed
  const initializeGameStats = useCallback(() => {
    if (!game.stats || game.stats.length === 0) {
      const initialStats = teams.map(team => ({
        teamId: team.id,
        goals: [],
        assists: [],
        redCards: [],
        yellowCards: [],
        positions: []
      }));

      setFormData({
        ...formData,
        game: {
          ...game,
          stats: initialStats
        },
      } as SportsActivity<Sport>);
    }
  }, [formData, game, teams, setFormData]);

  // Initialize on component load
  if (teams.length >= 2 && (!game.stats || game.stats.length === 0)) {
    initializeGameStats();
  }

  // Update game data in the parent form
  const updateGameData = useCallback((stats: any) => {
    setFormData({
      ...formData,
      game: {
        ...game,
        stats
      }
    } as SportsActivity<Sport>);

    setNotification("Match data updated");
    setTimeout(() => setNotification(null), 2000);
  }, [formData, game, setFormData]);

  // Get team players
  const getTeamPlayers = useCallback((teamId: string) => {
    return players.filter(p => p.teamId === teamId);
  }, [players]);

  // Add action to log
  const logAction = (message: string) => {
    setActionLog(prevLog => [message, ...prevLog]);
  };

  // Add player action (goal, assist, card)
  const addPlayerAction = useCallback((teamId: string, playerId: string, actionType: string) => {
    const updatedStats = [...(game.stats || [])];
    const teamIndex = updatedStats.findIndex(stat => stat.teamId === teamId);

    if (teamIndex === -1) {
      // Team stats not initialized, initialize it
      updatedStats.push({
        teamId: teamId,
        goals: [],
        assists: [],
        redCards: [],
        yellowCards: [],
        positions: []
      });
    }

    const teamStat = updatedStats.find(stat => stat.teamId === teamId);

    switch (actionType) {
      case 'goal':
        teamStat.goals = teamStat.goals || []; // Ensure array exists
        teamStat.goals.push({ playerId });
        logAction(`Goal scored by ${players.find(p => p.usn === playerId)?.name} (${teams.find(t => t.id === teamId)?.name})`);
        break;
      case 'assist':
        teamStat.assists = teamStat.assists || []; // Ensure array exists
        teamStat.assists.push({ playerId });
        logAction(`Assist by ${players.find(p => p.usn === playerId)?.name} (${teams.find(t => t.id === teamId)?.name})`);
        break;
      case 'yellowCard':
        teamStat.yellowCards = teamStat.yellowCards || []; // Ensure array exists
        teamStat.yellowCards.push({ playerId });
        logAction(`Yellow card for ${players.find(p => p.usn === playerId)?.name} (${teams.find(t => t.id === teamId)?.name})`);
        break;
      case 'redCard':
        teamStat.redCards = teamStat.redCards || []; // Ensure array exists
        teamStat.redCards.push({ playerId });
        logAction(`Red card for ${players.find(p => p.usn === playerId)?.name} (${teams.find(t => t.id === teamId)?.name})`);
        break;
    }

    updateGameData(updatedStats);
  }, [game.stats, updateGameData, players, teams, logAction]);

  // Delete player action
  const deletePlayerAction = useCallback((teamId: string, actionType: string, index: number) => {
    const updatedStats = [...(game.stats || [])];
    const teamIndex = updatedStats.findIndex(stat => stat.teamId === teamId);

    if (teamIndex === -1) return;

    let playerName = '';
    switch (actionType) {
      case 'goal':
        playerName = players.find(p => p.usn === game.stats[teamIndex].goals[index].playerId)?.name || 'Unknown';
        updatedStats[teamIndex].goals.splice(index, 1);
        logAction(`Goal removed from ${playerName} (${teams.find(t => t.id === teamId)?.name})`);
        break;
      case 'assist':
        playerName = players.find(p => p.usn === game.stats[teamIndex].assists[index].playerId)?.name || 'Unknown';
        updatedStats[teamIndex].assists.splice(index, 1);
        logAction(`Assist removed from ${playerName} (${teams.find(t => t.id === teamId)?.name})`);
        break;
      case 'yellowCard':
        playerName = players.find(p => p.usn === game.stats[teamIndex].yellowCards[index].playerId)?.name || 'Unknown';
        updatedStats[teamIndex].yellowCards.splice(index, 1);
        logAction(`Yellow card removed from ${playerName} (${teams.find(t => t.id === teamId)?.name})`);
        break;
      case 'redCard':
        playerName = players.find(p => p.usn === game.stats[teamIndex].redCards[index].playerId)?.name || 'Unknown';
        updatedStats[teamIndex].redCards.splice(index, 1);
        logAction(`Red card removed from ${playerName} (${teams.find(t => t.id === teamId)?.name})`);
        break;
    }

    updateGameData(updatedStats);
  }, [game.stats, updateGameData, players, teams, logAction]);

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      deletePlayerAction(confirmDelete.teamId, confirmDelete.actionType, confirmDelete.index);
      setConfirmDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main }}>
          <SportsSoccerIcon sx={{ mr: 1 }} /> Football Match
        </Typography>
        <Divider sx={{ mt: 1 }} />
      </Box>

      {/* Scoreboard - Side by Side */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {teams.map((team) => {
          const teamStats = game.stats?.find(s => s.teamId === team.id);
          const goals = teamStats?.goals?.length || 0;
          const { yellow, red } = {
            yellow: teamStats?.yellowCards?.length || 0,
            red: teamStats?.redCards?.length || 0
          };

          return (
            <Grid item xs={12} md={6} key={team.id}>
              <Card variant="outlined" sx={{
                height: '100%',
                borderWidth: 2,
                borderColor: theme.palette.divider
              }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                        {team.name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6">{team.name}</Typography>
                    </Box>
                  }
                  action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 2 }}>
                      <Typography variant="h4" fontWeight="bold">
                        {goals}
                      </Typography>
                      <Box>
                        {yellow > 0 && (
                          <Chip
                            size="small"
                            label={yellow}
                            sx={{ bgcolor: '#ff9800', color: 'white', mr: 0.5 }}
                          />
                        )}
                        {red > 0 && (
                          <Chip
                            size="small"
                            label={red}
                            sx={{ bgcolor: '#f44336', color: 'white' }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Teams and Players - Side by Side */}
      <Grid container spacing={3}>
        {teams.map((team) => {
          const teamPlayers = getTeamPlayers(team.id);
          return (
            <Grid item xs={12} md={6} key={team.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    {team.name} Players
                  </Typography>
                  <List dense>
                    {teamPlayers.map((player) => {
                      const isHovered = hoveredPlayer?.teamId === team.id &&
                        hoveredPlayer?.playerId === player.usn;

                      return (
                        <ListItemButton
                          key={player.usn}
                          onMouseEnter={() => setHoveredPlayer({ teamId: team.id, playerId: player.usn })}
                          onMouseLeave={() => setHoveredPlayer(null)}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            border: isHovered ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
                            borderRadius: 1,
                            transition: 'all 0.2s ease',
                            bgcolor: isHovered ? `${theme.palette.primary.main}15` : 'transparent'
                          }}
                        >
                          <Box display="flex">
                            <ListItemAvatar>
                              <Avatar sx={{
                                bgcolor: isHovered ? theme.palette.primary.main : theme.palette.grey[400],
                                transition: 'background-color 0.2s ease'
                              }}>
                                {player.name.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={player.name}
                              sx={{
                                fontWeight: isHovered ? 'bold' : 'normal',
                                transition: 'font-weight 0.2s ease'
                              }}
                            />
                          </Box>

                          {/* Action chips with smooth transition */}
                          <Box sx={{
                            height: isHovered ? '40px' : '0px',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            ml: 6,
                            gap: 1,
                            transition: 'all 0.25s ease-in-out',
                            bgcolor: 'rgba(0,0,0,0.02)',
                            borderRadius: 1
                          }}>
                            <Tooltip title={`Add Goal for ${player.name}`}>
                              <Chip
                                icon={<SportsSoccerIcon />}
                                label="Goal"
                                color="success"
                                variant="outlined"
                                onClick={(e) => {
                                  // Stop propagation and add points with explicit team ID
                                  e.stopPropagation();
                                  addPlayerAction(team.id, player.usn, 'goal');
                                }}
                                clickable
                                sx={{
                                  fontWeight: 'bold',
                                  transform: 'scale(1)',
                                  '&:hover': {
                                    bgcolor: `rgba(76, 175, 80, 0.2)`,
                                    borderColor: theme.palette.success.main,
                                    transform: 'scale(1.05)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              />
                            </Tooltip>
                            <Tooltip title={`Add Assist for ${player.name}`}>
                              <Chip
                                icon={<RecordVoiceOverIcon />}
                                label="Assist"
                                color="info"
                                variant="outlined"
                                onClick={(e) => {
                                  // Stop propagation and add points with explicit team ID
                                  e.stopPropagation();
                                  addPlayerAction(team.id, player.usn, 'assist');
                                }}
                                clickable
                                sx={{
                                  fontWeight: 'bold',
                                  transform: 'scale(1)',
                                  '&:hover': {
                                    bgcolor: `rgba(33, 150, 243, 0.2)`,
                                    borderColor: theme.palette.info.main,
                                    transform: 'scale(1.05)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              />
                            </Tooltip>
                            <Tooltip title={`Add Yellow Card for ${player.name}`}>
                              <Chip
                                icon={<CardIcon />}
                                label="Yellow"
                                color="warning"
                                variant="outlined"
                                onClick={(e) => {
                                  // Stop propagation and add points with explicit team ID
                                  e.stopPropagation();
                                  addPlayerAction(team.id, player.usn, 'yellowCard');
                                }}
                                clickable
                                sx={{
                                  fontWeight: 'bold',
                                  transform: 'scale(1)',
                                  '&:hover': {
                                    bgcolor: `rgba(255, 235, 59, 0.2)`,
                                    borderColor: theme.palette.warning.main,
                                    transform: 'scale(1.05)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              />
                            </Tooltip>
                            <Tooltip title={`Add Red Card for ${player.name}`}>
                              <Chip
                                icon={<CardIcon />}
                                label="Red"
                                color="error"
                                variant="outlined"
                                onClick={(e) => {
                                  // Stop propagation and add points with explicit team ID
                                  e.stopPropagation();
                                  addPlayerAction(team.id, player.usn, 'redCard');
                                }}
                                clickable
                                sx={{
                                  fontWeight: 'bold',
                                  transform: 'scale(1)',
                                  '&:hover': {
                                    bgcolor: `rgba(244, 67, 54, 0.2)`,
                                    borderColor: theme.palette.error.main,
                                    transform: 'scale(1.05)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              />
                            </Tooltip>
                          </Box>
                        </ListItemButton>
                      );
                    })}
                    {teamPlayers.length === 0 && (
                      <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                        No players in this team
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Actions Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Edit Actions</Typography>
        {teams.map((team) => {
          const teamStats = game.stats?.find(s => s.teamId === team.id);
          const goals = teamStats?.goals || [];
          const assists = teamStats?.assists || [];
          const yellowCards = teamStats?.yellowCards || [];
          const redCards = teamStats?.redCards || [];

          return (
            <Card key={team.id} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>{team.name} Actions</Typography>
                <Grid container spacing={1}>
                  {goals.map((goal, index) => {
                    const player = players.find(p => p.usn === goal.playerId);
                    return (
                      <Grid item key={`goal-${index}`} xs={6} sm={4} md={3} lg={2}>
                        <Tooltip title={`Remove Goal from ${player?.name || 'Unknown'}`}>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => setConfirmDelete({ teamId: team.id, actionType: 'goal', index })}
                          >
                            <SportsSoccerIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                  {assists.map((assist, index) => {
                    const player = players.find(p => p.usn === assist.playerId);
                    return (
                      <Grid item key={`assist-${index}`} xs={6} sm={4} md={3} lg={2}>
                        <Tooltip title={`Remove Assist from ${player?.name || 'Unknown'}`}>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => setConfirmDelete({ teamId: team.id, actionType: 'assist', index })}
                          >
                            <RecordVoiceOverIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                  {yellowCards.map((card, index) => {
                    const player = players.find(p => p.usn === card.playerId);
                    return (
                      <Grid item key={`yellow-${index}`} xs={6} sm={4} md={3} lg={2}>
                        <Tooltip title={`Remove Yellow Card from ${player?.name || 'Unknown'}`}>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => setConfirmDelete({ teamId: team.id, actionType: 'yellowCard', index })}
                          >
                            <CardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                  {redCards.map((card, index) => {
                    const player = players.find(p => p.usn === card.playerId);
                    return (
                      <Grid item key={`red-${index}`} xs={6} sm={4} md={3} lg={2}>
                        <Tooltip title={`Remove Red Card from ${player?.name || 'Unknown'}`}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setConfirmDelete({ teamId: team.id, actionType: 'redCard', index })}
                          >
                            <CardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                  {(goals.length === 0 && assists.length === 0 && yellowCards.length === 0 && redCards.length === 0) && (
                    <Grid item xs={12}>
                      <Typography color="text.secondary" sx={{ p: 2 }}>No actions recorded for this team</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={!!confirmDelete}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this action?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={2000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">{notification}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default FootballForm;