import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Container, Paper, Chip, 
  Divider, IconButton, Avatar, AvatarGroup, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Tabs, Tab
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PageTransition from '@components/shared/PageTransition';
import { useActivity } from '@hooks/useApi';
import { getBaseEventType, parseActivities } from '@common/utils';
import { EventType, Gender } from '@common/constants';
import { SportsActivity, Basketball, Cricket, Football } from '@common/models';

// Styled Components
const HeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.08)}`,
}));

const HeaderChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.common.white,
  marginRight: theme.spacing(1),
}));

const InfoIconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  }
}));

const ParticipantAvatar = styled(Avatar)(({ theme }) => ({
  border: `2px solid ${theme.palette.background.paper}`,
}));

const Section = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
  }
}));

function ActivityPage() {
  const { eventId, activityId } = useParams<{ eventId: string; activityId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const { data: activity, isLoading } = useActivity(eventId || '', activityId || '');

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  if (!activity) {
    return <ActivityNotFound eventId={eventId || ''} />;
  }

  const handleBack = () => {
    navigate(`/${eventId}`);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Determine activity type based on eventType enum
  const baseType = getBaseEventType(activity.eventType);
  
  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ py: 4, color: 'text.primary' }}>
        {/* Activity Header with Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={handleBack} 
            sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {activity.name}
          </Typography>
        </Box>

        {/* Activity Hero Section */}
        <ActivityHero activity={activity} baseType={baseType} />

        {/* Activity Content Based on Type */}
        {baseType === EventType.SPORTS && (
          <SportsActivityView activity={activity as SportsActivity<any>} tabValue={tabValue} onTabChange={handleTabChange} />
        )}
        
        {baseType === EventType.CULTURAL && (
          <CulturalActivityView activity={activity} />
        )}
        
        {baseType === EventType.TECH && (
          <TechActivityView activity={activity} />
        )}
        
        {baseType === EventType.GENERAL && (
          <GeneralActivityView activity={activity} />
        )}
        
      </Container>
    </PageTransition>
  );
}

// Activity Header Component
const ActivityHero = ({ activity, baseType }) => {
  // Get appropriate background color based on activity type
  const getBgColor = (type) => {
    switch (type) {
      case EventType.SPORTS: return 'primary.main';
      case EventType.CULTURAL: return 'secondary.main';
      case EventType.TECH: return 'info.main';
      default: return 'text.primary';
    }
  };

  // Get activity type label
  const getActivityTypeLabel = (type) => {
    if (type >= EventType.TECH) return 'Tech Activity';
    if (type >= EventType.CULTURAL) return 'Cultural Activity';
    if (type >= EventType.SPORTS) return 'Sports Activity';
    return 'General Activity';
  };

  return (
    <HeroContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <HeaderChip 
            label={getActivityTypeLabel(activity.eventType)}
            sx={{ bgcolor: getBgColor(baseType) }}
          />
          <Box sx={{ mt: 2 }}>
            <InfoIconWrapper>
              <CalendarTodayIcon />
              <Typography variant="body1">
                Today, 2:00 PM - 5:00 PM
              </Typography>
            </InfoIconWrapper>
            <InfoIconWrapper>
              <PeopleIcon />
              <Typography variant="body1">
                {activity.participants?.length || 0} Participants
              </Typography>
            </InfoIconWrapper>
          </Box>
        </Box>
        
        {activity.participants?.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Participants</Typography>
            <AvatarGroup max={5}>
              {activity.participants.map((participant, i) => (
                <ParticipantAvatar 
                  key={participant.usn || i}
                  alt={participant.name} 
                  src={`https://i.pravatar.cc/150?u=${participant.usn || i}`}
                />
              ))}
            </AvatarGroup>
          </Box>
        )}
      </Box>
    </HeroContainer>
  );
};

