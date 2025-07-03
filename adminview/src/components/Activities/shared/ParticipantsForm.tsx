import { Participant, TeamParticipant } from '@common/models';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem, Paper, Select, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { useState, useEffect, useRef } from 'react';

interface ParticipantsFormProps {
    participants: Participant[];
    setParticipants: (participants: Participant[]) => void;
    teams?: { id: string, name: string }[];
    defaultTeam?: string;
}

export const ParticipantsForm = ({ participants, setParticipants, teams = [], defaultTeam }: ParticipantsFormProps) => {
    const [open, setOpen] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [formValues, setFormValues] = useState<Participant | null>(null);
    
    const [error, setError] = useState('');
    const [isJsonMode, setIsJsonMode] = useState(false);
    const [jsonValue, setJsonValue] = useState('');
    const [jsonError, setJsonError] = useState('');

    // Debounce timer for JSON updates
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Create initial form values
    const createInitialFormValues = () => {
        if (defaultTeam) return TeamParticipant.parse({ teamId: defaultTeam });
        return Participant.parse({});
    };

    // Initialize form values when needed
    useEffect(() => {
        if (!formValues && open) {
            setFormValues(createInitialFormValues());
        }
    }, [formValues, open]);

    // Update JSON when participants change (only when in JSON mode)
    useEffect(() => {
        if (isJsonMode) {
            try {
                setJsonValue(JSON.stringify(participants, null, 2));
                setJsonError('');
            } catch (err) {
                console.error('Error stringifying participants:', err);
            }
        }
    }, [participants, isJsonMode]);

    // Handle JSON mode toggle
    const handleToggleJsonMode = () => {
        if (!isJsonMode) {
            // Switching to JSON mode - update the JSON value
            try {
                setJsonValue(JSON.stringify(participants, null, 2));
                setJsonError('');
            } catch (err) {
                console.error('Error stringifying participants:', err);
                setJsonError('Error converting participants to JSON');
            }
        }
        setIsJsonMode(!isJsonMode);
    };

    // Handle JSON text changes with auto-update functionality
    const handleJsonChange = (value: string) => {
        setJsonValue(value);

        // Clear previous timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Set a small delay to avoid excessive updates during typing
        timerRef.current = setTimeout(() => {
            try {
                // Validate JSON syntax
                const parsed = JSON.parse(value);

                // Validate it's an array
                if (!Array.isArray(parsed)) {
                    setJsonError('JSON must be an array of participants');
                    return;
                }

                // Check each item for required fields
                for (let i = 0; i < parsed.length; i++) {
                    const item = parsed[i];
                    if (!item.name) {
                        setJsonError(`Participant at index ${i} is missing required field: name`);
                        return;
                    }
                }

                // If we got here, the JSON is valid - apply it immediately
                setJsonError('');

                // Convert each item to the appropriate type
                const typedParticipants = parsed.map((p: any) => Participant.parse(p));

                // Update participants
                setParticipants(typedParticipants);

            } catch (err) {
                // Just show the error but don't update participants
                setJsonError('Invalid JSON format');
            }
        }, 300);
    };

    const handleOpen = () => {
        setFormValues(createInitialFormValues());
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
        if(!confirm("Are you sure you want to delete participant: " + participants[index].name)) return
        const newParticipants = [...participants];
        newParticipants.splice(index, 1);
        setParticipants(newParticipants);
    };

    const handleChange = (field: string, value: any) => {
        if (!formValues) return;
        
        setFormValues(prev => {
            if (teams.length > 0) {
                return TeamParticipant.parse({ ...prev, [field]: value });
            } else {
                return Participant.parse({ ...prev, [field]: value });
            }
        });
    };

    const validateForm = (): boolean => {
        if (!formValues) return false;
        
        if (!formValues.name?.trim()) {
            setError('Name is required.');
            return false;
        }
        if (!formValues.usn?.trim()) {
            setError('USN is required.');
            return false;
        }
        
        setError('');
        return true;
    };

    const handleSave = () => {
        if (!validateForm() || !formValues) return;

        const newParticipant = Participant.parse(formValues);
        const updatedParticipants = [...participants];
        
        if (editIndex !== null) {
            updatedParticipants[editIndex] = newParticipant;
        } else {
            updatedParticipants.push(newParticipant);
        }

        setParticipants(updatedParticipants);
        handleClose();
    };

    // Get participant details string
    const getParticipantDetails = (p: Participant): string => {
        return p.detailsString ?? `USN: ${p.usn ?? 'N/A'} • Branch: ${p.branch ?? 'N/A'}`;
    };

    return (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Participants</Typography>
                <Box display="flex" alignItems="center">
                    <Tooltip title={isJsonMode ? "Switch to Form View" : "Switch to JSON View"}>
                        <IconButton
                            onClick={handleToggleJsonMode}
                            color={isJsonMode ? "primary" : "default"}
                            sx={{ mr: 1 }}
                            size="small"
                        >
                            {isJsonMode ? <ViewListIcon /> : <CodeIcon />}
                        </IconButton>
                    </Tooltip>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} size="small">
                        Add Participant
                    </Button>
                </Box>
            </Box>

            {isJsonMode ? (
                // JSON Editor View
                <Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        value={jsonValue}
                        onChange={(e) => handleJsonChange(e.target.value)}
                        error={!!jsonError}
                        helperText={jsonError}
                        placeholder="Enter participants as JSON array"
                        sx={{
                            fontFamily: 'monospace',
                            '& .MuiInputBase-root': {
                                fontFamily: 'monospace',
                                fontSize: '0.875rem'
                            }
                        }}
                    />
                    <Box mt={1} px={1}>
                        <Typography variant="caption" color="text.secondary">
                            {jsonError ? 'Fix the JSON error above to apply changes' : 'Changes are applied automatically when JSON is valid'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Required format: {'[{ "name": "Name", ... }, ...]'}
                        </Typography>
                    </Box>
                </Box>
            ) : (
                // UI View
                <>
                    {participants.length === 0 && (
                        <Box py={2} textAlign="center">
                            <Typography color="text.secondary">No participants added yet</Typography>
                        </Box>
                    )}

                    {participants.length > 0 && (
                        <List>
                            {participants.map((p, index) => (
                                <ListItem
                                    key={`${p.usn || `participant-${index}`}${('teamId' in p && p.teamId) ? '-' + p.teamId : ''}`}
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
                                        secondary={getParticipantDetails(p)}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editIndex !== null ? 'Edit Participant' : 'Add Participant'}</DialogTitle>
                <DialogContent>
                    {formValues && (
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
                                    required
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
                            
                            {/* Team field shown only if teams are provided */}
                            {teams.length > 0 && (
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel id="team-select-label">Team</InputLabel>
                                        <Select
                                            labelId="team-select-label"
                                            id="team-select"
                                            value={(formValues as any).teamId || ''}
                                            label="Team"
                                            onChange={(e) => handleChange('teamId', e.target.value)}
                                            required
                                        >
                                            <MenuItem value=""><em>No Team</em></MenuItem>
                                            {teams.map((team) => (
                                                <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                            
                            {/* Position field shown only if position prop is supported */}
                            {'position' in formValues && (
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <ToggleButtonGroup
                                            value={formValues.position || 'playing'}
                                            exclusive
                                            onChange={(e, value) => handleChange('position', value)}
                                            aria-label="position"
                                            color="info"
                                            fullWidth
                                        >
                                            <ToggleButton value="playing" aria-label="playing">Participating</ToggleButton>
                                            <ToggleButton value="substitute" aria-label="substitute">Withdrawn</ToggleButton>
                                        </ToggleButtonGroup>
                                    </FormControl>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!formValues?.name?.trim() || !formValues?.usn?.trim()}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};
