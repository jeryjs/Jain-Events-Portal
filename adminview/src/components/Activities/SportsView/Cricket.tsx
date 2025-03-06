import { useCallback, useMemo, useState, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsBatIcon from '@mui/icons-material/SportsCricket';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Card, CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List, ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Popover,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';

import { SportsActivity } from '@common/models';
import { Cricket, Sport } from '@common/models/sports/SportsActivity';

// Ball type options for cricket
const BALL_TYPES = [
  { value: "0", label: "Normal", extraRuns: 0, color: "#e0e0e0" },
  { value: "4", label: "Four", extraRuns: 4, color: "#2196f3" },
  { value: "6", label: "Six", extraRuns: 6, color: "#9c27b0" },
  { value: "W", label: "Wicket", extraRuns: 0, color: "#f44336" },
  { value: "WD", label: "Wide", extraRuns: 1, color: "#ff9800" },
  { value: "NB", label: "No Ball", extraRuns: 1, color: "#ff9800" },
  { value: "B", label: "Bye", extraRuns: 0, color: "#4caf50" },
  { value: "LB", label: "Leg Bye", extraRuns: 0, color: "#4caf50" },
  { value: "D", label: "Dot", extraRuns: 0, color: "#e0e0e0" }
];

// Types for props
interface CricketFormProps {
  formData: SportsActivity<Sport>;
  setFormData: (data: SportsActivity<Sport>) => void;
}

// Ball interface for type safety
interface Ball {
  batsmanId: string;
  runs: number;
  extraRuns: number;
  type: string;
}

// Main component
export const CricketForm = ({ formData, setFormData }: CricketFormProps) => {
  const game = useMemo(() => (formData.game as Cricket || new Cricket()), [formData.game]);
  const teams = formData.teams || [];

  // Use a ref to track initialization status
  const initializationAttemptedRef = useRef(false);

  // Update game data in the parent form
  const updateGameData = useCallback((updatedGame: Partial<Cricket>) => {
    setFormData({
      ...formData,
      game: {
        ...game,
        ...updatedGame
      },
    } as SportsActivity<Sport>);
  }, [formData, game, setFormData]);

  // Initialize game only once if needed
  if (teams.length >= 2 && !game.innings?.length && !initializationAttemptedRef.current) {
    // Mark initialization as attempted to prevent future attempts
    initializationAttemptedRef.current = true;

    // Default toss winner to first team
    const defaultTossWinner = {
      teamId: teams[0].id,
      choice: "bat" as const
    };

    // Update game data directly
    updateGameData({
      tossWinner: defaultTossWinner,
      innings: []
    });
  }

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Cricket Match Scoring</Typography>

      {/* Toss Section */}
      {teams.length >= 2 && (
        <TossSection
          teams={teams}
          game={game}
          updateGameData={updateGameData}
        />
      )}

      {/* Innings Section */}
      <InningsSection
        teams={teams}
        game={game}
        players={formData.participants || []}
        updateGameData={updateGameData}
      />
    </Paper>
  );
};

