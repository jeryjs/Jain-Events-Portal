import { useCallback, useMemo, useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';

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
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';

import { SportsActivity } from '@common/models';
import { Basketball, Sport } from '@common/models/sports/SportsActivity';

// Point types for quick selection
const POINT_TYPES = [
    { value: 1, label: "1 PT", icon: <LooksOneIcon />, color: "#8bc34a" },
    { value: 2, label: "2 PT", icon: <LooksTwoIcon />, color: "#2196f3" },
    { value: 3, label: "3 PT", icon: <Looks3Icon />, color: "#9c27b0" },
];

interface BasketballFormProps {
    formData: SportsActivity<Sport>;
    setFormData: (data: SportsActivity<Sport>) => void;
}

export const BasketballForm = ({ formData, setFormData }: BasketballFormProps) => {
    const theme = useTheme();
    const game = useMemo(() => (formData.game as Basketball || new Basketball()), [formData.game]);
    const teams = formData.teams || [];
    const players = formData.participants || [];

    const [hoveredPlayer, setHoveredPlayer] = useState<{ teamId: string, playerId: string } | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [editPoint, setEditPoint] = useState<{ pointIndex: number, teamIndex: number } | null>(null);
    const [editValue, setEditValue] = useState<number>(0);
    const [gameStatsInitialized, setGameStatsInitialized] = useState(false);

    // Initialize game stats if needed - optimized
    const initializeGameStats = useCallback(() => {
        if (!game.stats || game.stats.length === 0) {
            // Make sure we validate team IDs before creating stats
            const initialStats = teams.map(team => ({
                teamId: team.id || '', // Ensure teamId is never undefined
                points: [],
            }));

            // Validate that all teams have IDs
            if (initialStats.some(stat => !stat.teamId)) {
                console.error("Some teams are missing IDs:", teams);
                setNotification("Error: Some teams are missing IDs");
                return false;
            }

            setFormData({
                ...formData,
                game: {
                    ...game,
                    stats: initialStats
                },
            } as SportsActivity<Sport>);
            return true;
        } else {
            // Verify existing stats have valid team IDs
            const statsNeedFix = game.stats.some(stat => !stat.teamId);
            
            if (statsNeedFix) {
                // Fix existing stats by matching with teams array
                const fixedStats = game.stats.map((stat, idx) => {
                    if (!stat.teamId && teams[idx]) {
                        return { ...stat, teamId: teams[idx].id };
                    }
                    return stat;
                });
                
                setFormData({
                    ...formData,
                    game: {
                        ...game,
                        stats: fixedStats
                    },
                } as SportsActivity<Sport>);
                return true;
            }
            return false;
        }
    }, [formData, game, teams, setFormData, setNotification]);

    // Use effect hook instead of conditional rendering for initialization
    useEffect(() => {
        if (!gameStatsInitialized && teams.length >= 2) {
            const didInit = initializeGameStats();
            if (didInit) setGameStatsInitialized(true);
        }
    }, [teams, gameStatsInitialized, initializeGameStats]);

    // Clean up resources when component unmounts
    useEffect(() => {
        return () => {
            // Clean up any timers, etc.
            setNotification(null);
            setEditPoint(null);
        };
    }, []);

    // Get players for a specific team - memoized to prevent recalculations
    const getTeamPlayers = useCallback((teamId: string) => {
        return players.filter(p => p.teamId === teamId);
    }, [players]);

    // Get team totals for display - memoized
    const getTeamTotal = useCallback((teamId: string): number => {
        const stats = game.stats?.find(s => s.teamId === teamId);
        return stats?.points.reduce((sum, p) => sum + p.points, 0) || 0;
    }, [game.stats]);

    // Update game data
    const updateGameData = useCallback((stats: any[]) => {
        setFormData({
            ...formData,
            game: { ...game, stats }
        } as SportsActivity<Sport>);

        setNotification("Points updated");
        setTimeout(() => setNotification(null), 2000);
    }, [formData, game, setFormData]);

    // Add points to a player
    const addPoints = useCallback((teamId: string, playerId: string, points: number) => {
        // Safety check for empty teamId
        if (!teamId) {
            console.error("Attempted to add points with empty teamId");
            setNotification("Error: Invalid team selected");
            return;
        }

        const updatedStats = [...(game.stats || [])];
        let teamIndex = updatedStats.findIndex(stat => stat.teamId === teamId);

        // If team not found in stats, but exists in teams, add it
        if (teamIndex === -1) {
            console.log(`Team ${teamId} not found in stats, adding it now`);
            const teamExists = teams.some(t => t.id === teamId);
            
            if (teamExists) {
                updatedStats.push({
                    teamId: teamId,
                    points: []
                });
                teamIndex = updatedStats.length - 1;
            } else {
                console.error(`Team ${teamId} not found in teams array`);
                setNotification("Error: Team not found");
                return;
            }
        }

        updatedStats[teamIndex] = {
            ...updatedStats[teamIndex],
            points: [
                ...updatedStats[teamIndex].points,
                { playerId, points }
            ]
        };
        updateGameData(updatedStats);
    }, [game.stats, updateGameData, teams, setNotification]);

    // Delete a point
    const deletePoint = useCallback((teamIndex: number, pointIndex: number) => {
        const updatedStats = [...(game.stats || [])];
        updatedStats[teamIndex].points.splice(pointIndex, 1);
        updateGameData(updatedStats);
    }, [game.stats, updateGameData]);

    // Show edit dialog
    const handleEditClick = (teamIndex: number, pointIndex: number, currentValue: number) => {
        setEditPoint({ teamIndex, pointIndex });
        setEditValue(currentValue);
    };

    // Save edited point
    const saveEditedPoint = () => {
        if (!editPoint) return;

        const updatedStats = [...(game.stats || [])];
        updatedStats[editPoint.teamIndex].points[editPoint.pointIndex].points = editValue;
        updateGameData(updatedStats);
        setEditPoint(null);
    };

    return (
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main }}>
                    <SportsBasketballIcon sx={{ mr: 1 }} /> Basketball Scoring
                </Typography>
                <Divider sx={{ mt: 1 }} />
            </Box>

            {/* Scoreboard - Side by Side */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {teams.map((team) => {
                    const teamTotal = getTeamTotal(team.id);
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
                                        <Typography variant="h4" fontWeight="bold" sx={{ pr: 2 }}>
                                            {teamTotal}
                                        </Typography>
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

                                                    {/* Point chips with smooth transition */}
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
                                                        {POINT_TYPES.map(type => (
                                                            <Tooltip key={type.value} title={`Add ${type.label}`}>
                                                                <Chip
                                                                    icon={type.icon}
                                                                    label={type.value}
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    onClick={(e) => {
                                                                        // Stop propagation and add points with explicit team ID
                                                                        e.stopPropagation();
                                                                        addPoints(team.id, player.usn, type.value);
                                                                    }}
                                                                    clickable
                                                                    sx={{
                                                                        fontWeight: 'bold',
                                                                        transform: 'scale(1)',
                                                                        '&:hover': {
                                                                            bgcolor: `${type.color}20`,
                                                                            borderColor: type.color,
                                                                            transform: 'scale(1.05)'
                                                                        },
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        ))}
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

            {/* Points History Table */}
            <Card sx={{ mt: 3 }}>
                <CardHeader title="Points History" />
                <CardContent>
                    <TableContainer sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Team</TableCell>
                                    <TableCell>Player</TableCell>
                                    <TableCell align="center">Points</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {game.stats?.map((teamStat, teamIndex) => (
                                    teamStat.points.map((point, pointIndex) => {
                                        const player = players.find(p => p.usn === point.playerId);
                                        const team = teams.find(t => t.id === teamStat.teamId);
                                        return (
                                            <TableRow key={`${teamIndex}-${pointIndex}`} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar
                                                            sx={{ width: 24, height: 24, mr: 1, bgcolor: theme.palette.primary.light }}
                                                        >
                                                            {team?.name.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2">{team?.name}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{player?.name || 'Unknown Player'}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={point.points}
                                                        size="small"
                                                        color={
                                                            point.points === 3 ? "secondary" :
                                                                point.points === 2 ? "primary" : "success"
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditClick(teamIndex, pointIndex, point.points)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => deletePoint(teamIndex, pointIndex)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ))}

                                {(!game.stats || game.stats.every(s => s.points.length === 0)) && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <Typography color="text.secondary" py={2}>
                                                No points recorded yet
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Edit Point Dialog */}
            <Dialog open={!!editPoint} onClose={() => setEditPoint(null)}>
                <DialogTitle>Edit Points</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Points</InputLabel>
                        <Select
                            value={editValue}
                            label="Points"
                            onChange={(e) => setEditValue(Number(e.target.value))}
                        >
                            {[1, 2, 3].map(value => (
                                <MenuItem key={value} value={value}>{value} Point{value !== 1 ? 's' : ''}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditPoint(null)}>Cancel</Button>
                    <Button onClick={saveEditedPoint} variant="contained">Save</Button>
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
        </Paper >
    );
};