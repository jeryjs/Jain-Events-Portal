import { EventType } from "@common/constants";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import {
    Avatar,
    Box,
    Card,
    Divider,
    Grid,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";

// Sport-specific views
import { SportsActivity } from "@common/models";
import { Cricket, Sport } from "@common/models/sports/SportsActivity";
import BasketballView from "./SportsViews/Basketball";
import CricketView from "./SportsViews/Cricket";
import FootballView from "./SportsViews/Football";
import GenericView from "./SportsViews/GenericSport";
import VolleyballView from "./SportsViews/Volleyball";
import ThrowballView from "./SportsViews/Throwball";
import AthleticsView from "./SportsViews/Athletics";

// Sports Activity View
export const SportsView = ({ activity }: { activity: SportsActivity<Sport> }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const renderSportsContent = () => {
        switch (activity.type) {
            case EventType.CRICKET: return <CricketView activity={activity} />;
            case EventType.BASKETBALL: return <BasketballView activity={activity} />;
            case EventType.FOOTBALL: return <FootballView activity={activity} />;
            case EventType.VOLLEYBALL: return <VolleyballView activity={activity} />;
            case EventType.THROWBALL: return <ThrowballView activity={activity} />;
            case EventType.ATHLETICS: return <AthleticsView activity={activity} />;
            default: return <GenericView activity={activity} tabValue={1} />;
        }
    };

    return (
        <Box sx={{ mb: 4 }}>
            {/* Teams Section with VS Display */}
            <TeamComparisonCard activity={activity} />

            {/* Sport-specific content with tabs handled internally */}
            <Box sx={{ mt: 4 }}>
                {renderSportsContent()}
            </Box>
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
                            color="primary"
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
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette[color].main, opacity: isWinner ? 1 : 0.7 }}>
                    {score}
                </Typography>
                {secondaryStat && <Typography variant="h6" sx={{ color: theme.palette.text.secondary, ml: 1, mb: 1 }}>
                    / {secondaryStat}
                </Typography>}
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
                        src={`https://eu.ui-avatars.com/api/?name=${player.name || idx}&size=50`}
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