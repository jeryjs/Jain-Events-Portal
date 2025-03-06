import { useState } from 'react';
import { Box, Paper, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Alert, InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Participant } from '@common/models';
import SportsPlayer from '@common/models/sports/SportsPlayer';

interface ParticipantsFormProps {
    participants: (Participant | SportsPlayer)[];
    setParticipants: (participants: (Participant | SportsPlayer)[]) => void;
    teams?: any[];
}

const initialFormState = {
    name: '',
    usn: '',
    branch: '',
    phone: '',
    email: '',
};

export const ParticipantsForm = ({ participants, setParticipants, teams = [] }: ParticipantsFormProps) => {
    const [open, setOpen] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [formValues, setFormValues] = useState(initialFormState);
    const [error, setError] = useState('');
    const [teamId, setTeamId] = useState('');

    const handleOpen = () => {
        setFormValues(initialFormState);
        setEditIndex(null);
        setError('');
        setOpen(true);
        setTeamId('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleEdit = (index: number) => {
        setEditIndex(index);
        const editingParticipant = participants[index];
        setFormValues({
            name: editingParticipant.name || '',
            usn: editingParticipant.usn || '',
            branch: editingParticipant.branch || '',
            phone: editingParticipant.phone || '',
            email: editingParticipant.email || '',
        });
        if (teams.length > 0 && editingParticipant instanceof SportsPlayer) {
            setTeamId(editingParticipant.teamId);
        } else {
            setTeamId('');
        }
        setOpen(true);
    };

    const handleDeleteParticipant = (index: number) => {
        const newParticipants = [...participants];
        newParticipants.splice(index, 1);
        setParticipants(newParticipants);
    };

    const handleChange = (field: string, value: any) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!formValues.name?.trim()) {
            setError('Name is required.');
            return false;
        }
        if (teams.length > 0 && !teamId) {
            setError('Team is required.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSave = () => {
        if (!validateForm()) return;

        let newParticipant;

        if (teams.length > 0) {
            newParticipant = SportsPlayer.parse({ ...formValues, teamId });
        } else {
            newParticipant = Participant.parse(formValues);
        }

        if (editIndex !== null) {
            const newParticipants = [...participants];
            newParticipants[editIndex] = newParticipant;
            setParticipants(newParticipants);
        } else {
            setParticipants([...participants, newParticipant]);
        }
        handleClose();
    };

    return (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Participants</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} size="small">
                    Add Participant
                </Button>
            </Box>
            <List>
                {participants.map((p, index) => (
                    <ListItem
                        key={p.usn || index}
                        divider
                        secondaryAction={
                            <Box>
                                <IconButton edge="end" onClick={() => handleEdit(index)} size="small">
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton edge="end" onClick={() => handleDeleteParticipant(index)} size="small">
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        }
                    >
                        <ListItemText
                            primary={p.name}
                            secondary={p.detailsString}
                        />
                    </ListItem>
                ))}
            </List>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editIndex !== null ? 'Edit Participant' : 'Add Participant'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {error && (
                            <Grid item xs={12}>
                                <Alert severity="error">{error}</Alert>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                label="Name"
                                value={formValues.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                fullWidth
                                required
                                error={!!error}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="USN"
                                value={formValues.usn || ''}
                                onChange={(e) => handleChange('usn', e.target.value)}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Branch"
                                value={formValues.branch || ''}
                                onChange={(e) => handleChange('branch', e.target.value)}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Phone"
                                value={formValues.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                fullWidth
                                placeholder="Phone number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email"
                                type="email"
                                value={formValues.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                                fullWidth
                                placeholder="Email address"
                            />
                        </Grid>
                        {teams.length > 0 && (
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="team-select-label">Team</InputLabel>
                                    <Select
                                        labelId="team-select-label"
                                        id="team-select"
                                        value={teamId}
                                        label="Team"
                                        onChange={(e) => setTeamId(e.target.value)}
                                        required
                                        error={!!error && !teamId}
                                    >
                                        {teams.map((team) => (
                                            <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={!formValues.name?.trim() || (teams.length > 0 && !teamId)}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};
