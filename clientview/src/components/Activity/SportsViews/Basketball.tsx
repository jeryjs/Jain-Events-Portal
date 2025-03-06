import { Basketball, SportsActivity } from "@common/models";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import PlayersTab from "./PlayersTab";
import { Sport } from "@common/models/sports/SportsActivity";

// Main view component that switches between tabs
export default function BasketballView({ activity, tabValue }) {
  const basketball = activity.game as Basketball;

  return (
    <>
      {tabValue === 0 && <OverviewTab activity={activity} game={basketball} />}
      {tabValue === 1 && <PlayersTab activity={activity} />}
      {tabValue === 2 && <ScoreboardTab activity={activity} game={basketball} />}
    </>
  );
};

const OverviewTab = ({ activity, game }: { activity: SportsActivity<Sport>, game: Basketball }) => {
  const theme = useTheme();

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Team Points */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Team Scoring
              </Typography>

              {activity.teams.map(team => {
                const totalPoints = game.getTotalPoints();
                const teamPoints = game.getTotalPoints(team.id);
                return (
                  <Box key={team.id} sx={{ mb: 2, p: 2, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {team.name}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {teamPoints} pts
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={totalPoints > 0 ? (teamPoints / totalPoints) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: theme.palette.divider,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.primary.main
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Scorers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Scorers
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
                        src={`https://eu.ui-avatars.com/api/?name=${player.name || idx}&size=50`}
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
                    <Typography variant="body2" fontWeight="medium">
                      {scorer.points} pts
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Team Contribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Points Contribution
              </Typography>

              {activity.teams.map(team => {
                const contributions = game.getTeamPercentageContribution(team.id);

                if (contributions.length === 0) return null;

                return (
                  <Box key={team.id} sx={{ mb: 3 }}>
                    <Typography variant="body1" fontWeight="medium" gutterBottom>
                      {team.name}
                    </Typography>

                    {contributions.map(contribution => {
                      const player = activity.getPlayer(contribution.playerId);
                      if (!player) return null;

                      return (
                        <Box key={contribution.playerId} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">
                              {player.name}
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {contribution.percentage}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={contribution.percentage}
                            color="primary"
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                        </Box>
                      );
                    })}
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

const ScoreboardTab = ({ activity, game }: { activity: SportsActivity<Sport>, game: Basketball }) => {
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
                    <TableCell align="right">Points</TableCell>
                    <TableCell align="right">% of Team Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity.participants.map((player, idx) => {
                    const teamPoints = game.getTotalPoints(player.teamId);
                    const playerPointsData = game.stats
                      .find(ts => ts.teamId === player.teamId)
                      ?.points.find(p => p.playerId === player.usn);

                    const playerPoints = playerPointsData?.points || 0;
                    const percentage = teamPoints > 0
                      ? Math.round((playerPoints / teamPoints) * 100)
                      : 0;

                    return (
                      <TableRow key={player.usn || idx}>
                        <TableCell>{player.name}</TableCell>
                        <TableCell>
                          {activity.teams.find(t => t.id === player.teamId)?.name || ''}
                        </TableCell>
                        <TableCell align="right">{playerPoints}</TableCell>
                        <TableCell align="right">{percentage}%</TableCell>
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