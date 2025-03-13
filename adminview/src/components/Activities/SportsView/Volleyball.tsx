import { useState, useCallback, useEffect } from 'react';
import { 
  Box, Card, CardContent, CardHeader, Grid, IconButton, Typography, 
  Tooltip, Avatar, Divider, Paper, Snackbar, Alert, Accordion, 
  AccordionSummary, AccordionDetails, Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import { SportsActivity } from '@common/models';
import { Volleyball as VolleyballModel, Sport, OtherSport } from '@common/models/sports/SportsActivity';

interface VolleyballProps {
  formData: SportsActivity<Sport>;
  setFormData: (data: SportsActivity<Sport>) => void;
}

interface SetPoints {
  points: { teamId: string; points: number }[];
}

// Export component for both named and default export
export const Volleyball = ({ formData, setFormData }: VolleyballProps) => {
  const game = formData.game || {}; // Handle undefined game
  const teams = formData.teams || [];
  const [expanded, setExpanded] = useState<string | false>('set-0');
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Handle backwards compatibility and initialization
  useEffect(() => {
    // Check if game is initialized properly
    if (!game || Object.keys(game).length === 0) {
      console.log("Game is not initialized, creating new volleyball game");
      initializeVolleyballGame();
      return;
    }

    // Check for legacy format
    if (isLegacyFormat(game)) {
      console.log("Converting legacy format to volleyball format");
      convertLegacyFormat();
      return;
    }

    // Initialize if it's a volleyball model but no sets
    if (isVolleyballFormat(game) && (!game.sets || game.sets.length === 0) && teams.length >= 2) {
      console.log("Volleyball game has no sets, initializing");
      initializeVolleyballGame();
      return;
    }
  }, [teams.length]); // Re-run when teams change

  // Check if data is in legacy format (OtherSport)
  const isLegacyFormat = useCallback((game: any): game is OtherSport => {
    // Safety check for undefined or null game
    if (!game) return false;
    return 'points' in game && Array.isArray(game.points) && !('sets' in game);
  }, []);

  // Check if data is in volleyball format
  const isVolleyballFormat = useCallback((game: any): game is VolleyballModel => {
    // Safety check for undefined or null game
    if (!game) return false;
    return 'sets' in game && Array.isArray(game.sets);
  }, []);

  // Convert from legacy OtherSport format to Volleyball format
  const convertLegacyFormat = useCallback(() => {
    try {
      const legacyGame = game as OtherSport;
      // Safely access points with a fallback to avoid errors
      const legacyPoints = legacyGame.points || [];
      
      const initialSets: SetPoints[] = [{
        points: legacyPoints.length > 0 ? legacyPoints : teams.map(team => ({ teamId: team.id, points: 0 }))
      }];

      // Create a volleyball model with the sets
      const volleyballGame = new VolleyballModel();
      volleyballGame.sets = initialSets;
      
      setFormData({ ...formData, game: volleyballGame } as unknown as SportsActivity<Sport>);
      showNotification("Converted legacy volleyball data format", "success");
    } catch (error) {
      console.error("Error converting legacy format:", error);
      showNotification("Failed to convert data format", "error");
    }
  }, [formData, game, teams, setFormData]);

  // Initialize a new volleyball game
  const initializeVolleyballGame = useCallback(() => {
    try {
      console.log("Initializing volleyball game with teams:", teams);
      
      if (teams.length < 2) {
        console.log("Not enough teams to initialize volleyball game");
        return;
      }
      
      const initialSets: SetPoints[] = [{
        points: teams.map(team => ({
          teamId: team.id,
          points: 0
        }))
      }];

      // Create a volleyball model with the sets
      const volleyballGame = new VolleyballModel();
      volleyballGame.sets = initialSets;
      
      console.log("Setting form data with new volleyball game:", volleyballGame);
      setFormData({ ...formData, game: volleyballGame } as unknown as SportsActivity<Sport>);
    } catch (error) {
      console.error("Error initializing volleyball game:", error);
    }
  }, [formData, teams, setFormData]);

  // Show notification helper
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  }, []);

  // Handle accordion expansion change
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Update points in a specific set
  const updatePoints = useCallback((setIndex: number, teamId: string, newPoints: number) => {
    try {
      if (!isVolleyballFormat(game) || !game.sets) return;

      const updatedSets = [...game.sets];
      
      if (!updatedSets[setIndex]) {
        // Initialize set if it doesn't exist
        updatedSets[setIndex] = { 
          points: teams.map(t => ({ teamId: t.id, points: 0 })) 
        };
      }
      
      const teamPointIndex = updatedSets[setIndex].points.findIndex(p => p.teamId === teamId);
      
      if (teamPointIndex === -1) {
        // Add team points if not exists
        updatedSets[setIndex].points.push({ teamId, points: Math.max(0, newPoints) });
      } else {
        // Update existing points
        updatedSets[setIndex].points[teamPointIndex].points = Math.max(0, newPoints);
      }

      // Create a volleyball model with the updated sets
      const volleyballGame = new VolleyballModel();
      volleyballGame.sets = updatedSets;
      
      const newFormData = { ...formData, game: volleyballGame };
      setFormData(newFormData as unknown as SportsActivity<Sport>);

      showNotification("Points updated");
    } catch (error) {
      console.error("Error updating points:", error);
      showNotification("Failed to update points", "error");
    }
  }, [formData, game, teams, setFormData, showNotification]);

  // Add points to a team in a set
  const addPoints = useCallback((setIndex: number, teamId: string) => {
    if (!isVolleyballFormat(game) || !game.sets) return;
    
    const set = game.sets[setIndex];
    if (!set) return;
    
    const currentPoints = set.points.find(p => p.teamId === teamId)?.points || 0;
    updatePoints(setIndex, teamId, currentPoints + 1);
  }, [game, updatePoints]);

  // Remove points from a team in a set
  const removePoints = useCallback((setIndex: number, teamId: string) => {
    if (!isVolleyballFormat(game) || !game.sets) return;
    
    const set = game.sets[setIndex];
    if (!set) return;
    
    const currentPoints = set.points.find(p => p.teamId === teamId)?.points || 0;
    if (currentPoints > 0) {
      updatePoints(setIndex, teamId, currentPoints - 1);
    }
  }, [game, updatePoints]);

  // Add a new set - fixed to ensure it works
  const addSet = useCallback(() => {
    console.log("Add set button clicked");
    try {
      // Initialize if necessary
      if (!isVolleyballFormat(game)) {
        console.log("Game is not in volleyball format, initializing");
        initializeVolleyballGame();
        return;
      }
      
      // Ensure game.sets is an array
      const currentSets = Array.isArray(game.sets) ? game.sets : [];
      console.log("Current sets:", currentSets);
      
      const updatedSets = [...currentSets];
      updatedSets.push({ 
        points: teams.map(team => ({ teamId: team.id, points: 0 })) 
      });
      console.log("Updated sets:", updatedSets);

      // Create a volleyball model with the updated sets
      const volleyballGame = new VolleyballModel();
      volleyballGame.sets = updatedSets;
      
      console.log("Setting form data with updated sets");
      setFormData({ ...formData, game: volleyballGame } as unknown as SportsActivity<Sport>);

      // Expand the newly added set
      const newSetIndex = updatedSets.length - 1;
      setExpanded(`set-${newSetIndex}`);
      showNotification("New set added");
    } catch (error) {
      console.error("Error adding set:", error);
      showNotification("Failed to add set", "error");
    }
  }, [formData, game, teams, setFormData, showNotification, initializeVolleyballGame, setExpanded]);

  // Delete a set
  const deleteSet = useCallback((setIndex: number) => {
    try {
      if (!isVolleyballFormat(game)) return;
      
      const updatedSets = [...(game.sets || [])];
      updatedSets.splice(setIndex, 1);

      // Create a volleyball model with the updated sets
      const volleyballGame = new VolleyballModel();
      volleyballGame.sets = updatedSets;
      
      setFormData({ ...formData, game: volleyballGame } as unknown as SportsActivity<Sport>);

      // Update expanded state if needed
      if (expanded === `set-${setIndex}`) {
        setExpanded(updatedSets.length > 0 ? `set-0` : false);
      }
      
      showNotification("Set deleted");
    } catch (error) {
      console.error("Error deleting set:", error);
      showNotification("Failed to delete set", "error");
    }
  }, [formData, game, setFormData, expanded, showNotification]);

  // Get team's total points across all sets
  const getTeamTotalPoints = useCallback((teamId: string) => {
    if (!isVolleyballFormat(game) || !game.sets) return 0;
    
    return game.sets.reduce((total, set) => {
      const teamPoints = set.points.find(p => p.teamId === teamId)?.points || 0;
      return total + teamPoints;
    }, 0);
  }, [game]);

  // Get set score for a specific team
  const getSetScore = useCallback((teamId: string) => {
    if (!isVolleyballFormat(game) || !game.sets) return 0;
    
    return game.sets.reduce((wins, set) => {
      const teamPoints = set.points.find(p => p.teamId === teamId)?.points || 0;
      const maxPoints = set.points.length > 0 ? Math.max(...set.points.map(p => p.points), 0) : 0;
      return wins + (teamPoints === maxPoints && teamPoints > 0 ? 1 : 0);
    }, 0);
  }, [game]);

  if (teams.length < 2) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            At least two teams are required to set up the volleyball match.
          </Typography>
        </Box>
      </Paper>
    );
  }

  // If game data is not in volleyball format and not yet converted, show loading
  if (!isVolleyballFormat(game) && !isLegacyFormat(game)) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Initializing volleyball match data...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
          <SportsVolleyballIcon sx={{ mr: 1 }} /> Volleyball Match
        </Typography>
        <Divider sx={{ mt: 1 }} />
      </Box>

      {/* Match Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {teams.map((team) => {
          const setsWon = getSetScore(team.id);
          const totalPoints = getTeamTotalPoints(team.id);

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
                    <Box sx={{ display: 'flex', alignItems: 'center', pr: 2 }}>
                      <Typography variant="h4" fontWeight="bold">
                        {setsWon}
                      </Typography>
                      <Box sx={{ ml: 2, textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">Total Points</Typography>
                        <Typography variant="body1" fontWeight="bold">{totalPoints}</Typography>
                      </Box>
                    </Box>
                  }
                />
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Sets as Accordions */}
      {isVolleyballFormat(game) && game.sets && game.sets.map((set, index) => (
        <Accordion 
          key={`set-${index}`}
          expanded={expanded === `set-${index}`}
          onChange={handleAccordionChange(`set-${index}`)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ backgroundColor: 'background.default' }}
          >
            <Typography variant="h6">Set {index + 1}</Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 3, mr: 2 }}>
              {teams.map(team => {
                const points = set.points.find(p => p.teamId === team.id)?.points || 0;
                return (
                  <Box key={team.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">{team.name?.split(' ')[0] || 'Team'}:</Typography>
                    <Typography variant="body1" fontWeight="bold">{points}</Typography>
                  </Box>
                );
              })}
              
              {/* Subtle delete button */}
              <IconButton 
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent accordion from toggling
                  deleteSet(index);
                }}
                sx={{ 
                  opacity: 0.6, 
                  ml: 1,
                  '&:hover': { 
                    opacity: 1, 
                    color: 'error.main' 
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                </svg>
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {teams.map((team) => {
                const teamPoints = set.points.find(p => p.teamId === team.id)?.points || 0;
                return (
                  <Grid item xs={12} sm={6} key={team.id}>
                    <Card variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        py: 1,
                        '&:last-child': { pb: 1 }
                      }}>
                        <Typography variant="body1">{team.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={() => removePoints(index, team.id)}
                            disabled={teamPoints <= 0}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography variant="h6" sx={{ minWidth: 30, textAlign: 'center' }}>{teamPoints}</Typography>
                          <IconButton 
                            size="small"
                            color="success"
                            onClick={() => addPoints(index, team.id)}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Add New Set Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          onClick={addSet}
        >
          Add Set
        </Button>
      </Box>

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

// Add named export for backwards compatibility
export const VolleyballForm = Volleyball;
export default Volleyball;