// Sports Activity View
const SportsActivityView = ({ activity, tabValue, onTabChange }) => {
  // Switch based on specific sport type
  const renderSportContent = () => {
    switch (activity.eventType) {
      case EventType.CRICKET:
        return <CricketView activity={activity} />;
      case EventType.BASKETBALL:
        return <BasketballView activity={activity} />;
      case EventType.FOOTBALL:
        return <FootballView activity={activity} />;
      default:
        return <GenericSportView activity={activity} />;
    }
  };

  return (
    <Box>
      {/* Teams Information */}
      <Section>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Teams
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {activity.teams?.map(team => (
            <StatCard key={team.id}>
              <Typography variant="h6">{team.name}</Typography>
              <Typography color="text.secondary">
                {activity.getTeamPlayers?.(team.id)?.length || 0} Players
              </Typography>
            </StatCard>
          ))}
        </Box>
      </Section>

      {/* Sport-specific tabs */}
      <Box sx={{ mt: 4, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={onTabChange} aria-label="activity details tabs">
          <Tab label="Overview" />
          <Tab label="Players" />
          <Tab label="Statistics" />
        </Tabs>
      </Box>
      
      {/* Tab content */}
      <Box sx={{ py: 4 }}>
        {tabValue === 0 && renderSportContent()}
        {tabValue === 1 && <PlayersTab activity={activity} />}
        {tabValue === 2 && <StatisticsTab activity={activity} />}
      </Box>
    </Box>
  );
};

// Cricket-specific view
const CricketView = ({ activity }) => {
  const cricket = activity.game as Cricket;
  
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Match Summary</Typography>
      
      {cricket?.innings?.map((inning, idx) => (
        <Paper key={idx} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Innings {idx + 1}: {activity.teams.find(t => t.id === inning.battingTeam)?.name} Batting
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h4" fontWeight="bold">
              {cricket.getTeamScore(inning.battingTeam)} 
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({inning.overs.length} overs)
              </Typography>
            </Typography>
          </Box>
          
          <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Batsman</TableCell>
                  <TableCell align="right">Runs</TableCell>
                  <TableCell align="right">Balls</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* We would need to aggregate data per batsman here */}
                {Array.from(new Set(inning.overs.flatMap(over => 
                  over.balls.map(ball => ball.batsmanId)
                ))).map(batsmanId => {
                  const player = activity.getPlayer(batsmanId);
                  const runs = cricket.getPlayerRuns(batsmanId);
                  // Count balls faced (simplified)
                  const ballsFaced = inning.overs.flatMap(over => 
                    over.balls.filter(ball => ball.batsmanId === batsmanId)
                  ).length;
                  
                  return (
                    <TableRow key={batsmanId}>
                      <TableCell>{player?.name || batsmanId}</TableCell>
                      <TableCell align="right">{runs}</TableCell>
                      <TableCell align="right">{ballsFaced}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </Box>
  );
};

// Football-specific view
const FootballView = ({ activity }) => {
  const football = activity.game as Football;
  
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Match Summary</Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 4 }}>
        {activity.teams?.map(team => (
          <Box key={team.id} sx={{ textAlign: 'center' }}>
            <Typography variant="h6">{team.name}</Typography>
            <Typography variant="h3" fontWeight="bold">
              {football.getTotalGoals(team.id)}
            </Typography>
            <Typography variant="body2" color="text.secondary">Goals</Typography>
          </Box>
        ))}
      </Box>
      
      {/* Goal scorers */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
          Goals
        </Typography>
        {football.stats?.map((teamStat) => {
          const team = activity.teams.find(t => t.id === teamStat.teamId);
          return teamStat.goals.map((goal, idx) => {
            const scorer = activity.getPlayer(goal.playerId);
            return (
              <Box key={`${goal.playerId}-${idx}`} sx={{ display: 'flex', mb: 1 }}>
                <EmojiEventsIcon color="primary" sx={{ mr: 1 }} />
                <Typography>
                  {scorer?.name || 'Unknown Player'} 
                  <Typography component="span" color="text.secondary">
                    {' '}({team?.name})
                  </Typography>
                </Typography>
              </Box>
            );
          });
        })}
      </Box>

      {/* Cards */}
      {football.stats?.some(stat => stat.redCards?.length > 0 || stat.yellowCards?.length > 0) && (
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            Cards
          </Typography>
          {football.stats?.flatMap(teamStat => [
            ...teamStat.yellowCards.map(card => ({
              playerId: card.playerId,
              teamId: teamStat.teamId,
              type: 'yellow'
            })),
            ...teamStat.redCards.map(card => ({
              playerId: card.playerId,
              teamId: teamStat.teamId,
              type: 'red'
            }))
          ]).map((card, idx) => {
            const player = activity.getPlayer(card.playerId);
            const team = activity.teams.find(t => t.id === card.teamId);
            return (
              <Box key={idx} sx={{ display: 'flex', mb: 1 }}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 24, 
                    bgcolor: card.type === 'red' ? '#f44336' : '#ffeb3b', 
                    mr: 1,
                    borderRadius: 0.5
                  }} 
                />
                <Typography>
                  {player?.name || 'Unknown Player'} 
                  <Typography component="span" color="text.secondary">
                    {' '}({team?.name})
                  </Typography>
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

// Basketball-specific view
const BasketballView = ({ activity }) => {
  const basketball = activity.game as Basketball;
  
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Game Summary</Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 4 }}>
        {activity.teams?.map(team => (
          <Box key={team.id} sx={{ textAlign: 'center' }}>
            <Typography variant="h6">{team.name}</Typography>
            <Typography variant="h3" fontWeight="bold">
              {basketball.getTotalPoints(team.id)}
            </Typography>
            <Typography variant="body2" color="text.secondary">Points</Typography>
          </Box>
        ))}
      </Box>

      {/* Top Scorers */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
          Top Scorers
        </Typography>
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Team</TableCell>
                <TableCell align="right">Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {basketball.stats?.flatMap(teamStat => 
                teamStat.points.map(point => ({
                  ...point,
                  teamId: teamStat.teamId
                }))
              )
              .sort((a, b) => b.points - a.points)
              .slice(0, 5)
              .map((score, idx) => {
                const player = activity.getPlayer(score.playerId);
                const team = activity.teams.find(t => t.id === score.teamId);
                
                return (
                  <TableRow key={idx}>
                    <TableCell>{player?.name || 'Unknown Player'}</TableCell>
                    <TableCell>{team?.name}</TableCell>
                    <TableCell align="right">{score.points}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

// Generic sport view for other sports
const GenericSportView = ({ activity }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Game Summary</Typography>
      
      {activity.game?.points && (
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 4 }}>
          {activity.game.points.map((score, idx) => {
            const team = activity.teams.find(t => t.id === score.teamId);
            return (
              <Box key={idx} sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{team?.name || `Team ${idx + 1}`}</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {score.points}
                </Typography>
                <Typography variant="body2" color="text.secondary">Points</Typography>
              </Box>
            );
          })}
        </Box>
      )}
      
      {!activity.game?.points && (
        <Typography>
          No detailed score information available for this activity.
        </Typography>
      )}
    </Box>
  );
};

// Cultural Activity View
const CulturalActivityView = ({ activity }) => {
  return (
    <Box>
      <Section>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Performance Details
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="body1">
            {activity.performanceDetails || 
              "Experience the magic of this cultural showcase featuring talented performers across various art forms."}
          </Typography>
        </Paper>
      </Section>
      
      <Section>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Performers
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {activity.participants?.map((participant, idx) => (
            <Paper 
              key={participant.usn || idx} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                width: 200,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  sx={{ width: 80, height: 80, mb: 2 }}
                  alt={participant.name}
                  src={`https://i.pravatar.cc/150?u=${participant.usn || idx}`}
                />
                <Typography variant="h6" align="center">{participant.name}</Typography>
                <Chip 
                  size="small" 
                  label={participant.gender === Gender.MALE ? 'Male' : 
                         participant.gender === Gender.FEMALE ? 'Female' : 'Other'} 
                  sx={{ mt: 1 }}
                />
              </Box>
            </Paper>
          ))}
        </Box>
      </Section>
    </Box>
  );
};

// Tech Activity View
const TechActivityView = ({ activity }) => {
  return (
    <Box>
      <Section>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Activity Details
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="body1">
            Immerse yourself in this tech-focused activity featuring innovative challenges and learning experiences.
          </Typography>
        </Paper>
      </Section>
      
      {/* For tech activities like coding or hackathons */}
      <Section>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Participants
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>USN</TableCell>
                <TableCell>Project</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activity.participants?.map((participant, idx) => (
                <TableRow key={participant.usn || idx}>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.usn}</TableCell>
                  <TableCell>Project {idx + 1}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>
    </Box>
  );
};

// General Activity View
const GeneralActivityView = ({ activity }) => {
  return (
    <Box>
      <Section>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Activity Details
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="body1">
            Join us for this exciting activity featuring engaged participants and memorable experiences.
          </Typography>
        </Paper>
      </Section>
      
      <Section>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Participants
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {activity.participants?.map((participant, idx) => (
            <Chip
              key={participant.usn || idx}
              avatar={<Avatar alt={participant.name} src={`https://i.pravatar.cc/150?u=${participant.usn || idx}`} />}
              label={participant.name}
              variant="outlined"
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
      </Section>
    </Box>
  );
};

// Players Tab for Sports Activities
const PlayersTab = ({ activity }) => {
  return (
    <Box>
      {activity.teams?.map(team => (
        <Box key={team.id} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{team.name}</Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Player</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell align="right">Stat</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activity.getTeamPlayers?.(team.id)?.map((player, idx) => (
                  <TableRow key={player.usn || idx}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ mr: 2, width: 32, height: 32 }}
                          alt={player.name}
                          src={`https://i.pravatar.cc/150?u=${player.usn || idx}`}
                        />
                        {player.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {player.stats?.position || 'Player'}
                    </TableCell>
                    <TableCell align="right">
                      {getPlayerStatDisplay(activity.eventType, player, activity.game)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
};

// Statistics Tab
const StatisticsTab = ({ activity }) => {
  const getStatContent = () => {
    switch (activity.eventType) {
      case EventType.CRICKET:
        return <CricketStats activity={activity} />;
      case EventType.BASKETBALL:
        return <BasketballStats activity={activity} />;
      case EventType.FOOTBALL:
        return <FootballStats activity={activity} />;
      default:
        return <GenericStats activity={activity} />;
    }
  };
  
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Performance Statistics</Typography>
      {getStatContent()}
    </Box>
  );
};

// Helper function to display player stats based on sport
const getPlayerStatDisplay = (eventType, player, game) => {
  switch (eventType) {
    case EventType.CRICKET:
      return `${game?.getPlayerRuns?.(player.usn) || 0} runs`;
    case EventType.FOOTBALL:
      // Find goals for this player
      const goals = game?.stats?.flatMap(s => 
        s.goals?.filter(g => g.playerId === player.usn)
      )?.length || 0;
      return `${goals} goals`;
    case EventType.BASKETBALL:
      // Find points for this player
      let points = 0;
      game?.stats?.forEach(teamStat => {
        const playerPoints = teamStat.points?.find(p => p.playerId === player.usn);
        if (playerPoints) points = playerPoints.points;
      });
      return `${points} points`;
    default:
      return '-';
  }
};

// Sport-specific stat components
const CricketStats = ({ activity }) => (
  <Box>
    <Typography>Total Overs: {activity.game.totalOvers}</Typography>
    {/* Add more cricket-specific stats */}
  </Box>
);

const FootballStats = ({ activity }) => (
  <Box>
    <Typography>Total Goals: {activity.game.getTotalGoals()}</Typography>
    {/* Add more football-specific stats */}
  </Box>
);

const BasketballStats = ({ activity }) => (
  <Box>
    <Typography>Total Points: {activity.game.getTotalPoints()}</Typography>
    {/* Add more basketball-specific stats */}
  </Box>
);

const GenericStats = ({ activity }) => (
  <Box>
    <Typography>Total Participants: {activity.participants?.length || 0}</Typography>
    {/* Add generic stats */}
  </Box>
);

// Loading Skeleton
const ActivitySkeleton = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <Box sx={{ width: 48, height: 48, borderRadius: '50%', mr: 2 }}>
        <Box component="span" sx={{ bgcolor: 'background.paper', boxShadow: 1 }} />
      </Box>
      <Box sx={{ height: 40, width: '60%' }} component="span" />
    </Box>
    
    <Paper sx={{ height: 200, mb: 4 }} />
    
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
      {[1, 2].map(i => (
        <Paper key={i} sx={{ height: 100, flex: 1 }} />
      ))}
    </Box>
    
    <Paper sx={{ height: 300 }} />
  </Container>
);

// Not Found Component
const ActivityNotFound = ({ eventId }) => (
  <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
    <Typography variant="h4" sx={{ mb: 2 }}>
      Activity Not Found
    </Typography>
    <Typography variant="body1" sx={{ mb: 4 }}>
      No activity found for event with ID: {eventId}
    </Typography>
    <Link to="/" style={{ textDecoration: 'none' }}>
      <Typography variant="button" color="primary">
        Go back to Events
      </Typography>
    </Link>
  </Container>
);

export default ActivityPage;