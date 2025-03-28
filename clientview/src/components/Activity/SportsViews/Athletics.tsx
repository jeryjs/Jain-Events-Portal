import { Athletics as AthleticsModel, SportsActivity } from "@common/models";
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FlagIcon from '@mui/icons-material/Flag';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import SportsTwoIcon from '@mui/icons-material/SportsTwoTone';
import SportsMedal2 from '@mui/icons-material/StarBorder';
import TimerIcon from '@mui/icons-material/Timer';
import SportsMedal from '@mui/icons-material/Whatshot';
import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  styled,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useMemo, useState } from 'react';
import PlayersTab from "./PlayersTab";
import { Sport } from "@common/models/sports/SportsActivity";

// Styled components
const StyledMedalAvatar = styled(Avatar)(({ theme, color }) => ({
  backgroundColor: color === 'gold' ? 'rgba(255, 215, 0, 0.1)' :
    color === 'silver' ? 'rgba(192, 192, 192, 0.1)' :
      color === 'bronze' ? 'rgba(205, 127, 50, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  color: color === 'gold' ? '#FFD700' :
    color === 'silver' ? '#C0C0C0' :
      color === 'bronze' ? '#CD7F32' : theme.palette.text.secondary,
  width: 32,
  height: 32,
  marginRight: theme.spacing(1)
}));

const StyledTimeBadge = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  background: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '0.875rem',
    marginRight: theme.spacing(0.5),
  }
}));

// Main component
export default function AthleticsView({ activity }) {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const athletics = activity.game as AthleticsModel;

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant={isMobile ? "fullWidth" : "standard"}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<EmojiEventsIcon />} label="Results" iconPosition="start" />
        <Tab icon={<GroupIcon />} label="Athletes" iconPosition="start" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {tabValue === 0 && <AthleticsResults activity={activity} game={athletics} />}
        {tabValue === 1 && <PlayersTab activity={activity} />}
      </Box>
    </Paper>
  );
};

