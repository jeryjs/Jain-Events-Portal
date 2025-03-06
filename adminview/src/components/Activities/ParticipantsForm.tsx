import { Participant, SportsPlayer } from '@common/models';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { useState } from 'react';

type ParticipantType = SportsPlayer | Participant;

interface ParticipantsFormProps {
    participants: ParticipantType[];
    setParticipants: (participants: ParticipantType[]) => void;
    teams?: any[];
}

const initialFormState: Partial<ParticipantType> = {
    name: '',
    usn: '',
    branch: '',
    phone: '',
    email: '',
    teamId: '',
};

export const ParticipantsForm = ({ participants, setParticipants, teams = [] }: ParticipantsFormProps) => {
    const [open, setOpen] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [formValues, setFormValues] = useState(initialFormState);
    const [error, setError] = useState('');

    const handleOpen = () => {
        setFormValues(initialFormState);
        setEditIndex(null);
        setError('');
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleEdit = (index: number) => {
        setEditIndex(index);
        setFormValues(participants[index]);
        setOpen(true);
    };

    const handleDeleteParticipant = (index: number) => {
        const newParticipants = [...participants];
        newParticipants.splice(index, 1);
        setParticipants(newParticipants);
    };

    const handleChange = (field: string, value: any) => {
        if (teams.length>0) {
            setFormValues(prev => SportsPlayer.parse({ ...prev, [field]: value }));
        } else {
            setFormValues(prev => Participant.parse({ ...prev, [field]: value }));
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;
        if (!formValues.name?.trim()) {
            setError('Name is required.');
            isValid = false;
        } else if (teams.length>0 && !formValues.teamId) {
            setError('Team is required.');
            isValid = false;
        } else {
            setError('');
        }
        return isValid;
    };

    const handleSave = () => {
        if (!validateForm()) return;

        let newParticipant: Participant | SportsPlayer;

        if (teams.length>0) {
            newParticipant = SportsPlayer.parse({ ...formValues, teamId: formValues.teamId });
        } else {
            newParticipant = Participant.parse(formValues);
        }

        const updatedParticipants = [...participants];
        if (editIndex !== null) {
            updatedParticipants[editIndex] = newParticipant;
        } else {
            updatedParticipants.push(newParticipant);
        }

        setParticipants(updatedParticipants);
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

            {participants.length === 0 && (
                <Box py={2} textAlign="center">
                    <Typography color="text.secondary">No participants added yet</Typography>
                </Box>
            )}

            {participants.length > 0 && (
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
                                secondary={
                                    <>
                                        {p.usn && `USN: ${p.usn}`}
                                        {p.branch && ` • ${p.branch}`}
                                        {'teamId' in p && teams.find(t => t.id === p.teamId)?.name &&
                                            ` • Team: ${teams.find(t => t.id === p.teamId)?.name}`}
                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}

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
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="USN"
                                value={formValues.usn || ''}
                                onChange={(e) => handleChange('usn', e.target.value)}
                                fullWidth
                                helperText="Leave blank to auto-generate"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Branch"
                                value={formValues.branch || ''}
                                onChange={(e) => handleChange('branch', e.target.value)}
                                fullWidth
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
                        {teams.length>0 && (
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="team-select-label">Team</InputLabel>
                                    <Select
                                        labelId="team-select-label"
                                        id="team-select"
                                        value={formValues.teamId || ''}
                                        label="Team"
                                        onChange={(e) => handleChange('teamId', e.target.value)}
                                        required
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
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!formValues.name?.trim() || (teams.length>0 && !formValues.teamId)}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};
