import { OtherSport, SportsActivity } from "@common/models";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from "@mui/material";
import PlayersTab from "./PlayersTab";
import { Sport } from "@common/models/sports/SportsActivity";

// Main view component that switches between tabs
export default function GenericView({ activity, tabValue }) {
  const sport = activity.game as OtherSport;

  return (
    <>
      {tabValue === 0 && <OverviewTab activity={activity} game={sport} />}
      {tabValue === 1 && <PlayersTab activity={activity} />}
      {tabValue === 2 && <ScoreboardTab activity={activity} game={sport} />}
    </>
  );
};

const OverviewTab = ({ activity, game }: { activity: SportsActivity<Sport>, game: OtherSport }) => {
  const theme = useTheme();

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Teams Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Teams
              </Typography>

              <Grid container spacing={2}>
                {activity.teams?.map(team => (
                  <Grid item xs={12} md={6} key={team.id}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: theme.palette.grey[50],
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {team.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.getTeamPlayers(team.id).length} Players
                        </Typography>
                      </Box>

                      {/* Playing Players */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="success.main" sx={{ mb: 1, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                          <Box
                            component="span"
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'success.main',
                              display: 'inline-block',
                              mr: 1
                            }}
                          />
                          Playing
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {activity.getTeamPlayers(team.id)
                            .filter(player => player.isPlaying)
                            .slice(0, 5).map((player, idx) => (
                              <Avatar
                                key={player.usn || idx}
                                alt={player.name}
                                src={`https://eu.ui-avatars.com/api/?name=${player.name}&size=50`}
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  border: `2px solid ${theme.palette.success.main}`
                                }}
                              />
                            ))}
                          {activity.getTeamPlayers(team.id).filter(p => p.isPlaying).length > 5 && (
                            <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.success.light, color: theme.palette.success.contrastText }}>
                              +{activity.getTeamPlayers(team.id).filter(p => p.isPlaying).length - 5}
                            </Avatar>
                          )}
                        </Box>
                      </Box>
                      
                      {/* Substitutes */}
                      {activity.getTeamPlayers(team.id).filter(p => !p.isPlaying).length > 0 && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                            <Box
                              component="span"
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'grey.500',
                                display: 'inline-block',
                                mr: 1
                              }}
                            />
                            Substitutes
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {activity.getTeamPlayers(team.id)
                              .filter(player => !player.isPlaying)
                              .slice(0, 3).map((player, idx) => (
                                <Avatar
                                  key={player.usn || idx}
                                  alt={player.name}
                                  src={`https://eu.ui-avatars.com/api/?name=${player.name}&size=50`}
                                  sx={{ 
                                    width: 36, 
                                    height: 36, 
                                    opacity: 0.7,
                                    border: `2px solid ${theme.palette.grey[400]}`
                                  }}
                                />
                              ))}
                            {activity.getTeamPlayers(team.id).filter(p => !p.isPlaying).length > 3 && (
                              <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.grey[300] }}>
                                +{activity.getTeamPlayers(team.id).filter(p => !p.isPlaying).length - 3}
                              </Avatar>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Details
              </Typography>

              <Box sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: theme.palette.grey[50],
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <Typography variant="body1">
                  This exciting {activity.name} event features {activity.teams?.length || 0} teams
                  with a total of {activity.getTotalParticipants()} participants competing for the top position.
                </Typography>

                {game.winner && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon color="primary" />
                    <Typography variant="body1" fontWeight="medium">
                      Winner: {activity.teams?.find(t => t.id === game.winner)?.name || 'Unknown Team'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const ScoreboardTab = ({ activity, game }: { activity: SportsActivity<Sport>, game: OtherSport }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Match Information
            </Typography>

            <Box sx={{ py: 2 }}>
              <Typography variant="body1">
                <strong>Total Teams:</strong> {activity.teams.length}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1">
                <strong>Total Participants:</strong> {activity.getTotalParticipants()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Team Composition
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell align="right">Total Players</TableCell>
                    <TableCell align="right">Playing</TableCell>
                    <TableCell align="right">Substitutes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity.teams.map(team => {
                    const allPlayers = activity.getTeamPlayers(team.id);
                    const playingPlayers = allPlayers.filter(p => p.isPlaying);
                    const substitutePlayers = allPlayers.filter(p => !p.isPlaying);
                    
                    return (
                      <TableRow key={team.id}>
                        <TableCell>{team.name}</TableCell>
                        <TableCell align="right">
                          {allPlayers.length}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'medium' }}>
                          {playingPlayers.length}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary' }}>
                          {substitutePlayers.length}
                        </TableCell>
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
}