// Results component
const AthleticsResults = ({ activity, game }: { activity: SportsActivity<Sport>, game: AthleticsModel }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Determine activity status
  const matchStatus = {
    isNotStarted: !activity.startTime || activity.startTime > new Date(),
    isComplete: activity.endTime && activity.endTime < new Date()
  };

  // Get the event name
  const eventName = activity.name || '';
  const isRelay = eventName.toLowerCase().includes("relay");

  // Process athlete data to get ranking and times
  const processedHeats = useMemo(() => {
    return game.heats?.map(heat => {
      const team = activity.teams.find(t => t.id === heat.heatId);

      // Get athletes with time/rank data
      const participatingAthletes = heat.athletes
        .filter(a => a.time > 0 || a.rank > 0)
        .map(athlete => {
          const player = activity.participants.find(p => p.usn === athlete.playerId);
          return {
            ...athlete,
            name: player?.name || 'Unknown',
            teamId: player?.teamId,
            teamName: team?.name || 'Unknown Team'
          };
        })
        .sort((a, b) => {
          // Sort by rank first (if available), then by time
          if (a.rank && b.rank) return a.rank - b.rank;
          if (a.rank) return -1;
          if (b.rank) return 1;
          return (a.time || Infinity) - (b.time || Infinity);
        });

      // Get list of athletes without time/rank data
      const nonParticipatingAthletes = heat.athletes
        .filter(a => !a.time && !a.rank)
        .map(athlete => {
          const player = activity.participants.find(p => p.usn === athlete.playerId);
          return {
            ...athlete,
            name: player?.name || 'Unknown',
            teamId: player?.teamId,
            teamName: team?.name || 'Unknown Team'
          };
        });

      return {
        heatId: heat.heatId,
        teamName: team?.name || 'Unknown Team',
        athletes: participatingAthletes,
        nonParticipatingAthletes
      };
    }) || [];
  }, [game.heats, activity.teams, activity.participants]);

  // Get all athletes with valid results across all heats
  const allAthletes = useMemo(() => {
    return processedHeats.flatMap(heat => heat.athletes)
      .sort((a, b) => {
        // Sort by rank first (if available), then by time
        if (a.rank && b.rank) return a.rank - b.rank;
        if (a.rank) return -1;
        if (b.rank) return 1;
        return (a.time || Infinity) - (b.time || Infinity);
      });
  }, [processedHeats]);

  // Helper function to format time nicely
  const formatTime = (time: number) => {
    if (!time) return '--';

    // Format with 2 decimal places
    return time.toFixed(2) + 's';
  };

  // If the event hasn't started yet
  if (matchStatus.isNotStarted) {
    return (
      <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.light', p: 2, color: 'white', textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Upcoming Athletics Event
          </Typography>
        </Box>
        <CardContent>
          <Typography variant="subtitle1" color="text.secondary" align="center">
            The event is scheduled for:
          </Typography>
          <Typography variant="h5" align="center" fontWeight="bold" sx={{ my: 2 }}>
            {new Date(activity.startTime).toLocaleString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })}
          </Typography>
          <LinearProgress variant="determinate" value={0} sx={{ height: 8, borderRadius: 4 }} />

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" color="text.primary" align="center" gutterBottom>
              <DirectionsRunIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              {isRelay ? 'Teams' : 'Athletes'} participating:
            </Typography>

            <Grid container spacing={2} justifyContent="center" sx={{ mt: 1 }}>
              {activity.teams.map(team => (
                <Grid item xs={12} sm={6} md={4} key={team.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {team.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                          {activity.participants
                            .filter(p => p.teamId === team.id)
                            .map(player => (
                              <Avatar key={player.usn}>{player.name.charAt(0)}</Avatar>
                            ))}
                        </AvatarGroup>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {activity.participants.filter(p => p.teamId === team.id).length} Athletes
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Event status card */}
      <Grid item xs={12}>
        <Card sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bgcolor: matchStatus.isComplete ? 'success.main' : 'error.main',
              color: 'white',
              px: 2,
              py: 0.5,
              borderBottomRightRadius: 8,
              zIndex: 1
            }}
          >
            {matchStatus.isComplete ? 'COMPLETED' : 'ONGOING'}
          </Box>

          <CardContent sx={{ pt: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DirectionsRunIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {activity.name}
              </Typography>
              {isRelay && (
                <Chip
                  label="RELAY"
                  size="small"
                  color="secondary"
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Box>

            {/* Event description */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isRelay
                ? `A relay race featuring ${activity.teams.length} teams competing for the fastest time.`
                : `An athletics event with ${activity.participants.length} athletes competing across ${game.heats?.length || 0} heats.`
              }
            </Typography>

            {/* Top performers section */}
            <Box sx={{ mt: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}`, pb: 1 }}>
                <EmojiEventsIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                Top Performers
              </Typography>

              {allAthletes.length > 0 ? (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {allAthletes.slice(0, 3).map((athlete, idx) => {
                    const medalColors = ['gold', 'silver', 'bronze'];
                    const medalIcons = [<SportsMedal />, <SportsTwoIcon />, <SportsMedal2 />];

                    return (
                      <Grid item xs={12} sm={4} key={athlete.playerId}>
                        <Card
                          elevation={3}
                          sx={{
                            height: '100%',
                            background: `linear-gradient(to bottom, ${idx === 0 ? 'rgba(255,215,0,0.05)' :
                              idx === 1 ? 'rgba(192,192,192,0.05)' :
                                idx === 2 ? 'rgba(205,127,50,0.05)' : 'transparent'
                              } 0%, transparent 100%)`,
                            position: 'relative',
                            overflow: 'hidden',
                            border: `1px solid ${idx === 0 ? 'rgba(255,215,0,0.3)' :
                              idx === 1 ? 'rgba(192,192,192,0.3)' :
                                idx === 2 ? 'rgba(205,127,50,0.3)' : theme.palette.divider
                              }`
                          }}
                        >
                          {idx < 3 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: medalColors[idx],
                                opacity: 0.2
                              }}
                            />
                          )}

                          <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <StyledMedalAvatar color={medalColors[idx]}>
                                {medalIcons[idx] || <PersonIcon />}
                              </StyledMedalAvatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {athlete.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {athlete.playerId}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {athlete.teamName}
                                </Typography>
                              </Box>
                            </Box>

                            <Grid container spacing={1} sx={{ mt: 'auto' }}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Rank</Typography>
                                <Typography variant="h6" fontWeight="bold" color={idx === 0 ? 'warning.main' : 'text.primary'}>
                                  {athlete.rank || (idx + 1)}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Time</Typography>
                                <Typography variant="h6" fontWeight="bold">
                                  {formatTime(athlete.time)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography color="text.secondary">
                    {matchStatus.isComplete ? 'No results have been recorded yet.' : 'Event in progress - results will appear here.'}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Heat-wise results */}
      {processedHeats.map((heat, heatIndex) => (
        <Grid item xs={12} key={heat.heatId}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FlagIcon sx={{ mr: 1 }} />
                {isRelay ? heat.teamName : `Heat ${heatIndex + 1}: ${heat.teamName}`}
              </Typography>

              {heat.athletes.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width="5%">Rank</TableCell>
                        <TableCell>Athlete</TableCell>
                        {!isRelay && <TableCell>Team</TableCell>}
                        <TableCell align="right">Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {heat.athletes.map((athlete, idx) => (
                        <TableRow
                          key={athlete.playerId}
                          sx={{
                            bgcolor: idx % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                            '& td': { borderColor: theme.palette.divider }
                          }}
                        >
                          <TableCell>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: athlete.rank <= 3 ?
                                  athlete.rank === 1 ? 'rgba(255,215,0,0.1)' :
                                    athlete.rank === 2 ? 'rgba(192,192,192,0.1)' :
                                      'rgba(205,127,50,0.1)' : 'rgba(0,0,0,0.05)',
                                color: athlete.rank <= 3 ?
                                  athlete.rank === 1 ? theme.palette.warning.main :
                                    athlete.rank === 2 ? theme.palette.text.secondary :
                                      theme.palette.warning.dark : theme.palette.text.secondary,
                                fontWeight: 'bold',
                                fontSize: '0.75rem'
                              }}
                            >
                              {athlete.rank || (idx + 1)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  mr: 1,
                                  bgcolor: athlete.rank === 1 ? 'rgba(255,215,0,0.1)' : 'rgba(0,0,0,0.05)',
                                  color: athlete.rank === 1 ? theme.palette.warning.main : theme.palette.text.primary
                                }}
                              >
                                {athlete.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={athlete.rank === 1 ? 'bold' : 'normal'}>
                                  {athlete.name}
                                  {athlete.rank === 1 && ' 🏆'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {athlete.playerId}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          {!isRelay && (
                            <TableCell>{athlete.teamName}</TableCell>
                          )}
                          <TableCell align="right">
                            <StyledTimeBadge>
                              <TimerIcon />
                              {formatTime(athlete.time)}
                            </StyledTimeBadge>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Show non-participating athletes if any */}
                      {heat.nonParticipatingAthletes.length > 0 && (
                        <>
                          <TableRow>
                            <TableCell colSpan={isRelay ? 3 : 4} sx={{ py: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                Athletes without recorded times
                              </Typography>
                            </TableCell>
                          </TableRow>

                          {heat.nonParticipatingAthletes.map((athlete, idx) => (
                            <TableRow
                              key={athlete.playerId}
                              sx={{
                                bgcolor: 'rgba(0,0,0,0.01)',
                                opacity: 0.7,
                                '& td': { borderColor: theme.palette.divider }
                              }}
                            >
                              <TableCell>-</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar sx={{ width: 24, height: 24, mr: 1, opacity: 0.5 }}>
                                    {athlete.name.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {athlete.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {athlete.playerId}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              {!isRelay && (
                                <TableCell>{athlete.teamName}</TableCell>
                              )}
                              <TableCell align="right">
                                <Typography variant="body2" color="text.secondary">--</Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.01)' }}>
                  <Typography color="text.secondary">
                    No results recorded for this {isRelay ? 'team' : 'heat'} yet.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Heat comparison */}
      {processedHeats.filter(heat => heat.athletes.length > 0).length > 1 && !isRelay && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TimerIcon sx={{ mr: 1 }} />
                Heat Comparison
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Heat</TableCell>
                      <TableCell>Fastest Time</TableCell>
                      <TableCell>Slowest Time</TableCell>
                      <TableCell align="right">Average Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {processedHeats.map((heat, idx) => {
                      const validAthletes = heat.athletes.filter(a => a.time > 0);
                      if (validAthletes.length === 0) return null;

                      const times = validAthletes.map(a => a.time);
                      const fastestTime = Math.min(...times);
                      const slowestTime = Math.max(...times);
                      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;

                      const fastestAthlete = validAthletes.find(a => a.time === fastestTime);

                      return (
                        <TableRow key={heat.heatId}>
                          <TableCell>{heat.teamName}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <StyledTimeBadge sx={{ mr: 1 }}>{formatTime(fastestTime)}</StyledTimeBadge>
                              <Typography variant="caption" color="text.secondary">
                                ({fastestAthlete?.name})
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{formatTime(slowestTime)}</TableCell>
                          <TableCell align="right">{formatTime(avgTime)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};