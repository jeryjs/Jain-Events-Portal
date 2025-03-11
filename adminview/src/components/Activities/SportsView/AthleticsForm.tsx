import { SportsActivity, SportsPlayer } from '@common/models';
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
import React from 'react';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

interface AthleticsFormProps {
    formData: SportsActivity<Sport>;
    setFormData: (data: SportsActivity<Sport>) => void;
}

export const AthleticsForm = ({ formData, setFormData }: AthleticsFormProps) => {
    const theme = useTheme();

    const [activeTab, setActiveTab] = useState(0);
    const [topPlayersCount, setTopPlayersCount] = useState(5);

    // Initialize Heats
    useEffect(() => {
        const game = formData.game as Athletics;
        const teamIds = new Set(formData.teams?.map(team => team.id));
        const currentHeats = game?.heats || [];

        // Remove heats with heatId not in teamIds
        let newHeats = currentHeats.filter(heat => teamIds.has(heat.heatId));

        // Add heats for teams missing in newHeats
        formData.teams?.forEach(team => {
            if (!newHeats.find(heat => heat.heatId === team.id)) {
                newHeats.push({ heatId: team.id, athletes: [] });
            }
        });

        // Update heats in game data
        updateGameData({ heats: newHeats });
    }, [formData.teams]);
    
    const updateGameData = (gameData: Partial<Athletics>) => {
        setFormData({ ...formData, game: { ...formData.game, ...gameData } } as SportsActivity<Athletics>)
    }

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
                    {formData.teams?.map((team) => (
                        <HeatManager
                            key={team.id}
                            team={team}
                            game={formData.game as Athletics}
                            players={formData.participants.filter(p => p.teamId == team.id)}
                            updateGameData={updateGameData}
                        />
                    ))}
                </Box>
            )}

            {activeTab === 1 && (
                <ExportTab
                    game={formData.game as Athletics}
                    players={formData.participants}
                    topPlayersCount={topPlayersCount}
                    setTopPlayersCount={setTopPlayersCount}
                />
            )}
        </Paper>
    );
};

// Heat Manager Component Props
interface HeatManagerProps {
    team: Record<string, any>;
    game: Athletics;
    players: SportsPlayer[];
    updateGameData: (updatedGame: Partial<Athletics>) => void;
}

// Heat Manager Accordion - Memoized to prevent unnecessary re-renders
const HeatManager = React.memo<HeatManagerProps>(({ team, game, players, updateGameData }) => {
    const [expanded, setExpanded] = useState(false);
    let heat = game.heats?.find(h => h.heatId === team.id);
    if (!heat) {
        heat = { heatId: team.id, athletes: [] };
        updateGameData({ heats: [...(game.heats || []), heat] });
    }

    // Merged update function for both athlete time and rank
    const updateAthlete = (playerId: string, updates: { time?: number; rank?: number }) => {
        const heatIndex = game.heats?.findIndex(h => h.heatId === heat.heatId);

        const updatedHeat = { ...heat };
        const idx = updatedHeat.athletes.findIndex(a => a.playerId === playerId);
        const newAthlete =
            idx === -1
                ? { playerId, time: updates.time ?? 0, rank: updates.rank ?? 0 }
                : { ...updatedHeat.athletes[idx], ...updates };

        if (idx === -1) {
            updatedHeat.athletes.push(newAthlete);
        } else {
            updatedHeat.athletes[idx] = newAthlete;
        }

        // If the updated athlete's time is not 0, auto update all ranks
        if (newAthlete.time !== 0) {
            const athletesWithTime = updatedHeat.athletes.filter(a => a.time !== 0);
            athletesWithTime.sort((a, b) => a.time - b.time);
            athletesWithTime.forEach((athlete, index) => {
                const i = updatedHeat.athletes.findIndex(a => a.playerId === athlete.playerId);
                updatedHeat.athletes[i] = { ...updatedHeat.athletes[i], rank: index + 1 };
            });
        }
        
        updateGameData({ heats: game.heats?.map((h, i) => i === heatIndex ? updatedHeat : h) });
    };

    return (
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">
                    {team.name}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <List dense>
                    {players.map((player) => {
                        const athlete =
                            heat.athletes?.find(a => a.playerId === player.usn) ||
                            { playerId: player.usn, time: 0, rank: 0 };

                        return (
                            <AthleteListItem
                                key={player.usn}
                                player={player}
                                athlete={athlete}
                                updateAthleteTime={(playerId, time) => updateAthlete(playerId, { time })}
                                updateAthleteRank={(playerId, rank) => updateAthlete(playerId, { rank })}
                            />
                        );
                    })}
                    {players.length === 0 && (
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            align="center"
                            sx={{ py: 2 }}
                        >
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
                inputProps={{ min: 0, step: 0.1 }}
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

export default AthleticsForm;