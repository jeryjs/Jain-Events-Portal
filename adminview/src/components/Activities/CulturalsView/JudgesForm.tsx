import { useState, useEffect, useRef } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemText, Paper, TextField, Tooltip, Typography, Alert, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CodeIcon from '@mui/icons-material/Code';
import ViewListIcon from '@mui/icons-material/ViewList';
import PersonIcon from '@mui/icons-material/Person';
import Judge from '@common/models/culturals/Judge';

interface JudgesFormProps {
    judges: Judge[];
    setJudges: (judges: Judge[]) => void;
}

export const JudgesForm = ({ judges, setJudges }: JudgesFormProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [formValues, setFormValues] = useState<Omit<Judge, 'gender' | 'eventType' | 'usn' | 'branch' | 'phone' | 'email'>>(Judge.parse({}));
    const [error, setError] = useState('');
    const [isJsonMode, setIsJsonMode] = useState(false);
    const [jsonValue, setJsonValue] = useState('');
    const [jsonError, setJsonError] = useState('');

    // Debounce timer for JSON updates
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Update JSON when judges change (only when in JSON mode)
    useEffect(() => {
        if (isJsonMode) {
            try {
                setJsonValue(JSON.stringify(judges, null, 2));
                setJsonError('');
            } catch (err) {
                console.error('Error stringifying judges:', err);
            }
        }
    }, [judges, isJsonMode]);

    // Handle JSON mode toggle
    const handleToggleJsonMode = () => {
        if (!isJsonMode) {
            // Switching to JSON mode - update the JSON value
            try {
                setJsonValue(JSON.stringify(judges, null, 2));
                setJsonError('');
            } catch (err) {
                console.error('Error stringifying judges:', err);
                setJsonError('Error converting judges to JSON');
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
                    setJsonError('JSON must be an array of judges');
                    return;
                }

                // Check each item for required fields
                for (let i = 0; i < parsed.length; i++) {
                    const item = parsed[i];
                    if (!item.name) {
                        setJsonError(`Judge at index ${i} is missing required field: name`);
                        return;
                    }
                }

                // If we got here, the JSON is valid - apply it immediately
                setJsonError('');
                setJudges(parsed.map((judgeData: any) => Judge.parse(judgeData)));
            } catch (err) {
                // Just show the error but don't update judges
                setJsonError('Invalid JSON format');
            }
        }, 300);
    };

    const handleOpen = () => {
        setFormValues(Judge.parse({}));
        setEditIndex(null);
        setError('');
        setIsDialogOpen(true);
    };

    const handleClose = () => {
        setIsDialogOpen(false);
    };

    const handleEdit = (index: number) => {
        setEditIndex(index);
        setFormValues(judges[index]);
        setIsDialogOpen(true);
    };

    const handleDeleteJudge = (index: number) => {
        const newJudges = [...judges];
        newJudges.splice(index, 1);
        setJudges(newJudges);
    };

    const handleChange = (field: keyof Judge, value: any) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!formValues.name?.trim()) {
            setError('Name is required.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSave = () => {
        if (!validateForm()) return;

        const newJudge = new Judge(
            formValues.id || `judge-${Date.now()}`,
            formValues.name,
            formValues.profilePic || '',
            formValues.description || '',
            formValues.portfolio || ''
        );

        const updatedJudges = [...judges];
        if (editIndex !== null) {
            updatedJudges[editIndex] = newJudge;
        } else {
            updatedJudges.push(newJudge);
        }

        setJudges(updatedJudges);
        handleClose();
    };

    return (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Judges</Typography>
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
                        Add Judge
                    </Button>
                </Box>
            </Box>

            {isJsonMode ? (
                <Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        value={jsonValue}
                        onChange={(e) => handleJsonChange(e.target.value)}
                        error={!!jsonError}
                        helperText={jsonError}
                        placeholder="Enter judges as JSON array"
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
                            Required format: {'[{"name": "Judge Name", "profileUrl": "url", "description": "bio", "links": "html" }]'}
                        </Typography>
                    </Box>
                </Box>
            ) : (
                <>
                    {judges?.length === 0 ? (
                        <Box py={2} textAlign="center">
                            <Typography color="text.secondary">No judges added yet</Typography>
                        </Box>
                    ) : (
                        <List>
                            {judges?.map((judge, index) => (
                                <ListItem
                                    key={judge.id || index}
                                    divider
                                    secondaryAction={
                                        <Box>
                                            <IconButton edge="end" onClick={() => handleEdit(index)} size="small">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton edge="end" onClick={() => handleDeleteJudge(index)} size="small">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    }
                                >
                                    <ListItemAvatar>
                                        {judge.profilePic ? (
                                            <Avatar src={judge.profilePic} alt={judge.name} />
                                        ) : (
                                            <Avatar>
                                                <PersonIcon />
                                            </Avatar>
                                        )}
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={judge.name}
                                        secondary={judge.description || 'No description provided'}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </>
            )}

            <Dialog open={isDialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{editIndex !== null ? 'Edit Judge' : 'Add Judge'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {error && (
                            <Grid item xs={12}>
                                <Alert severity="error">{error}</Alert>
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
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
                                label="Profile Image URL"
                                value={formValues.profilePic || ''}
                                onChange={(e) => handleChange('profilePic', e.target.value)}
                                fullWidth
                                placeholder="https://example.com/image.jpg"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                value={formValues.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Brief biography or description of the judge"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Portfolio (HTML)"
                                value={formValues.portfolio || ''}
                                onChange={(e) => handleChange('portfolio', e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="<iframe src='https://www.instagram.com/p/YOUR_POST_ID/embed'></iframe><br/>
                                    <iframe src='https://www.youtube.com/embed/YOUR_VIDEO_ID' allowfullscreen></iframe>"
                                helperText="Design a portfolio for the judge with embeds and other content"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!formValues.name?.trim()}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};
