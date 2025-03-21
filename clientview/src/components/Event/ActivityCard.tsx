import { EventType } from '@common/constants';
import { InfoActivity } from '@common/models';
import Activity from '@common/models/Activity';
import SportsActivity, { Athletics, Sport } from '@common/models/sports/SportsActivity';
import { getBaseEventType } from '@common/utils';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsSharpIcon from '@mui/icons-material/SportsSharp';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { Avatar, Badge, Box, Card, CardContent, Chip, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { generateColorFromString } from '@utils/utils';
import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => `
  margin: ${theme.spacing(1)};
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`);

const MotionBox = styled(motion.div)(() => ` display: block; `);

const TeamBox = styled(Box)(({ theme }) => `
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${theme.spacing(1.5)};
  width: 100%;
`);

const TeamScore = styled(Box)<{ winner?: boolean }>(({ theme, winner }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing(0.5, 1)};
  width: 100%;
  ${winner ? `
    background-color: ${theme.palette.mode === 'dark'
      ? 'rgba(46, 125, 50, 0.15)'
      : 'rgba(46, 125, 50, 0.08)'};
    border-radius: 8px;
  ` : ''}
`);

const TeamName = styled(Typography)(({ theme }) => `
  font-weight: 500;
  font-size: 0.85rem;
  color: ${theme.palette.text.secondary};
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: center;
  padding: 0 ${theme.spacing(0.5)};
`);

const TeamScoreValue = styled(Typography)<{ winner?: boolean }>(({ theme, winner }) => `
  font-weight: ${winner ? 700 : 600};
  font-size: 1.5rem;
  color: ${winner ? theme.palette.success.main : theme.palette.text.primary};
  line-height: 1.2;
  text-align: center;
`);

const MatchStatus = styled(Box)<{ status: 'upcoming' | 'ongoing' | 'completed' }>(({ theme, status }) => {
  const colors = {
    upcoming: theme.palette.info.main,
    ongoing: theme.palette.error.main,
    completed: theme.palette.success.main
  };

  return `
    position: absolute;
    top: 6px;
    right: 6px;
    display: flex;
    align-items: center;
    padding: ${theme.spacing(0.5, 1.5)};
    border-radius: 12px;
    background-color: ${colors[status]}22;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    z-index: 1;

    ${theme.breakpoints.down('sm')} {
      position: initial;
    }
    
    & .MuiSvgIcon-root {
      color: ${colors[status]};
      font-size: 1rem;
      margin-right: ${theme.spacing(0.5)};
    }
    
    & .MuiTypography-root {
      color: ${colors[status]};
      font-weight: 600;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `;
});

const VsText = styled(Typography)(({ theme }) => `
  font-weight: 700;
  font-size: 0.9rem;
  color: ${theme.palette.text.disabled};
  margin: 0 ${theme.spacing(1)};
`);

const ScoreSecondary = styled(Typography)(({ theme }) => `
  font-size: 0.7rem;
  color: ${theme.palette.text.secondary};
  margin-top: ${theme.spacing(0.5)};
`);

interface ActivityCardProps {
  activity: Activity;
  eventId: string;
  delay?: number;
}

// Helper functions
const getActivityType = (type: EventType): string => EventType[type] || 'Activity';
const getChipColor = (type: EventType): string => generateColorFromString(getActivityType(type));
const isSportsActivity = (activity: Activity): boolean => getBaseEventType(activity.eventType) === EventType.SPORTS;
const isInfoActivity = (activity: Activity): boolean => getBaseEventType(activity.eventType) === EventType.INFO;

const getActivityStatus = (activity: Activity): 'upcoming' | 'ongoing' | 'completed' => {
  const now = new Date();
  const startTime = new Date(activity.startTime);
  const endTime = new Date(activity.endTime);

  if (now < startTime) return 'upcoming';
  if (now > endTime) return 'completed';
  return 'ongoing';
};

const getStatusIcon = (status: 'upcoming' | 'ongoing' | 'completed') => {
  switch (status) {
    case 'upcoming': return <AccessTimeIcon />;
    case 'ongoing': return <LiveTvIcon />;
    case 'completed': return <CheckCircleIcon />;
    default: return null; // Added a default return
  }
};

const getSportIcon = (type: EventType) => {
  switch (type) {
    case EventType.FOOTBALL: return <SportsSoccerIcon />;
    case EventType.CRICKET: return <SportsCricketIcon />;
    case EventType.BASKETBALL: return <SportsBasketballIcon />;
    case EventType.ATHLETICS: return <DirectionsRunIcon />;
    default: return <SportsSharpIcon />;
  }
};

// Motion Box Component
const MotionLink = styled(motion.div)`
  display: block;
  a {
    text-decoration: none;
  }
`;

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, eventId, delay = 0 }) => {
  const activityType = getActivityType(activity.eventType);
  const chipColor = getChipColor(activity.eventType);
  const participantCount = activity.participants?.length || 0;
  const isSports = isSportsActivity(activity);
  const isInfo = isInfoActivity(activity);
  const status = getActivityStatus(activity);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: delay * 0.1,
        ease: "easeOut"
      }
    }
  };

  // Athletics Card Component
  const AthleticsCard = ({ sportActivity, status, eventId }: { sportActivity: SportsActivity<Sport>, status: 'upcoming' | 'ongoing' | 'completed', eventId: string }) => {
    const athleticsGame = sportActivity.game as Athletics;
    const eventName = sportActivity.name || '';
    const isRelay = eventName.includes("Relay");

    const topAthletes = useMemo(() => {
      const allAthletes = athleticsGame.heats?.flatMap(heat =>
        heat.athletes
          .filter(a => a.rank || (a.time && a.time > 0))
          .map(athlete => ({
            ...athlete,
            heatId: heat.heatId,
            teamName: sportActivity.teams?.find(t => t.id === heat.heatId)?.name || '',
            athleteName: sportActivity.participants?.find(p => p.usn === athlete.playerId)?.name || 'Unknown'
          }))
      ) || [];
      return allAthletes
        .sort((a, b) => {
          if (a.rank && b.rank) return a.rank - b.rank;
          if (a.rank) return -1;
          if (b.rank) return 1;
          return (a.time || Infinity) - (b.time || Infinity);
        })
        .slice(0, 3);
    }, [athleticsGame.heats, sportActivity.teams, sportActivity.participants]);

    const topTeams = useMemo(() => {
      return sportActivity.teams?.slice(0, 3) || [];
    }, [sportActivity.teams]);

    return (
      <MotionLink
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link to={`/${eventId}/${sportActivity.id}`} style={{ textDecoration: 'none' }}>
          <StyledCard elevation={4}>
            <MatchStatus status={status}>
              {getStatusIcon(status)}
              <Typography>{status}</Typography>
            </MatchStatus>

            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: `${chipColor}22`,
                    color: chipColor,
                    width: 36,
                    height: 36,
                    mr: 1.5
                  }}
                >
                  <DirectionsRunIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '1.1rem' }}>
                    {sportActivity.name}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              {status === 'upcoming' ? (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {new Date(sportActivity.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(sportActivity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Event Stats Line */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip
                      icon={<DirectionsRunIcon sx={{ fontSize: '0.85rem !important' }} />}
                      label={isRelay ? `${sportActivity.teams?.length || 0} teams` : `${athleticsGame.heats?.length || 0} heats`}
                      size="small"
                      sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiChip-label': { px: 1, py: 0.5 },
                        '& .MuiChip-icon': { ml: 0.5 }
                      }}
                    />
                    <Chip
                      icon={<Badge sx={{
                        '& .MuiBadge-badge': {
                          position: 'static',
                          transform: 'none',
                          fontSize: '0.7rem',
                          height: '16px',
                          minWidth: '16px',
                          padding: 0
                        }
                      }}
                        badgeContent={sportActivity.participants?.length || 0} color="primary"
                      />}
                      label="Athletes"
                      size="small"
                      sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiChip-label': { pl: 1, pr: 1.5, py: 0.5 },
                      }}
                    />
                  </Box>

                  {/* Leaderboard Section */}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      color: 'primary.main',
                      fontWeight: 600
                    }}
                  >
                    <EmojiEventsIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                    Leaderboard
                  </Typography>
                  {(isRelay ? topTeams : topAthletes).length > 0 ? (
                    <Box
                      sx={{
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      {(isRelay ? topTeams : topAthletes).map((item, idx, arr) => {
                        const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                        return (
                          <Box
                            key={isRelay ? item.id : item.playerId}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1,
                              bgcolor: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                              borderBottom: idx < arr.length - 1 ? '1px solid' : 'none',
                              borderColor: 'divider',
                              position: 'relative',
                              overflow: 'hidden',
                              '&:after': idx < 3
                                ? {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: '4px',
                                  backgroundColor: medalColors[idx]
                                }
                                : {}
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '70%' }}>
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontWeight: 'bold', minWidth: '16px' }}
                              >
                                {isRelay ? idx + 1 : item.rank || idx + 1}
                              </Typography>
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  fontSize: '0.8rem',
                                  bgcolor: idx < 3 ? `${medalColors[idx]}33` : 'grey.300',
                                  color: idx < 3 ? medalColors[idx] : 'text.secondary',
                                  mr: 1,
                                  ml: 0.5
                                }}
                              >
                                {isRelay ? item.name.charAt(0) : item.athleteName.charAt(0)}
                              </Avatar>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: idx === 0 ? 600 : 400,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {isRelay ? (
                                  <>
                                    {item.name}
                                    {activity.participants && activity.participants.length > 0 && (
                                      <Typography
                                        component="span"
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ ml: 0.5 }}
                                      >
                                        ({sportActivity.getTeamPlayers(item.id).map(p => p.name).join(', ')})
                                      </Typography>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {item.athleteName}
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ ml: 0.5 }}
                                    >
                                      ({item.teamName})
                                    </Typography>
                                  </>
                                )}
                              </Typography>
                            </Box>
                            {!isRelay && (
                              <Typography
                                variant="body2"
                                fontWeight={idx === 0 ? 600 : 400}
                                sx={{
                                  color:
                                    idx < 3
                                      ? idx === 0
                                        ? 'primary.main'
                                        : idx === 1
                                          ? 'secondary.main'
                                          : 'warning.main'
                                      : 'text.primary',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {item.time && item.time > 0
                                  ? `${item.time.toFixed(2)}s`
                                  : `Rank ${item.rank || '-'}`}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 2,
                        bgcolor: 'background.paper',
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Typography color="text.secondary" variant="body2">
                        {status === 'ongoing'
                          ? 'Event in progress - No results yet'
                          : 'No results recorded'}
                      </Typography>
                    </Box>
                  )}

                  {/* Status Footer */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 1,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: status === 'ongoing' ? 'error.main' : 'success.main',
                      color: 'white'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                      {status === 'ongoing' ? 'EVENT IN PROGRESS' : 'EVENT COMPLETED'}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </StyledCard>
        </Link>
      </MotionLink>
    );
  };

  // Sports Card Component
  const SportsCard = ({ sportActivity, status, eventId }: { sportActivity: SportsActivity<Sport>, status: 'upcoming' | 'ongoing' | 'completed', eventId: string }) => {
    const matchResult = sportActivity.getMatchResult();
    const sportIcon = getSportIcon(activity.eventType);

    // Get teams
    const team1 = sportActivity.teams?.[0];
    const team2 = sportActivity.teams?.[1];
    const isTeamsConfirmed = !!team1 && !!team2;

    return (
      <MotionLink
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link to={`/${eventId}/${activity.id}`} style={{ textDecoration: 'none' }}>
          <StyledCard elevation={4}>
            <MatchStatus status={status}>
              {getStatusIcon(status)}
              <Typography>{status}</Typography>
            </MatchStatus>

            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: `${chipColor}22`,
                    color: chipColor,
                    width: 36,
                    height: 36,
                    mr: 1.5
                  }}
                >
                  {sportIcon}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: { xs: '0.9rem', md: '1.1rem' } }}>
                    {activity.name}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <TeamBox>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <TeamScore winner={status === 'completed' && isTeamsConfirmed && matchResult.winner === team1?.id}>
                    <TeamName>{team1?.name || 'TBD'}</TeamName>
                    {status !== 'upcoming' && isTeamsConfirmed && (
                      <>
                        <TeamScoreValue winner={matchResult.winner === team1?.id}> {sportActivity.getTotalScore(team1.id)}</TeamScoreValue>
                        {sportActivity.getSecondaryStat(team1.id) && (<ScoreSecondary> {sportActivity.getSecondaryStat(team1.id)}</ScoreSecondary>)}
                      </>
                    )}
                  </TeamScore>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 1 }}>
                  <VsText>VS</VsText>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <TeamScore winner={status === 'completed' && isTeamsConfirmed && matchResult.winner === team2?.id}>
                    <TeamName>{team2?.name || 'TBD'}</TeamName>
                    {status !== 'upcoming' && isTeamsConfirmed && (
                      <>
                        <TeamScoreValue winner={matchResult.winner === team2?.id}>{sportActivity.getTotalScore(team2.id)}</TeamScoreValue>
                        {sportActivity.getSecondaryStat(team2.id) && (<ScoreSecondary>{sportActivity.getSecondaryStat(team2.id)}</ScoreSecondary>)}
                      </>
                    )}
                  </TeamScore>
                </Box>
              </TeamBox>

              {!isTeamsConfirmed && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{
                    color: 'text.secondary',
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    display: 'inline-block'
                  }}>
                    Teams to be announced
                  </Typography>
                </Box>
              )}

              {status === 'upcoming' && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {new Date(activity.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              )}

              {status === 'ongoing' && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" color="error.main" align="center" sx={{ mt: 0.5, fontWeight: 600 }}>
                    MATCH IN PROGRESS
                  </Typography>
                </Box>
              )}

              {status === 'completed' && isTeamsConfirmed && (
                <Box sx={{ mt: 1.5 }}>
                  {matchResult.winner ? (
                    <Typography variant="body1" align="center" sx={{ fontWeight: 600 }}>
                      Won by {sportActivity.teams?.find(team => team.id === matchResult.winner)?.name}
                    </Typography>
                  ) : (
                    <Typography variant="body1" align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Match Draw
                    </Typography>
                  )}
                </Box>
              )}

              {status === 'completed' && !isTeamsConfirmed && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Match completed
                  </Typography>
                </Box>
              )}
            </CardContent>
          </StyledCard>
        </Link>
      </MotionLink>
    );
  };

  // Info Card Component
  const InfoCard = ({ activity, chipColor, eventId }: { activity: InfoActivity, chipColor: string, eventId: string }) => {
    // Extract a short preview from the content if it exists
    const doc = new DOMParser().parseFromString(activity.content, 'text/html');
    doc.querySelectorAll('style').forEach(el => el.remove());
    const contentPreview = doc.body.textContent?.replace(/\s+/g, ' ').trim() || '';

    return (
      <MotionLink variants={cardVariants} initial="hidden" animate="visible" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link to={`/${eventId}/${activity.id}`} style={{ textDecoration: 'none' }}>
          <StyledCard sx={{ borderLeft: `4px solid ${chipColor}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: `${chipColor}22`, color: chipColor, width: 36, height: 36, mr: 1.5 }}>
                  <ArticleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{activity.name}</Typography>
                </Box>
              </Box>
              <Divider sx={{ mt: 0.5 }} />
              <Box sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: 1, position: 'relative', overflow: 'hidden', '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: '20px' } }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{contentPreview}</Typography>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(activity.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />View Information
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Link>
      </MotionLink>
    );
  };

  // Standard Card Component
  const StandardCard = ({ activity, activityType, chipColor, participantCount, status, eventId }: { activity: Activity, activityType: string, chipColor: string, participantCount: number, status: 'upcoming' | 'ongoing' | 'completed', eventId: string }) => (
    <MotionLink
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={`/${eventId}/${activity.id}`} style={{ textDecoration: 'none' }}>
        <StyledCard>
          <MatchStatus status={status}>
            {getStatusIcon(status)}
            <Typography>{status}</Typography>
          </MatchStatus>

          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {activity.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Badge
                    badgeContent={participantCount}
                    color="primary"
                    sx={{ mr: 1.5 }}
                  >
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'background.paper', border: '1px solid #ddd' }}>
                      👥
                    </Avatar>
                  </Badge>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {status === 'upcoming' && (
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Starts {new Date(activity.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Typography>
              </Box>
            )}
          </CardContent>
        </StyledCard>
      </Link>
    </MotionLink>
  );

  // Render appropriate card based on activity type
  if (isInfo) {
    return <InfoCard activity={activity as InfoActivity} chipColor={chipColor} eventId={eventId} />;
  } else if (isSports) {
    const sportActivity = activity as SportsActivity<Sport>;
    if (activity.eventType === EventType.ATHLETICS) {
      return <AthleticsCard sportActivity={sportActivity} status={status} eventId={eventId} />;
    }
    return <SportsCard sportActivity={sportActivity} status={status} eventId={eventId} />;
  }

  return (
    <StandardCard
      activity={activity}
      activityType={activityType}
      chipColor={chipColor}
      participantCount={participantCount}
      status={status}
      eventId={eventId}
    />
  );
};

export default ActivityCard;