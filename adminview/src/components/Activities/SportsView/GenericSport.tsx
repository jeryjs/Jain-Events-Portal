import { useState, useCallback } from 'react';
import { Box, Card, CardContent, CardHeader, Grid, IconButton, Typography, Tooltip, Avatar, Divider, Paper, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import { SportsActivity } from '@common/models';
import { OtherSport, Sport } from '@common/models/sports/SportsActivity';

interface GenericSportFormProps {
  formData: SportsActivity<Sport>;
  setFormData: (data: SportsActivity<Sport>) => void;
}

interface PointEntry {
  teamId: string;
  points: number;
}

export const GenericSport = ({ formData, setFormData }: GenericSportFormProps) => {
  const game = (formData.game || {}) as OtherSport;
  const teams = formData.teams || [];

  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Initialize game stats if needed
  const initializeGameStats = useCallback(() => {
    if (!game.points || game.points.length === 0) {
      const initialPoints = teams.map(team => ({
        teamId: team.id,
        points: 0
      }));

      setFormData({
        ...formData,
        game: {
          ...game,
          points: initialPoints
        },
      } as SportsActivity<Sport>);
    }
  }, [formData, game, teams, setFormData]);

  // Initialize on component load
  if (teams.length >= 2 && (!game.points || game.points.length === 0)) {
    initializeGameStats();
  }

  // Show notification helper
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  }, []);

  // Update game data in the parent form
  const updateGameData = useCallback((points: PointEntry[]) => {
    try {
      setFormData({
        ...formData,
        game: {
          ...game,
          points
        }
      } as SportsActivity<Sport>);

      showNotification("Match data updated");
    } catch (error) {
      console.error("Failed to update match data:", error);
      showNotification("Failed to update match data", "error");
    }
  }, [formData, game, setFormData, showNotification]);

  // Add points to a team
  const addPoints = useCallback((teamId: string, pointsToAdd: number) => {
    try {
      const updatedPoints = [...(game.points || [])];
      let teamIndex = updatedPoints.findIndex(point => point.teamId === teamId);

      if (teamIndex === -1) {
        // Team points not initialized, initialize it
        updatedPoints.push({
          teamId: teamId,
          points: pointsToAdd
        });
      } else {
        // Increment existing team's points
        updatedPoints[teamIndex].points += pointsToAdd;
      }

      updateGameData(updatedPoints);
    } catch (error) {
      console.error("Error adding points:", error);
      showNotification("Failed to add points", "error");
    }
  }, [game.points, updateGameData, showNotification]);

  // Remove points from a team
  const removePoints = useCallback((teamId: string, pointsToRemove: number) => {
    try {
      const updatedPoints = [...(game.points || [])];
      const teamIndex = updatedPoints.findIndex(point => point.teamId === teamId);

      if (teamIndex === -1) {
        showNotification("Team not found", "error");
        return;
      }

      updatedPoints[teamIndex].points = Math.max(0, updatedPoints[teamIndex].points - pointsToRemove);
      updateGameData(updatedPoints);
    } catch (error) {
      console.error("Error removing points:", error);
      showNotification("Failed to remove points", "error");
    }
  }, [game.points, updateGameData, showNotification]);

  if (teams.length < 2) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            At least two teams are required to set up the match.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
          <SportsVolleyballIcon sx={{ mr: 1 }} /> Generic Sport Match
        </Typography>
        <Divider sx={{ mt: 1 }} />
      </Box>

      {/* Scoreboard - Side by Side */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {teams.map((team) => {
          const teamPoints = game.points?.find(p => p.teamId === team.id)?.points || 0;

          return (
            <Grid item xs={12} sm={6} key={team.id}>
              <Card variant="outlined" sx={{
                height: '100%',
                borderWidth: 2,
                borderColor: 'divider'
              }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {team.name?.charAt(0) || '?'}
                      </Avatar>
                      <Typography variant="h6" noWrap>{team.name || 'Unnamed Team'}</Typography>
                    </Box>
                  }
                  action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 2 }}>
                      <Typography variant="h4" fontWeight="bold">
                        {teamPoints}
                      </Typography>
                      <Tooltip title={`Add Points for ${team.name || 'Team'}`}>
                        <IconButton color="success" onClick={() => addPoints(team.id, 1)}>
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={`Remove Points from ${team.name || 'Team'}`}>
                        <IconButton 
                          color="error" 
                          onClick={() => removePoints(team.id, 1)}
                          disabled={teamPoints <= 0}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={2000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notification?.type || 'success'} variant="filled">{notification?.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

