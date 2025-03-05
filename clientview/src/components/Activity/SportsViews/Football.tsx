import { Football, SportsActivity } from "@common/models";
import { Sport } from "@common/models/sports/SportsActivity";
import AssistantIcon from "@mui/icons-material/Assistant";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { Avatar, Box, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from "@mui/material";

// Main view component that switches between tabs
export default function FootballView({ activity, tabValue }) {
  const football = activity.game as Football;

  return (
    <>
      {tabValue === 0 && <OverviewTab activity={activity} game={football} />}
      {tabValue === 1 && <PlayersTab activity={activity} />}
      {tabValue === 2 && <ScoreboardTab activity={activity} game={football} />}
    </>
  );
};

// Overview component
const OverviewTab = ({ activity, game }: { activity: SportsActivity<Sport>, game: Football }) => {
  const theme = useTheme();

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Match Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Match Statistics
              </Typography>
              <Grid container spacing={2}>
                {activity.teams.map(team => {
                  const cardCount = game.getTeamCardCount(team.id);
                  return (
                    <Grid item xs={12} md={6} key={team.id}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          bgcolor: theme.palette.grey[50],
                        }}
                      >
                        <Typography variant="body1" fontWeight="medium" gutterBottom>
                          {team.name}
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <SportsSoccerIcon color="primary" />
                              <Typography variant="h6" fontWeight="bold">
                                {game.getTotalGoals(team.id)}
                              </Typography>
                              <Typography variant="caption">Goals</Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Box sx={{
                                bgcolor: '#f44336',
                                width: 20,
                                height: 28,
                                display: 'inline-block',
                                borderRadius: 0.5
                              }} />
                              <Typography variant="h6" fontWeight="bold">
                                {cardCount.red}
                              </Typography>
                              <Typography variant="caption">Red Cards</Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Box sx={{
                                bgcolor: '#ffeb3b',
                                width: 20,
                                height: 28,
                                display: 'inline-block',
                                borderRadius: 0.5
                              }} />
                              <Typography variant="h6" fontWeight="bold">
                                {cardCount.yellow}
                              </Typography>
                              <Typography variant="caption">Yellow Cards</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Scorers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Goal Scorers
              </Typography>

              {game.getTopScorers(5).map((scorer, idx) => {
                const player = activity.getPlayer(scorer.playerId);
                if (!player) return null;

                return (
                  <Box
                    key={scorer.playerId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                      py: 0.5
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={`https://i.pravatar.cc/150?u=${scorer.playerId}`}
                        alt={player.name}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {player.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.teams.find(t => t.id === player.teamId)?.name || ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SportsSoccerIcon sx={{ mr: 0.5, fontSize: 16, color: theme.palette.primary.main }} />
                      <Typography variant="body2" fontWeight="medium">
                        {scorer.goals}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Assists */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Assists
              </Typography>

              {game.getTopAssists(5).map((assist, idx) => {
                const player = activity.getPlayer(assist.playerId);
                if (!player) return null;

                return (
                  <Box
                    key={assist.playerId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                      py: 0.5
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={`https://i.pravatar.cc/150?u=${assist.playerId}`}
                        alt={player.name}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {player.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.teams.find(t => t.id === player.teamId)?.name || ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssistantIcon sx={{ mr: 0.5, fontSize: 16, color: theme.palette.secondary.main }} />
                      <Typography variant="body2" fontWeight="medium">
                        {assist.assists}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Players component 
const PlayersTab = ({ activity }) => {
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

// Scoreboard component (formerly Statistics)
const ScoreboardTab = ({ activity, game }: { activity: SportsActivity<Sport>, game: Football }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Player Statistics
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Player</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell align="right">Goals</TableCell>
                    <TableCell align="right">Assists</TableCell>
                    <TableCell align="right">Red Cards</TableCell>
                    <TableCell align="right">Yellow Cards</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity.participants.map((player, idx) => {
                    // Count goals
                    const goals = game.stats.reduce((total, teamStat) => {
                      return total + teamStat.goals.filter(g => g.playerId === player.usn).length;
                    }, 0);

                    // Count assists
                    const assists = game.stats.reduce((total, teamStat) => {
                      return total + teamStat.assists.filter(a => a.playerId === player.usn).length;
                    }, 0);

                    // Count red cards
                    const redCards = game.stats.reduce((total, teamStat) => {
                      return total + teamStat.redCards.filter(c => c.playerId === player.usn).length;
                    }, 0);

                    // Count yellow cards
                    const yellowCards = game.stats.reduce((total, teamStat) => {
                      return total + teamStat.yellowCards.filter(c => c.playerId === player.usn).length;
                    }, 0);

                    return (
                      <TableRow key={player.usn || idx}>
                        <TableCell>{player.name}</TableCell>
                        <TableCell>
                          {activity.teams.find(t => t.id === player.teamId)?.name || ''}
                        </TableCell>
                        <TableCell align="right">{goals}</TableCell>
                        <TableCell align="right">{assists}</TableCell>
                        <TableCell align="right">{redCards}</TableCell>
                        <TableCell align="right">{yellowCards}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Team Statistics
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell align="right">Goals</TableCell>
                    <TableCell align="right">Red Cards</TableCell>
                    <TableCell align="right">Yellow Cards</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity.teams.map(team => {
                    const goals = game.getTotalGoals(team.id);
                    const cards = game.getTeamCardCount(team.id);

                    return (
                      <TableRow key={team.id}>
                        <TableCell>{team.name}</TableCell>
                        <TableCell align="right">{goals}</TableCell>
                        <TableCell align="right">{cards.red}</TableCell>
                        <TableCell align="right">{cards.yellow}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};