import { useState, useMemo, useCallback } from 'react';
import { 
  Box, Paper, Typography, Button, Accordion, AccordionSummary, AccordionDetails, 
  FormControl, InputLabel, Select, MenuItem, Grid, Card, CardContent, 
  List, ListItem, ListItemText, ListItemButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Chip, IconButton, Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { SportsActivity } from '@common/models';
import { Cricket, Sport } from '@common/models/sports/SportsActivity';

// Ball type options for cricket
const BALL_TYPES = [
  { value: "0", label: "Normal", extraRuns: 0, color: "#e0e0e0" },
  { value: "4", label: "Four", extraRuns: 0, color: "#2196f3" },
  { value: "6", label: "Six", extraRuns: 0, color: "#9c27b0" },
  { value: "W", label: "Wicket", extraRuns: 0, color: "#f44336" },
  { value: "WD", label: "Wide", extraRuns: 1, color: "#ff9800" },
  { value: "NB", label: "No Ball", extraRuns: 1, color: "#ff9800" },
  { value: "B", label: "Bye", extraRuns: 0, color: "#4caf50" },
  { value: "LB", label: "Leg Bye", extraRuns: 0, color: "#4caf50" },
  { value: "D", label: "Dot", extraRuns: 0, color: "#e0e0e0" }
];

interface CricketFormProps {
  formData: SportsActivity<Sport>;
  setFormData: (data: SportsActivity<Sport>) => void;
}

export const CricketForm = ({ formData, setFormData }: CricketFormProps) => {
  // Ensure game is properly initialized
  const game = useMemo(() => (
    formData.game as Cricket || { innings: [] }
  ), [formData.game]);
  
  const teams = useMemo(() => formData.teams || [], [formData.teams]);
  const players = useMemo(() => formData.participants || [], [formData.participants]);
  
  const [expandedInnings, setExpandedInnings] = useState<number | false>(false);
  const [tossWinner, setTossWinner] = useState<string>(() => teams[0]?.id || '');
  const [battingFirst, setBattingFirst] = useState<string>(() => teams[0]?.id || '');
  const [selectedBatsman, setSelectedBatsman] = useState<string | null>(null);
  const [ballDialogOpen, setBallDialogOpen] = useState(false);
  const [currentBowler, setCurrentBowler] = useState<string | null>(null);
  const [currentInningsIndex, setCurrentInningsIndex] = useState<number | null>(null);
  const [ballDetails, setBallDetails] = useState({ runs: 0, type: "0", extraRuns: 0 });

  // Get players for a specific team - memoized to prevent excessive recalculations
  const getTeamPlayers = useCallback((teamId: string) => {
    if (!teamId) return [];
    return players.filter(p => p.teamId === teamId);
  }, [players]);

  // Memoized player lists for each team
  const teamPlayersMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    teams.forEach(team => {
      map[team.id] = getTeamPlayers(team.id);
    });
    return map;
  }, [teams, getTeamPlayers]);

  // Get opposing team ID - memoized
  const getOpposingTeam = useCallback((teamId: string) => {
    return teams.find(t => t.id !== teamId)?.id || teams[0]?.id;
  }, [teams]);

  // Handle innings accordion expansion
  const handleAccordionChange = useCallback((panel: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedInnings(isExpanded ? panel : false);
    setSelectedBatsman(null);
  }, []);

  // Update game data in the parent form
  const updateGameData = useCallback((updatedInnings: any[]) => {
    setFormData({
      ...formData,
      game: {
        ...game,
        innings: updatedInnings
      },
    } as SportsActivity<Sport>);
  }, [formData, game, setFormData]);

  // Add a new innings with corrected team IDs
  const handleAddInnings = useCallback(() => {
    if (teams.length < 2) return;
    
    let battingTeamId, bowlingTeamId;
    
    if (!game.innings || game.innings.length === 0) {
      // First innings
      battingTeamId = battingFirst || teams[0]?.id;
      bowlingTeamId = getOpposingTeam(battingTeamId);
    } else {
      // Subsequent innings, reverse batting/bowling
      const lastInnings = game.innings[game.innings.length - 1];
      battingTeamId = lastInnings.bowlingTeam;
      bowlingTeamId = lastInnings.battingTeam;
    }
    
    // Ensure team IDs are valid
    if (!battingTeamId || !bowlingTeamId) {
      console.error('Cannot add innings: Invalid team IDs');
      return;
    }
    
    const newInnings = {
      battingTeam: battingTeamId,
      bowlingTeam: bowlingTeamId,
      overs: []
    };
    
    const updatedInnings = [...(game.innings || []), newInnings];
    updateGameData(updatedInnings);
    
    // Auto-expand the newly created innings
    setTimeout(() => {
      setExpandedInnings(updatedInnings.length - 1);
    }, 100);
  }, [teams, game.innings, battingFirst, getOpposingTeam, updateGameData]);

  // Handle opening the ball dialog
  const handleBallDialogOpen = useCallback((inningsIndex: number, bowlerId: string) => {
    if (!selectedBatsman) return;
    
    setCurrentBowler(bowlerId);
    setCurrentInningsIndex(inningsIndex);
    setBallDetails({ runs: 0, type: "0", extraRuns: 0 });
    setBallDialogOpen(true);
  }, [selectedBatsman]);

  // Handle ball dialog close
  const handleBallDialogClose = useCallback(() => {
    setBallDialogOpen(false);
    setCurrentBowler(null);
    setCurrentInningsIndex(null);
  }, []);

  // Handle ball type change, auto-update extraRuns
  const handleBallTypeChange = useCallback((type: string) => {
    const ballType = BALL_TYPES.find(b => b.value === type);
    setBallDetails({
      ...ballDetails,
      type,
      extraRuns: ballType?.extraRuns || 0
    });
  }, [ballDetails]);

  // Handle adding a new ball
  const handleAddBall = useCallback(() => {
    if (currentInningsIndex === null || !currentBowler || !selectedBatsman) {
      handleBallDialogClose();
      return;
    }
    
    const updatedInnings = [...(game.innings || [])];
    if (!updatedInnings[currentInningsIndex]) {
      handleBallDialogClose();
      return;
    }
    
    const inning = updatedInnings[currentInningsIndex];
    
    // Ensure overs array exists
    if (!inning.overs) {
      inning.overs = [];
    }
    
    // Find or create over for the current bowler
    let overIndex = inning.overs.findIndex(o => o.bowlerId === currentBowler);
    if (overIndex === -1) {
      inning.overs.push({ bowlerId: currentBowler, balls: [] });
      overIndex = inning.overs.length - 1;
    }
    
    // Add ball to over
    inning.overs[overIndex].balls.push({
      batsmanId: selectedBatsman,
      runs: ballDetails.runs,
      extraRuns: ballDetails.extraRuns,
      type: ballDetails.type as any
    });
    
    updateGameData(updatedInnings);
    handleBallDialogClose();
  }, [currentInningsIndex, currentBowler, selectedBatsman, game.innings, ballDetails, updateGameData, handleBallDialogClose]);

  // Get the score for a specific innings - memoized
  const getInningsScore = useCallback((innings: any) => {
    if (!innings || !innings.overs) return { runs: 0, wickets: 0 };
    
    const runs = innings.overs.reduce((total: number, over: any) => {
      return total + over.balls.reduce((r: number, ball: any) => r + ball.runs + ball.extraRuns, 0);
    }, 0);
    
    const wickets = innings.overs.reduce((total: number, over: any) => {
      return total + over.balls.filter((ball: any) => ball.type === "W").length;
    }, 0);
    
    return { runs, wickets };
  }, []);

  // Memoized innings scores to prevent recalculation
  const inningsScores = useMemo(() => {
    if (!game.innings) return [];
    return game.innings.map(getInningsScore);
  }, [game.innings, getInningsScore]);

  // Get all balls for a bowler in a specific innings - memoized
  const getBowlerBalls = useCallback((inningsIndex: number, bowlerId: string) => {
    if (!game.innings || game.innings.length <= inningsIndex) return [];
    
    const innings = game.innings[inningsIndex];
    if (!innings.overs) return [];
    
    const over = innings.overs.find(o => o.bowlerId === bowlerId);
    return over ? over.balls : [];
  }, [game.innings]);

  // Get batsman runs in a specific innings - memoized
  const getBatsmanRuns = useCallback((inningsIndex: number, batsmanId: string) => {
    if (!game.innings || game.innings.length <= inningsIndex) return 0;
    
    const innings = game.innings[inningsIndex];
    if (!innings.overs) return 0;
    
    return innings.overs.reduce((total, over) => {
      return total + over.balls.reduce((runs, ball) => {
        if (ball.batsmanId === batsmanId) {
          return runs + ball.runs;
        }
        return runs;
      }, 0);
    }, 0);
  }, [game.innings]);

  // Handle deleting an innings
  const handleDeleteInnings = useCallback((event: React.MouseEvent<HTMLButtonElement>, inningsIndex: number) => {
    // Stop the event from propagating to the accordion
    event.stopPropagation();
    
    const updatedInnings = [...(game.innings || [])];
    updatedInnings.splice(inningsIndex, 1);
    updateGameData(updatedInnings);
    
    // If the deleted innings was expanded, collapse it
    if (expandedInnings === inningsIndex) {
      setExpandedInnings(false);
    } 
    // If a higher index was expanded, adjust it
    else if (typeof expandedInnings === 'number' && expandedInnings > inningsIndex) {
      setExpandedInnings(expandedInnings - 1);
    }
  }, [game.innings, expandedInnings, updateGameData]);

  // Initialize game on first load
  // NOTE: We don't do this in useEffect to avoid stale closure issues
  if (teams.length >= 2 && (!game.innings || game.innings.length === 0)) {
    // Initialize innings on first render if needed
    setTimeout(handleAddInnings, 0);
  }

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Cricket Match Scoring</Typography>
      
      {/* Toss selection */}
      {teams.length >= 2 && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Toss Winner</InputLabel>
                <Select
                  value={tossWinner}
                  onChange={(e) => {
                    setTossWinner(e.target.value);
                    setBattingFirst(e.target.value); // Auto-update batting first
                  }}
                  label="Toss Winner"
                >
                  {teams.map(team => (
                    <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Batting First</InputLabel>
                <Select
                  value={battingFirst}
                  onChange={(e) => setBattingFirst(e.target.value)}
                  label="Batting First"
                >
                  {teams.map(team => (
                    <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Innings Accordions */}
      {game.innings && game.innings.map((innings, inningsIndex) => {
        const battingTeam = teams.find(t => t.id === innings.battingTeam);
        const bowlingTeam = teams.find(t => t.id === innings.bowlingTeam);
        const score = inningsScores[inningsIndex] || { runs: 0, wickets: 0 };
        
        return (
          <Accordion 
            key={inningsIndex}
            expanded={expandedInnings === inningsIndex}
            onChange={handleAccordionChange(inningsIndex)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
            >
              <Typography fontWeight="bold" sx={{ flexGrow: 1 }}>
                Innings {inningsIndex + 1}: {battingTeam?.name || 'Unknown'} 
                <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                  {score.runs}/{score.wickets}
                </Typography>
              </Typography>
              <IconButton 
                size="small" 
                onClick={(e) => handleDeleteInnings(e, inningsIndex)} 
                sx={{ 
                  mr: 1, 
                  color: 'text.secondary',
                  '&:hover': { color: 'error.main' }
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* Batting team panel */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {battingTeam?.name || 'Batting Team'} Batsmen
                      </Typography>
                      <List dense>
                        {/* Use the memoized player list from map */}
                        {innings && innings.battingTeam && teamPlayersMap[innings.battingTeam] ? (
                          teamPlayersMap[innings.battingTeam].map(player => {
                            const batsmanRuns = getBatsmanRuns(inningsIndex, player.usn);
                            return (
                              <ListItemButton 
                                key={player.usn}
                                selected={selectedBatsman === player.usn}
                                onClick={() => setSelectedBatsman(player.usn)}
                                sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
                              >
                                <ListItemText 
                                  primary={player.name} 
                                  secondary={`${batsmanRuns} runs`}
                                  primaryTypographyProps={{
                                    color: selectedBatsman === player.usn ? 'primary' : 'inherit',
                                    fontWeight: selectedBatsman === player.usn ? 'bold' : 'normal'
                                  }}
                                />
                              </ListItemButton>
                            );
                          })
                        ) : (
                          <Typography color="text.secondary">No players found for this team</Typography>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Bowling team panel */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {bowlingTeam?.name || 'Bowling Team'} Bowlers
                      </Typography>
                      <List dense>
                        {/* Use the memoized player list from map */}
                        {innings && innings.bowlingTeam && teamPlayersMap[innings.bowlingTeam] ? (
                          teamPlayersMap[innings.bowlingTeam].map(bowler => {
                            const bowlerBalls = getBowlerBalls(inningsIndex, bowler.usn);
                            return (
                              <ListItem 
                                key={bowler.usn}
                                sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
                              >
                                <ListItemText primary={bowler.name} />
                                <Stack direction="row" spacing={0.5} sx={{ minHeight: 40, alignItems: 'center' }}>
                                  {/* Show existing balls */}
                                  {bowlerBalls.map((ball: any, idx: number) => {
                                    const ballType = BALL_TYPES.find(b => b.value === ball.type);
                                    return (
                                      <Chip 
                                        key={idx} 
                                        label={ball.runs}
                                        size="small"
                                        sx={{ 
                                          bgcolor: ballType?.color || '#e0e0e0',
                                          color: ['W', '6', '4'].includes(ball.type) ? 'white' : 'black',
                                          width: 32,
                                          height: 32
                                        }}
                                      />
                                    );
                                  })}
                                  
                                  {/* Add ball button */}
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleBallDialogOpen(inningsIndex, bowler.usn)}
                                    disabled={!selectedBatsman}
                                    sx={{ 
                                      width: 32, 
                                      height: 32,
                                      bgcolor: 'rgba(0,0,0,0.04)',
                                      '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.08)'
                                      }
                                    }}
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </ListItem>
                            );
                          })
                        ) : (
                          <Typography color="text.secondary">No players found for this team</Typography>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
      
      {/* Add Innings Button */}
      {teams.length >= 2 && (
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          onClick={handleAddInnings}
          disabled={teams.length < 2}
          sx={{ mt: 2 }}
        >
          Add Innings
        </Button>
      )}
      
      {/* Ball Dialog */}
      <Dialog open={ballDialogOpen} onClose={handleBallDialogClose}>
        <DialogTitle>Add Ball</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 300 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Ball Type</InputLabel>
                <Select
                  value={ballDetails.type}
                  onChange={(e) => handleBallTypeChange(e.target.value)}
                  label="Ball Type"
                >
                  {BALL_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {ballDetails.type !== "W" && ballDetails.type !== "D" && (
              <Grid item xs={12}>
                <TextField
                  label="Runs"
                  type="number"
                  fullWidth
                  size="small"
                  value={ballDetails.runs}
                  onChange={(e) => setBallDetails({
                    ...ballDetails,
                    runs: parseInt(e.target.value) || 0
                  })}
                  disabled={ballDetails.type === "4" || ballDetails.type === "6"}
                  InputProps={{ inputProps: { min: 0, max: 6 } }}
                />
              </Grid>
            )}
            
            {(ballDetails.type === "WD" || ballDetails.type === "NB") && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Extra run will be added automatically
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBallDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleAddBall}>Add</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};