// Toss Section Component
const TossSection = ({ teams, game, updateGameData }) => {
  // Get toss winner and choice
  const tossWinner = game.tossWinner || { teamId: teams[0]?.id || '', choice: 'bat' as const };

  // Handle toss winner change
  const handleTossWinnerChange = (teamId: string) => {
    updateGameData({
      tossWinner: {
        ...tossWinner,
        teamId
      }
    });
  };

  // Handle toss choice change
  const handleTossChoiceChange = (choice: 'bat' | 'bowl') => {
    updateGameData({
      tossWinner: {
        ...tossWinner,
        choice
      }
    });
  };

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <SportsScoreIcon sx={{ mr: 1 }} /> Toss Information
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Toss Winner</InputLabel>
            <Select
              value={tossWinner.teamId || teams[0]?.id}
              onChange={(e) => handleTossWinnerChange(e.target.value)}
              label="Toss Winner"
            >
              {teams.map(team => (
                <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card
            variant="outlined"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: 2,
              borderRadius: 2,
              boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              chose to:
            </Typography>
            <ToggleButtonGroup
              value={tossWinner.choice || 'bat'}
              exclusive
              onChange={(e, value) => value && handleTossChoiceChange(value)}
              size="large"
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '8px !important',
                  padding: '8px 16px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  '&.Mui-selected': {
                    backgroundColor: '#4caf50',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#66bb6a',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="bat" sx={{ textTransform: 'capitalize' }}>
                <SportsBatIcon sx={{ mr: 1 }} />
                Bat
              </ToggleButton>
              <ToggleButton value="bowl" sx={{ textTransform: 'capitalize' }}>
                <SportsBaseballIcon sx={{ mr: 1 }} />
                Bowl
              </ToggleButton>
            </ToggleButtonGroup>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Innings Section Component
const InningsSection = ({ teams, game, players, updateGameData }) => {
  const [expandedInnings, setExpandedInnings] = useState<number | false>(false);

  // Get opposing team based on toss choice
  const getOpposingTeam = useCallback((teamId: string) => {
    return teams.find(t => t.id !== teamId)?.id || teams[0]?.id;
  }, [teams]);

  // Handle innings accordion expansion
  const handleAccordionChange = useCallback((panel: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedInnings(isExpanded ? panel : false);
  }, []);

  // Add a new innings
  const handleAddInnings = useCallback(() => {
    if (teams.length < 2 || !game.tossWinner) return;

    let battingTeamId, bowlingTeamId;

    if (!game.innings || game.innings.length === 0) {
      // First innings - based on toss winner's choice
      if (game.tossWinner.choice === 'bat') {
        battingTeamId = game.tossWinner.teamId;
        bowlingTeamId = getOpposingTeam(battingTeamId);
      } else {
        bowlingTeamId = game.tossWinner.teamId;
        battingTeamId = getOpposingTeam(bowlingTeamId);
      }
    } else {
      // Subsequent innings, reverse batting/bowling
      const lastInnings = game.innings[game.innings.length - 1];
      battingTeamId = lastInnings.bowlingTeam;
      bowlingTeamId = lastInnings.battingTeam;
    }

    // Ensure team IDs are valid
    if (!battingTeamId || !bowlingTeamId) return;

    const newInnings = {
      battingTeam: battingTeamId,
      bowlingTeam: bowlingTeamId,
      overs: []
    };

    const updatedInnings = [...(game.innings || []), newInnings];
    updateGameData({ innings: updatedInnings });

    // Auto-expand the newly created innings
    setTimeout(() => {
      setExpandedInnings(updatedInnings.length - 1);
    }, 100);
  }, [teams, game, getOpposingTeam, updateGameData]);

  // Handle deleting an innings
  const handleDeleteInnings = useCallback((event: React.MouseEvent<HTMLButtonElement>, inningsIndex: number) => {
    event.stopPropagation();

    const updatedInnings = [...(game.innings || [])];
    updatedInnings.splice(inningsIndex, 1);
    updateGameData({ innings: updatedInnings });

    if (expandedInnings === inningsIndex) {
      setExpandedInnings(false);
    } else if (typeof expandedInnings === 'number' && expandedInnings > inningsIndex) {
      setExpandedInnings(expandedInnings - 1);
    }
  }, [game.innings, expandedInnings, updateGameData]);

  // Get innings score
  const getInningsScore = useCallback((innings) => {
    if (!innings || !innings.overs) return { runs: 0, wickets: 0 };

    const runs = innings.overs.reduce((total, over) => {
      return total + over.balls.reduce((r, ball) => r + ball.runs + ball.extraRuns, 0);
    }, 0);

    const wickets = innings.overs.reduce((total, over) => {
      return total + over.balls.filter((ball) => ball.type === "W").length;
    }, 0);

    return { runs, wickets };
  }, []);

  return (
    <Box>
      {/* Innings Accordions */}
      {game.innings && game.innings.map((innings, inningsIndex) => {
        const score = getInningsScore(innings);

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
              <InningsSummary
                innings={innings}
                inningsIndex={inningsIndex}
                teams={teams}
                score={score}
                handleDeleteInnings={handleDeleteInnings}
              />
            </AccordionSummary>
            <AccordionDetails>
              <InningsDetails
                innings={innings}
                inningsIndex={inningsIndex}
                teams={teams}
                players={players}
                game={game}
                updateGameData={updateGameData}
              />
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
    </Box>
  );
};

// Innings Summary Component
const InningsSummary = ({ innings, inningsIndex, teams, score, handleDeleteInnings }) => {
  const battingTeam = teams.find(t => t.id === innings.battingTeam);

  return (
    <>
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
    </>
  );
};

// Innings Details Component
const InningsDetails = ({ innings, inningsIndex, teams, players, game, updateGameData }) => {
  const [selectedBatsman, setSelectedBatsman] = useState<string | null>(null);

  // Get players for a specific team - memoized
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

  const battingTeam = teams.find(t => t.id === innings.battingTeam);
  const bowlingTeam = teams.find(t => t.id === innings.bowlingTeam);

  return (
    <Grid container spacing={2}>
      {/* Batting team panel */}
      <Grid item xs={12} md={6}>
        <BatsmenPanel
          teamName={battingTeam?.name || 'Batting Team'}
          teamId={innings.battingTeam}
          teamPlayers={teamPlayersMap[innings.battingTeam] || []}
          inningsIndex={inningsIndex}
          game={game}
          selectedBatsman={selectedBatsman}
          setSelectedBatsman={setSelectedBatsman}
        />
      </Grid>

      {/* Bowling team panel */}
      <Grid item xs={12} md={6}>
        <BowlersPanel
          teamName={bowlingTeam?.name || 'Bowling Team'}
          teamId={innings.bowlingTeam}
          teamPlayers={teamPlayersMap[innings.bowlingTeam] || []}
          inningsIndex={inningsIndex}
          innings={innings}
          game={game}
          selectedBatsman={selectedBatsman}
          updateGameData={updateGameData}
        />
      </Grid>
    </Grid>
  );
};

// Batsmen Panel Component
const BatsmenPanel = ({ teamName, teamId, teamPlayers, inningsIndex, game, selectedBatsman, setSelectedBatsman }) => {
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

  return (
    <Card variant="outlined" sx={{
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      height: '100%'
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {teamName} Batsmen
        </Typography>
        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {teamPlayers.length > 0 ? (
            teamPlayers.map(player => {
              const batsmanRuns = getBatsmanRuns(inningsIndex, player.usn);
              const isSelected = selectedBatsman === player.usn;
              return (
                <ListItemButton
                  key={player.usn}
                  selected={isSelected}
                  onClick={() => setSelectedBatsman(isSelected ? null : player.usn)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      backgroundColor: 'secondary.light',
                      boxShadow: isSelected ? '0 0 0 1px #2196f3' : 'none',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      }
                    }
                  }}
                >
                  <ListItemText
                    primary={player.name}
                    secondary={`${batsmanRuns} runs`}
                    primaryTypographyProps={{
                      color: isSelected ? 'primary.dark' : 'inherit',
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}
                  />
                  {isSelected && (
                    <Chip
                      size="small"
                      label="Selected"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </ListItemButton>
              );
            })
          ) : (
            <Typography color="text.secondary">No players found for this team</Typography>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

// Bowlers Panel Component
const BowlersPanel = ({ teamName, teamId, teamPlayers, inningsIndex, innings, game, selectedBatsman, updateGameData }) => {
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);
  const [currentBowler, setCurrentBowler] = useState<string | null>(null);
  const [currentOverIndex, setCurrentOverIndex] = useState<number | null>(null);
  const [currentBallIndex, setCurrentBallIndex] = useState<number | null>(null);
  const [ballDetails, setBallDetails] = useState({ runs: 0, type: "0", extraRuns: 0 });

  // Handle ball popover open for new ball
  const handleBallPopoverOpen = useCallback((event: React.MouseEvent<HTMLElement>, bowlerId: string) => {
    if (!selectedBatsman) return;

    setCurrentBowler(bowlerId);
    setCurrentBallIndex(null);
    setCurrentOverIndex(null);
    setBallDetails({ runs: 0, type: "0", extraRuns: 0 });
    setPopoverAnchorEl(event.currentTarget);
  }, [selectedBatsman]);

  // Handle opening the ball dialog/popover for editing an existing ball
  const handleEditBall = useCallback((event: React.MouseEvent<HTMLElement>, overIndex: number, ballIndex: number, ball: Ball) => {
    event.stopPropagation();

    const over = innings.overs[overIndex];

    setCurrentBowler(over.bowlerId);
    setCurrentOverIndex(overIndex);
    setCurrentBallIndex(ballIndex);

    setBallDetails({
      runs: ball.runs || 0,
      type: ball.type || "0",
      extraRuns: ball.extraRuns || 0
    });

    setPopoverAnchorEl(event.currentTarget);
  }, [innings]);

  // Handle ball popover close
  const handlePopoverClose = useCallback(() => {
    setPopoverAnchorEl(null);
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

  // Handle save ball (add or edit)
  const handleSaveBall = useCallback(() => {
    if (!currentBowler || !selectedBatsman) {
      handlePopoverClose();
      return;
    }

    const updatedInnings = [...(game.innings || [])];
    if (!updatedInnings[inningsIndex]) {
      handlePopoverClose();
      return;
    }

    const inning = updatedInnings[inningsIndex];

    // Ensure overs array exists
    if (!inning.overs) {
      inning.overs = [];
    }

    // Editing existing ball
    if (currentOverIndex !== null && currentBallIndex !== null) {
      if (!inning.overs[currentOverIndex] || !inning.overs[currentOverIndex].balls[currentBallIndex]) {
        handlePopoverClose();
        return;
      }

      inning.overs[currentOverIndex].balls[currentBallIndex] = {
        batsmanId: selectedBatsman,
        runs: ballDetails.runs,
        extraRuns: ballDetails.extraRuns,
        type: ballDetails.type
      };
    }
    // Adding new ball
    else {
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
        type: ballDetails.type
      });
    }

    updateGameData({ innings: updatedInnings });
    handlePopoverClose();
  }, [inningsIndex, currentOverIndex, currentBallIndex, currentBowler, selectedBatsman, game.innings, ballDetails, updateGameData, handlePopoverClose]);

  // Handle delete ball
  const handleDeleteBall = useCallback(() => {
    if (currentOverIndex === null || currentBallIndex === null) {
      handlePopoverClose();
      return;
    }

    const updatedInnings = [...(game.innings || [])];
    if (!updatedInnings[inningsIndex] || !updatedInnings[inningsIndex].overs[currentOverIndex]) {
      handlePopoverClose();
      return;
    }

    // Remove the ball
    const over = updatedInnings[inningsIndex].overs[currentOverIndex];
    over.balls.splice(currentBallIndex, 1);

    // If the over is now empty, remove it
    if (over.balls.length === 0) {
      updatedInnings[inningsIndex].overs.splice(currentOverIndex, 1);
    }

    updateGameData({ innings: updatedInnings });
    handlePopoverClose();
  }, [inningsIndex, currentOverIndex, currentBallIndex, game.innings, updateGameData, handlePopoverClose]);

  // Calculate popover open state
  const isPopoverOpen = Boolean(popoverAnchorEl);

  return (
    <Card variant="outlined" sx={{
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      height: '100%'
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {teamName} Bowlers
        </Typography>
        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {teamPlayers.length > 0 ? (
            teamPlayers.map(bowler => {
              // Find over index for this bowler
              const overIndex = innings.overs?.findIndex(o => o.bowlerId === bowler.usn);
              const bowlerBalls = overIndex !== -1 && innings.overs ? innings.overs[overIndex]?.balls || [] : [];

              return (
                <ListItem
                  key={bowler.usn}
                  sx={{
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    py: 1
                  }}
                >
                  <ListItemText primary={bowler.name} />
                  <Stack direction="row" spacing={0.5} sx={{
                    minHeight: 40,
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    {/* Show existing balls */}
                    {bowlerBalls.map((ball: Ball, ballIndex: number) => {
                      const ballType = BALL_TYPES.find(b => b.value === ball.type);
                      const totalRuns = (ball.runs || 0) + (ball.extraRuns || 0);
                      // Check if this ball was hit by the selected batsman
                      const isSelectedBatsmanBall = selectedBatsman && ball.batsmanId === selectedBatsman;

                      return (
                        <Tooltip
                          key={ballIndex}
                          title={`${ballType?.label || 'Ball'} - ${totalRuns} runs`}
                        >
                          <Avatar
                            onClick={(e) => handleEditBall(e, overIndex || 0, ballIndex, ball)}
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: '0.8rem',
                              bgcolor: ballType?.color || '#e0e0e0',
                              color: ['W', '6', '4'].includes(ball.type) ? 'white' : 'black',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                              cursor: 'pointer',
                              border: isSelectedBatsmanBall ? '2px solid #1976d2' : 'none',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                              },
                              m: 0.2,
                              transition: 'all 0.2s'
                            }}
                          >
                            {ball.type === 'W' ? 'W' : totalRuns}
                          </Avatar>
                        </Tooltip>
                      );
                    })}

                    {/* Add ball button */}
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => handleBallPopoverOpen(e, bowler.usn)}
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

      {/* Ball Editor Popover */}
      <BallEditorPopover
        isOpen={isPopoverOpen}
        anchorEl={popoverAnchorEl}
        ballDetails={ballDetails}
        setBallDetails={setBallDetails}
        handleBallTypeChange={handleBallTypeChange}
        handleSaveBall={handleSaveBall}
        handleDeleteBall={handleDeleteBall}
        handlePopoverClose={handlePopoverClose}
        isEditing={currentBallIndex !== null}
      />
    </Card>
  );
};

// Ball Editor Popover Component
const BallEditorPopover = ({
  isOpen,
  anchorEl,
  ballDetails,
  setBallDetails,
  handleBallTypeChange,
  handleSaveBall,
  handleDeleteBall,
  handlePopoverClose,
  isEditing
}) => {
  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={handlePopoverClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <Box sx={{ p: 2, width: 250 }}>
        <Typography variant="subtitle1" gutterBottom>
          {isEditing ? 'Edit Ball' : 'Add Ball'}
        </Typography>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
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

        {ballDetails.type !== "W" && ballDetails.type !== "D" && (
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
            sx={{ mb: 2 }}
          />
        )}

        {ballDetails.extraRuns > 0 && (
          <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
            + {ballDetails.extraRuns} extra run{ballDetails.extraRuns > 1 ? 's' : ''}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button onClick={handlePopoverClose} size="small">Cancel</Button>
          {isEditing && (
            <IconButton
              onClick={handleDeleteBall}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
          <Button
            variant="contained"
            onClick={handleSaveBall}
            size="small"
            startIcon={<SportsBaseballIcon />}
          >
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}