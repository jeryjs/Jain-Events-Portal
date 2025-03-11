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

export const GenericSport = ({ formData, setFormData }: GenericSportFormProps) => {
  const game = (formData.game || {}) as OtherSport;
  const teams = formData.teams || [];

  const [notification, setNotification] = useState<string | null>(null);

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

  // Update game data in the parent form
  const updateGameData = useCallback((points: any) => {
    setFormData({
      ...formData,
      game: {
        ...game,
        points
      }
    } as SportsActivity<Sport>);

    setNotification("Match data updated");
    setTimeout(() => setNotification(null), 2000);
  }, [formData, game, setFormData]);

  // Add points to a team
  const addPoints = useCallback((teamId: string, points: number) => {
    const updatedPoints = [...(game.points || [])];
    const teamIndex = updatedPoints.findIndex(point => point.teamId === teamId);

    if (teamIndex === -1) {
      // Team points not initialized, initialize it
      updatedPoints.push({
        teamId: teamId,
        points: 0
      });
    }

    updatedPoints[teamIndex].points += points;

    updateGameData(updatedPoints);
  }, [game.points, updateGameData]);

  // Remove points from a team
  const removePoints = useCallback((teamId: string, points: number) => {
    const updatedPoints = [...(game.points || [])];
    const teamIndex = updatedPoints.findIndex(point => point.teamId === teamId);

    if (teamIndex === -1) return;

    updatedPoints[teamIndex].points = Math.max(0, updatedPoints[teamIndex].points - points);

    updateGameData(updatedPoints);
  }, [game.points, updateGameData]);

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
            <Grid item xs={12} md={6} key={team.id}>
              <Card variant="outlined" sx={{
                height: '100%',
                borderWidth: 2,
                borderColor: 'divider'
              }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {team.name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6">{team.name}</Typography>
                    </Box>
                  }
                  action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 2 }}>
                      <Typography variant="h4" fontWeight="bold">
                        {teamPoints}
                      </Typography>
                      <Tooltip title={`Add Points for ${team.name}`}>
                        <IconButton color="success" onClick={() => addPoints(team.id, 1)}>
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={`Remove Points from ${team.name}`}>
                        <IconButton color="error" onClick={() => removePoints(team.id, 1)}>
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
        <Alert severity="success" variant="filled">{notification}</Alert>
      </Snackbar>
    </Paper>
  );
};

