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
  useTheme 
} from "@mui/material";
import { useState } from "react";
import { Gender } from "@common/constants";
import PersonIcon from "@mui/icons-material/Person";
import WomanIcon from "@mui/icons-material/Woman";
import TagIcon from "@mui/icons-material/Tag";

const PlayersTab = ({ activity }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  
  const handleTeamChange = (_, newValue) => {
    setSelectedTeamIndex(newValue);
  };
  
  if (!activity.teams || activity.teams.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">No team information available</Typography>
      </Box>
    );
  }

  const selectedTeam = activity.teams[selectedTeamIndex];
  const teamPlayers = activity.getTeamPlayers(selectedTeam.id);
  
  return (
    <Box>
      <Tabs
        value={selectedTeamIndex}
        onChange={handleTeamChange}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {activity.teams.map((team, idx) => (
          <Tab 
            key={team.id} 
            label={team.name}
            icon={
              <Box 
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: theme.palette.primary.dark,
                  color: theme.palette.primary.contrastText,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.dark,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1
                  }}
                >
                  <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText, fontWeight: 'bold' }}>
                    {selectedTeam.name.charAt(0)}
                  </Typography>
                </Box>
                <Typography variant="h6">{selectedTeam.name}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <List sx={{ pt: 0 }}>
                {teamPlayers.map((player, idx) => (
                  <ListItem 
                    key={player.usn || idx}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        bgcolor: theme.palette.action.hover
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={`https://eu.ui-avatars.com/api/?name=${player.name || idx}&size=50`}
                        alt={player.name}
                        sx={{
                          width: 48,
                          height: 48,
                          border: `2px solid ${selectedTeamIndex === 0 
                            ? theme.palette.primary.main 
                            : theme.palette.secondary.main}`
                        }}
                      />
                    </ListItemAvatar>
                    
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight="medium">
                            {player.name}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <TagIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
                          <Typography variant="caption" color="text.secondary">
                            {player.usn}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    {player.stats?.position && (
                      <Box 
                        sx={{ 
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: theme.palette.grey[100],
                          color: theme.palette.text.secondary,
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        {player.stats.position}
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlayersTab;
