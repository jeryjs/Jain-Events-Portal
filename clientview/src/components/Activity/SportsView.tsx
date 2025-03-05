import { EventType } from "@common/constants";
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Paper,
    Tab,
    Tabs,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useState } from "react";

// Sport-specific views
import BasketballView from "./SportsViews/Basketball";
import CricketView from "./SportsViews/Cricket";
import FootballView from "./SportsViews/Football";
import GenericView from "./SportsViews/GenericSport";
import { SportsActivity } from "@common/models";
import { Cricket, Sport } from "@common/models/sports/SportsActivity";

// Sports Activity View
export const SportsView = ({ activity }: { activity: SportsActivity<Sport> }) => {
    const [tabValue, setTabValue] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleTabChange = (_, newValue) => {
        setTabValue(newValue);
    };

    // Get appropriate icon for the sport type
    const getSportIcon = () => {
        switch (activity.eventType) {
            case EventType.FOOTBALL: return <SportsSoccerIcon fontSize="large" />;
            case EventType.CRICKET: return <SportsCricketIcon fontSize="large" />;
            case EventType.BASKETBALL: return <SportsBasketballIcon fontSize="large" />;
            default: return null;
        }
    };

    // Get sport name
    const getSportName = () => {
        switch (activity.eventType) {
            case EventType.FOOTBALL: return "Football";
            case EventType.CRICKET: return "Cricket";
            case EventType.BASKETBALL: return "Basketball";
            default: return "Sports";
        }
    };

    // Get match status
    const getMatchStatus = () => {
        const result = activity.getMatchResult();

        if (result.isOngoing) {
            return { label: "In Progress", color: "primary" };
        } else if (result.isDraw) {
            return { label: "Match Drawn", color: "warning" };
        } else {
            const winningTeam = activity.winningTeam;
            return {
                label: winningTeam ? `${winningTeam.name} Won` : "Match Ended",
                color: "success"
            };
        }
    };

    const renderSportsContent = (tabValue) => {
        switch (activity.eventType) {
            case EventType.CRICKET: return <CricketView activity={activity} tabValue={tabValue} />;
            case EventType.BASKETBALL: return <BasketballView activity={activity} tabValue={tabValue} />;
            case EventType.FOOTBALL: return <FootballView activity={activity} tabValue={tabValue} />;
            default: return <GenericView activity={activity} tabValue={tabValue} />;
        }
    };

    const matchStatus = getMatchStatus();

    return (
        <Box sx={{ mb: 4 }}>
            {/* Sport Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    color: "white",
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Box
                            sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                borderRadius: "50%",
                                p: 1,
                                display: "flex",
                            }}
                        >
                            {getSportIcon()}
                        </Box>
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h5" fontWeight="bold">
                            {activity.name}
                        </Typography>
                        <Typography variant="subtitle2">
                            {getSportName()} Match
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Chip
                            label={matchStatus.label}
                            //   color={matchStatus.color} 
                            sx={{ fontWeight: "bold" }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Teams Section with VS Display */}
            <TeamComparisonCard activity={activity} />

            {/* Navigation Tabs */}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', mt: 4 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant={isMobile ? "fullWidth" : "standard"}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Overview" />
                    <Tab label="Players" />
                    <Tab label="Scoreboard" /> {/* Changed from "Statistics" */}
                </Tabs>

                {/* Tab Content */}
                <Box>
                    {renderSportsContent(tabValue)}
                </Box>
            </Paper>
        </Box>
    );
};

// Teams comparison card with VS display
const TeamComparisonCard = ({ activity }: { activity: SportsActivity<Sport> }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Exit early if there aren't exactly 2 teams
    if (!activity.teams || activity.teams.length !== 2) {
        return null;
    }

    const team1 = activity.teams[0];
    const team2 = activity.teams[1];

    const score1 = activity.getTotalScore(team1.id);
    const score2 = activity.getTotalScore(team2.id);

    const secondaryStat1 = activity.getSecondaryStat(team1.id);
    const secondaryStat2 = activity.getSecondaryStat(team2.id);

    // Determine winner for styling
    const winnerId = activity.winningTeam?.id;

    return (
        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 3 }}>
                <Grid container alignItems="center">
                    {/* Left Team */}
                    <Grid item xs={5} sx={{ textAlign: isMobile ? 'center' : 'left' }}>
                        <TeamDisplay
                            team={team1}
                            activity={activity}
                            score={score1}
                            secondaryStat={secondaryStat1}
                            isWinner={winnerId === team1.id}
                            align={isMobile ? 'center' : 'left'}
                            color="primary"
                        />
                    </Grid>

                    {/* VS Section */}
                    <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                height: 80,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}
                        >
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                sx={{
                                    color: theme.palette.text.secondary,
                                    opacity: 0.8
                                }}
                            >
                                VS
                            </Typography>
                            <Divider orientation="vertical" sx={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: '50%',
                                zIndex: -1,
                            }} />
                        </Box>
                    </Grid>

                    {/* Right Team */}
                    <Grid item xs={5} sx={{ textAlign: isMobile ? 'center' : 'right' }}>
                        <TeamDisplay
                            team={team2}
                            activity={activity}
                            score={score2}
                            secondaryStat={secondaryStat2}
                            isWinner={winnerId === team2.id}
                            align={isMobile ? 'center' : 'right'}
                            color="secondary"
                        />
                    </Grid>
                </Grid>
            </Box>
        </Card>
    );
};

// Team display component
const TeamDisplay = ({ team, activity, score, secondaryStat, isWinner, align, color }) => {
    const theme = useTheme();

    return (
        <Box>
            <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                    color: isWinner ? theme.palette[color].main : 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
                    gap: 1
                }}
            >
                {isWinner && align === 'left' && <EmojiEventsIcon color={color} />}
                {team.name}
                {isWinner && align === 'right' && <EmojiEventsIcon color={color} />}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette[color].main, opacity: isWinner ? 1 : 0.7}}>
                    {score}
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary, ml: 1, mb: 1 }}>
                    / {secondaryStat}
                </Typography>
            </Box>
            {(activity.game instanceof Cricket) && (
                <Typography variant="body2" color="text.secondary">
                    {activity.game.getTeamOvers(team.id)} overs
                </Typography>
            )}

            <Box sx={{
                display: 'flex',
                mt: 1,
                justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'
            }}>
                {activity.getTeamPlayers(team.id).slice(0, 3).map((player, idx) => (
                    <Avatar
                        key={player.usn || idx}
                        alt={player.name}
                        src={`https://i.pravatar.cc/150?u=${player.usn || idx}`}
                        sx={{
                            width: 32,
                            height: 32,
                            border: `2px solid ${theme.palette.background.paper}`,
                            marginLeft: idx > 0 ? -1 : 0
                        }}
                    />
                ))}
                {activity.getTeamPlayers(team.id).length > 3 && (
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: theme.palette[color].light,
                            fontSize: '0.75rem',
                            color: theme.palette[color].contrastText,
                            marginLeft: -1
                        }}
                    >
                        +{activity.getTeamPlayers(team.id).length - 3}
                    </Avatar>
                )}
            </Box>
        </Box>
    );
};

export default SportsView;