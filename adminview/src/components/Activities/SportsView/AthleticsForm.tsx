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
        setFormData(prevData => ({
            ...prevData,
            game: {
                ...prevData.game,
                ...updatedGame
            }
        } as SportsActivity<Sport>));
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
                    });

                return {
                    heatId: team.id,
                    athletes: updatedAthletes
                };
            });
            updateGameData({ heats: updatedHeats });
        }
    }, [teams, players, game, updateGameData]);

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
                            players={players}
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
                    updateGameData={updateGameData}
                />
            )}
        </Paper>
    );
};

// Heat Manager Component
const HeatManager = ({ team, game, players, updateGameData }) => {
    const theme = useTheme();
    const heat = useMemo(() => game.heats?.find(h => h.heatId === team.id) || { heatId: team.id, athletes: [] }, [game.heats, team.id]);
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

        updatedHeats[heatIndex].athletes[athleteIndex].time = time;

        // Auto-assign ranks based on time
        const sortedAthletes = [...updatedHeats[heatIndex].athletes].sort((a, b) => (a.time || Infinity) - (b.time || Infinity));
        sortedAthletes.forEach((athlete, index) => {
            athlete.rank = (athlete.time && athlete.time > 0) ? index + 1 : 0;
        });

        updateGameData({ heats: updatedHeats });
    }, [game, team.id, updateGameData]);

    //Update athlete rank
    const updateAthleteRank = useCallback((playerId: string, rank: number) => {
        const updatedHeats = [...(game.heats || [])];
        const heatIndex = updatedHeats.findIndex(h => h.heatId === team.id);

        if (heatIndex === -1) return;

        const athleteIndex = updatedHeats[heatIndex].athletes.findIndex(a => a.playerId === playerId);

        if (athleteIndex === -1) return;

        updatedHeats[heatIndex].athletes[athleteIndex].rank = rank;
        updateGameData({ heats: updatedHeats });
    }, [game, team.id, updateGameData]);

    return (
        <Accordion expanded={expanded} onChange={handleChange}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">{team.name} Heat</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <List dense>
                    {heat.athletes.map((athlete: any) => {
                        const player = players.find((p: any) => p.usn === athlete.playerId);
                        return (
                            <ListItem key={athlete.playerId}>
                                <ListItemText primary={player?.name || 'Unknown'} />
                                <TextField
                                    label="Time"
                                    type="number"
                                    size="small"
                                    value={athlete.time || 0}
                                    onChange={(e) => updateAthleteTime(athlete.playerId, Number(e.target.value))}
                                />
                                <TextField
                                    label="Rank"
                                    type="number"
                                    size="small"
                                    value={athlete.rank || 0}
                                    onChange={(e) => updateAthleteRank(athlete.playerId, Number(e.target.value))}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </AccordionDetails>
        </Accordion>
    );
};

// Export Tab Component
const ExportTab = ({ game, players, topPlayersCount, setTopPlayersCount, updateGameData }) => {
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    // Generate JSON for top players
    const generateTopPlayersJson = useCallback(() => {
        const allAthletes = game.heats.flatMap(heat => heat.athletes);
        const topPlayers = allAthletes.slice(0, topPlayersCount).map(athlete => {
            const player = players.find(p => p.usn === athlete.playerId);
            return {
                name: player?.name || 'Unknown',
                usn: athlete.playerId,
                teamId: player?.teamId || ''
            };
        });

        return JSON.stringify(topPlayers, null, 2);
    }, [game, players, topPlayersCount]);

    // Handle copy to clipboard
    const handleCopyToClipboard = () => {
        const json = generateTopPlayersJson();
        navigator.clipboard.writeText(json);
        setExportDialogOpen(false);
    };

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
                        value={generateTopPlayersJson()}
                        fullWidth
                        InputProps={{ readOnly: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExportDialogOpen(false)}>Close</Button>
                    <Button onClick={handleCopyToClipboard} variant="contained">Copy to Clipboard</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AthleticsForm;