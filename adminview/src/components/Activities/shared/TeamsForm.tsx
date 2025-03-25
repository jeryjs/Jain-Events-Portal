import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import slugify from '@utils/Slugify';

interface TeamsFormProps {
  teams: { id: string; name: string }[];
  setTeams: (teams: { id: string; name: string }[]) => void;
}

export const TeamsForm = ({ teams: initialTeams = [], setTeams }: TeamsFormProps) => {
  const [teams, setLocalTeams] = useState<{ id: string; name: string }[]>(initialTeams);

  useEffect(() => {
    setTeams(teams);
  }, [teams, setTeams]);

  const handleAddTeam = () => {
    setLocalTeams([...teams, { id: '', name: '' }]);
  };

  const handleNameChange = (index: number, name: string) => {
    const newTeams = [...teams];
    const id = slugify(name);
    newTeams[index] = { ...newTeams[index], name, id };
    setLocalTeams(newTeams);
  };

  const handleDeleteTeam = (index: number) => {
    const newTeams = [...teams];
    newTeams.splice(index, 1);
    setLocalTeams(newTeams);
  };

  // Validate unique team names
  const isTeamNameTaken = (name: string, index: number): boolean => {
    return teams.some((team, i) => team.name.toLowerCase() === name.toLowerCase() && i !== index);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Teams</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTeam}
          size="small"
        >
          Add Team
        </Button>
      </Box>

      <List>
        {teams.map((team, index) => (
          <ListItem key={index} divider>
            <TextField
              label="Team Name"
              value={team.name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              fullWidth
              error={isTeamNameTaken(team.name, index)}
              helperText={isTeamNameTaken(team.name, index) ? "Team name already exists" : ""}
            />
            <ListItemText
              secondary={`ID: ${team.id}`}
              sx={{ pl: 2 }}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleDeleteTeam(index)} size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {teams.length === 0 && (
        <Box py={2} textAlign="center">
          <Typography color="text.secondary">No teams added yet</Typography>
        </Box>
      )}
    </Paper>
  );
};
