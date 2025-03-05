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

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {activity.getTeamPlayers(team.id).slice(0, 5).map((player, idx) => (
                          <Avatar
                            key={player.usn || idx}
                            alt={player.name}
                            src={`https://i.pravatar.cc/150?u=${player.usn || idx}`}
                            sx={{ width: 40, height: 40 }}
                          />
                        ))}
                        {activity.getTeamPlayers(team.id).length > 5 && (
                          <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.grey[300] }}>
                            +{activity.getTeamPlayers(team.id).length - 5}
                          </Avatar>
                        )}
                      </Box>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity.teams.map(team => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell align="right">
                        {activity.getTeamPlayers(team.id).length}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
