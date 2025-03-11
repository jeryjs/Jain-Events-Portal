import { SportsActivity } from '@common/models';
import { Athletics, Sport } from '@common/models/sports/SportsActivity';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemText,
    Paper,
    Slider,
    Tab,
    Tabs,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

interface AthleticsFormProps {
    formData: SportsActivity<Sport>;
    setFormData: (data: SportsActivity<Sport>) => void;
}

export const AthleticsForm = ({ formData, setFormData }: AthleticsFormProps) => {
    const theme = useTheme();
    const game = useMemo(() => (formData.game as Athletics || new Athletics()), [formData.game]);
    const teams = useMemo(() => formData.teams || [], [formData.teams]);
    const players = useMemo(() => formData.participants || [], [formData.participants]);

    const [activeTab, setActiveTab] = useState(0);
    const [topPlayersCount, setTopPlayersCount] = useState(5);

    // Use a ref to track initialization status
    const initializedRef = useRef(false);

    // Update game data in the parent form
    const updateGameData = useCallback((updatedGame: Partial<Athletics>) => {
        setFormData(({ ...formData, game: { ...game, ...updatedGame } } as SportsActivity<Sport>));
    }, [setFormData]);

    // Initialize heats only once when component mounts or when teams/players change significantly
    useEffect(() => {
        // Skip if already initialized or if no teams
        if (initializedRef.current || teams.length === 0) return;

        // Check if initialization is needed
        const needsInit = !game.heats || game.heats.length === 0;
        const needsUpdate = game.heats && game.heats.length > 0 &&
            (game.heats.length !== teams.length ||
                teams.some(team => !game.heats.find(h => h.heatId === team.id)));

        if (needsInit || needsUpdate) {
            console.log("Initializing athletics heats");
            const initialHeats = teams.map(team => {
                // Find existing heat for this team
                const existingHeat = game.heats?.find(h => h.heatId === team.id);

                // Get athletes for this team
                const teamPlayers = players.filter(p => p.teamId === team.id);

                return {
                    heatId: team.id,
                    athletes: teamPlayers.map(player => {
                        // Preserve existing athlete data if available
                        const existingAthlete = existingHeat?.athletes?.find(a => a.playerId === player.usn);
                        return existingAthlete || {
                            playerId: player.usn,
                            time: 0,
                            rank: 0
                        };
                    })
                };
            });

            updateGameData({ heats: initialHeats });
            initializedRef.current = true;
        }
    }, [teams, players, game.heats, updateGameData]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style={{ marginRight: '8px' }}><path fill="currentColor" d="M14.83 12c-2.69 0-4.83 2.14-4.83 4.83s2.14 4.83 4.83 4.83 4.83-2.14 4.83-4.83-2.14-4.83-4.83-4.83zm-8.66 0c-2.69 0-4.83 2.14-4.83 4.83S3.48 21.66 6.17 21.66 11 19.52 11 16.83 8.86 12 6.17 12zM19 9.83c0-1.77-1.43-3.2-3.2-3.2s-3.2 1.43-3.2 3.2 1.43 3.2 3.2 3.2 3.2-1.43 3.2-3.2zM6.17 8.34C4.4 8.34 3 6.94 3 5.17S4.4 2 6.17 2 9.34 3.4 9.34 5.17 7.94 8.34 6.17 8.34zM12 1.5q3.04 0 5.2 2.16L12 8.83 6.8 3.67Q8.96 1.5 12 1.5Zm0 20.5q-3.04 0-5.2-2.16l5.2-5.16 5.2 5.16Q15.04 22 12 22Zm10-6.67q-1.77 0-3.2-1.43-1.43-1.43-1.43-3.2 0-1.77 1.43-3.2 3.2-3.2 1.77 1.43 3.2 3.2 1.43 1.43 1.43 3.2 0 1.77-1.43 3.2-3.2 3.2Zm-1.17-1.49q.69-.84.69-1.87 0-1.03-.69-1.87-1.41-1.15-3.28-1.15-1.87 0-3.28 1.15-.69.84-.69 1.87 0 1.03.69 1.87 1.41 1.15 3.28 1.15 1.87 0 3.28-1.15Z"></path></svg>
                    Athletics Event
                </Typography>
                <Divider sx={{ mt: 1 }} />
            </Box>

            <Tabs value={activeTab} onChange={handleTabChange} aria-label="athletics-tabs">
                <Tab label="Manage Heats" />
                <Tab label="Export" />
            </Tabs>

            {activeTab === 0 && (
                <Box mt={3}>
                    {teams.map((team) => (
                        <HeatManager
                            key={team.id}
                            team={team}
                            game={game}
                            players={players.filter(p => p.teamId === team.id)} // Pre-filter players for each team
                            updateGameData={updateGameData}
                        />
                    ))}
                </Box>
            )}

            {activeTab === 1 && (
                <ExportTab
                    game={game}
                    players={players}
                    topPlayersCount={topPlayersCount}
                    setTopPlayersCount={setTopPlayersCount}
                />
            )}
        </Paper>
    );
};

