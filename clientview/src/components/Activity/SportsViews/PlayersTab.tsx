import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState, useMemo, memo } from "react";
import { Gender } from "@common/constants";
import PersonIcon from "@mui/icons-material/Person";
import WomanIcon from "@mui/icons-material/Woman";
import TagIcon from "@mui/icons-material/Tag";
import SportsIcon from "@mui/icons-material/Sports";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { Activity, SportsActivity } from "@common/models";
import { Sport } from "@common/models/sports/SportsActivity";

// Optimized PascalCase function
const toPascalCase = (name) => {
  if (!name) return "";
  const words = name.split(/\s+/);
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

interface PlayersTabProps {
  activity: SportsActivity<Sport>;
}
const PlayersTab = memo(({ activity }: PlayersTabProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);

  const handleTeamChange = (_, newValue) => {
    setSelectedTeamIndex(newValue);
  };

  const teams = useMemo(() => activity.teams || [], [activity.teams]);

  if (teams.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">No team information available</Typography>
      </Box>
    );
  }

  const selectedTeam = useMemo(() => teams[selectedTeamIndex], [
    teams,
    selectedTeamIndex,
  ]);

  const allTeamPlayers = useMemo(
    () => activity.getTeamPlayers(selectedTeam?.id),
    [activity, selectedTeam?.id]
  );

  const { playingPlayers, substitutePlayers } = useMemo(() => {
    const playing = allTeamPlayers.filter((player) => player.isPlaying);
    const substitute = allTeamPlayers.filter((player) => !player.isPlaying);
    return { playingPlayers: playing, substitutePlayers: substitute };
  }, [allTeamPlayers]);

  const PlayerListItem = ({ player, isSubstitute = false }) => (
    <ListItem
      key={player.usn || player.id}
      sx={{
        py: 1.5,
        borderRadius: 1,
        mb: 1,
        bgcolor: isSubstitute ? theme.palette.grey[100] : theme.palette.success.light + "10",
        "&:hover": {
          bgcolor: theme.palette.action.hover,
        },
      }}
    >
      <ListItemAvatar>
        <Avatar
          src={`https://eu.ui-avatars.com/api/?name=${player.name}&size=50`}
          alt={player.name}
          sx={{
            width: 48,
            height: 48,
            border: `2px solid ${isSubstitute ? theme.palette.grey[400] : theme.palette.success.main
              }`,
            opacity: isSubstitute ? 0.8 : 1,
          }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body1"
              fontWeight="medium"
              color={isSubstitute ? "text.secondary" : "initial"}
            >
              {toPascalCase(player.name)}
            </Typography>
            {player.gender === Gender.FEMALE && (
              <WomanIcon
                fontSize="small"
                sx={{ ml: 1, color: theme.palette.error.light }}
              />
            )}
            {player.gender === Gender.MALE && (
              <PersonIcon
                fontSize="small"
                sx={{ ml: 1, color: theme.palette.info.light }}
              />
            )}
          </Box>
        }
        secondary={
          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
            <TagIcon
              sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }}
            />
            <Typography variant="caption" color="text.secondary">
              {player.usn || "USN N/A"}
            </Typography>
          </Box>
        }
      />
      <Box
        sx={{
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: isSubstitute ? theme.palette.grey[200] : theme.palette.success.main + "20",
          color: isSubstitute ? theme.palette.text.secondary : theme.palette.success.dark,
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        {isSubstitute ? "Substitute" : player.stats?.position || "Position N/A"}
      </Box>
    </ListItem>
  );

  return (
    <Box>
      <Tabs
        value={selectedTeamIndex}
        onChange={handleTeamChange}
        variant={
          isMobile && teams.length > 3 ? "scrollable" : "fullWidth"
        }
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        {teams.map((team, idx) => (
          <Tab
            key={team.id}
            label={team.name}
            icon={
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  bgcolor: theme.palette.primary.dark,
                  color: theme.palette.primary.contrastText,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                }}
              >
                {activity.getTeamPlayers(team.id).length}
              </Box>
            }
            iconPosition="start"
          />
        ))}
      </Tabs>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: theme.palette.primary.dark,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}
                  >
                    {selectedTeam?.name?.charAt(0) || ""}
                  </Typography>
                </Box>
                <Typography variant="h6">{selectedTeam?.name || "Team"}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Playing Players Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <SportsIcon
                    fontSize="small"
                    sx={{ mr: 1, color: theme.palette.success.main }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    color="success.main"
                  >
                    Playing Squad ({playingPlayers.length})
                  </Typography>
                </Box>

                <List sx={{ pt: 0 }}>
                  {playingPlayers.map((player) => (
                    <PlayerListItem key={player.usn} player={player} />
                  ))}
                </List>
              </Box>

              {/* Substitutes Section */}
              {substitutePlayers.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <SubdirectoryArrowRightIcon
                      fontSize="small"
                      sx={{ mr: 1, color: theme.palette.grey[600] }}
                    />
                    <Typography
                      variant="subtitle1"
                      fontWeight="medium"
                      color="text.secondary"
                    >
                      Substitutes ({substitutePlayers.length})
                    </Typography>
                  </Box>

                  <List sx={{ pt: 0 }}>
                    {substitutePlayers.map((player) => (
                      <PlayerListItem
                        key={player.usn || 'player'}
                        player={player}
                        isSubstitute={true}
                      />
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
});

export default PlayersTab;