// Heat Manager Component Props
interface HeatManagerProps {
    team: { id: string; name: string };
    game: Athletics;
    players: any[]; // Replace 'any' with the actual type of players
    updateGameData: (updatedGame: Partial<Athletics>) => void;
}

// Heat Manager Component - Memoized to prevent unnecessary re-renders
const HeatManager = React.memo<HeatManagerProps>(({ team, game, players, updateGameData }) => {
    const theme = useTheme();
    const heat = useMemo(() =>
        game.heats?.find(h => h.heatId === team.id) ||
        { heatId: team.id, athletes: [] },
        [game.heats, team.id]);

    const [expanded, setExpanded] = useState(false);

    const handleChange = () => {
        setExpanded(!expanded);
    };

    //Update athlete time
    const updateAthleteTime = useCallback((playerId: string, time: number) => {
        const updatedHeats = [...(game.heats || [])];
        const heatIndex = updatedHeats.findIndex(h => h.heatId === team.id);

        if (heatIndex === -1) return;

        const athleteIndex = updatedHeats[heatIndex].athletes.findIndex(a => a.playerId === playerId);
        if (athleteIndex === -1) return;

        // Create a new array with the updated athlete
        const updatedAthletes = [...updatedHeats[heatIndex].athletes];
        updatedAthletes[athleteIndex] = {
            ...updatedAthletes[athleteIndex],
            time
        };

        // Auto-assign ranks based on time
        const sortedAthletes = [...updatedAthletes]
            .filter(a => a.time > 0)
            .sort((a, b) => (a.time || Infinity) - (b.time || Infinity));

        sortedAthletes.forEach((athlete, index) => {
            const athleteIdx = updatedAthletes.findIndex(a => a.playerId === athlete.playerId);
            if (athleteIdx !== -1) {
                updatedAthletes[athleteIdx] = {
                    ...updatedAthletes[athleteIdx],
                    rank: index + 1
                };
            }
        });

        // Athletes with time=0 get rank=0
        updatedAthletes.forEach((athlete, idx) => {
            if (athlete.time === 0) {
                updatedAthletes[idx] = {
                    ...athlete,
                    rank: 0
                };
            }
        });

        updatedHeats[heatIndex] = {
            ...updatedHeats[heatIndex],
            athletes: updatedAthletes
        };

        updateGameData({ heats: updatedHeats });
    }, [team.id, updateGameData]);

    //Update athlete rank
    const updateAthleteRank = useCallback((playerId: string, rank: number) => {
        {
            const updatedHeats = [...(game.heats || [])];
            const heatIndex = updatedHeats.findIndex(h => h.heatId === team.id);

            if (heatIndex === -1) return;
            
            const athleteIndex = updatedHeats[heatIndex].athletes.findIndex(a => a.playerId === playerId);
            if (athleteIndex === -1) return;
            
            // Create a new array with the updated athlete
            const updatedAthletes = [...updatedHeats[heatIndex].athletes];
            updatedAthletes[athleteIndex] = {
                ...updatedAthletes[athleteIndex],
                rank
            };
            
            updatedHeats[heatIndex] = {
                ...updatedHeats[heatIndex],
                athletes: updatedAthletes
            };
            
            updateGameData({ heats: updatedHeats });
        }
    }, [team.id, updateGameData]);

    return (
        <Accordion expanded={expanded} onChange={handleChange}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">{team.name} Heat</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <List dense>
                    {players.map((player) => {
                        const athlete = heat.athletes?.find(a => a.playerId === player.usn) || { playerId: player.usn, time: 0, rank: 0 };

                        return (
                            <AthleteListItem
                                key={player.usn}
                                player={player}
                                athlete={athlete}
                                updateAthleteTime={updateAthleteTime}
                                updateAthleteRank={updateAthleteRank}
                            />
                        );
                    })}
                    {players.length === 0 && (
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                            No athletes in this heat
                        </Typography>
                    )}
                </List>
            </AccordionDetails>
        </Accordion>
    );
}, (prevProps: HeatManagerProps, nextProps: HeatManagerProps) => {
    // Custom comparison function to avoid unnecessary re-renders
    return (
        prevProps.team.id === nextProps.team.id &&
        prevProps.game.heats === nextProps.game.heats &&
        prevProps.players.length === nextProps.players.length
    );
});

// Athlete List Item Component Props
interface AthleteListItemProps {
    player: any; // Replace 'any' with the actual type of player
    athlete: { playerId: string; time: number; rank: number };
    updateAthleteTime: (playerId: string, time: number) => void;
    updateAthleteRank: (playerId: string, rank: number) => void;
}

// Athlete List Item Component - Memoized to prevent unnecessary re-renders
const AthleteListItem = React.memo<AthleteListItemProps>(({ player, athlete, updateAthleteTime, updateAthleteRank }) => {
    const handleTimeChange = useCallback((e: any) => {
        const value = Number(e.target.value);
        updateAthleteTime(player.usn, value);
    }, [player.usn, updateAthleteTime]);

    const handleRankChange = useCallback((e: any) => {
        const value = Number(e.target.value);
        updateAthleteRank(player.usn, value);
    }, [player.usn, updateAthleteRank]);

    return (
        <ListItem>
            <ListItemText primary={player.name} />
            <TextField
                label="Time"
                type="number"
                size="small"
                value={athlete.time || 0}
                onChange={handleTimeChange}
                sx={{ width: 100, mr: 2 }}
                inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
                label="Rank"
                type="number"
                size="small"
                value={athlete.rank || 0}
                onChange={handleRankChange}
                sx={{ width: 80 }}
                inputProps={{ min: 0, step: 1 }}
            />
        </ListItem>
    );
}, (prevProps: AthleteListItemProps, nextProps: AthleteListItemProps) => {
    // Custom comparison function to avoid unnecessary re-renders
    return (
        prevProps.player.usn === nextProps.player.usn &&
        prevProps.athlete.time === nextProps.athlete.time &&
        prevProps.athlete.rank === nextProps.athlete.rank
    );
});

// Export Tab Component Props
interface ExportTabProps {
    game: Athletics;
    players: any[]; // Replace 'any' with the actual type of players
    topPlayersCount: number;
    setTopPlayersCount: React.Dispatch<React.SetStateAction<number>>;
}

// Export Tab Component - Memoized
const ExportTab = React.memo<ExportTabProps>(({ game, players, topPlayersCount, setTopPlayersCount }) => {
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    // Generate JSON for top players - memoized calculation
    const topPlayersJson = useMemo(() => {
        const allAthletes = game.heats?.flatMap(heat =>
            heat.athletes
                .filter(athlete => athlete.time !== undefined && athlete.time > 0)
                .map(athlete => ({
                    ...athlete,
                    heatId: heat.heatId
                }))
        ) || [];

        const sortedAthletes = [...allAthletes]
            .sort((a, b) => (a.time || Infinity) - (b.time || Infinity))
            .slice(0, topPlayersCount);

        const topPlayers = sortedAthletes.map(athlete => {
            const player = players.find(p => p.usn === athlete.playerId);
            return {
                name: player?.name || 'Unknown',
                usn: athlete.playerId,
                teamId: player?.teamId || '',
                time: athlete.time,
                rank: athlete.rank
            };
        });

        return JSON.stringify(topPlayers, null, 2);
    }, [game.heats, players, topPlayersCount]);

    // Handle copy to clipboard
    const handleCopyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(topPlayersJson);
        setExportDialogOpen(false);
    }, [topPlayersJson]);

    return (
        <Box mt={3} display="flex" flexDirection="column" alignItems="center">
            <Typography>Select top performers to export:</Typography>
            <Box display="flex" alignItems="center" mt={2}>
                <Slider
                    value={topPlayersCount}
                    onChange={(e, newValue) => setTopPlayersCount(newValue as number)}
                    min={1}
                    max={10}
                    valueLabelDisplay="auto"
                    aria-labelledby="continuous-slider"
                    sx={{ width: 200, mr: 2 }}
                />
                <Button
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => setExportDialogOpen(true)}
                >
                    Generate JSON
                </Button>
            </Box>

            <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
                <DialogTitle>Top Athletes JSON</DialogTitle>
                <DialogContent>
                    <TextField
                        multiline
                        rows={5}
                        value={topPlayersJson}
                        fullWidth
                        slotProps={{ input: { readOnly: true } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExportDialogOpen(false)}>Close</Button>
                    <Button onClick={handleCopyToClipboard} variant="contained">Copy to Clipboard</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
});

// Add React import at the top for memo
import React from 'react';

export default AthleticsForm;