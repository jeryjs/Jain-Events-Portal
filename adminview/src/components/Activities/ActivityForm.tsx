import { useEffect, useState, memo, useCallback } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box, Button, CircularProgress, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { ClearIcon, renderTimeViewClock } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

import { EventType } from '@common/constants';
import { Activity, CulturalActivity, SportsActivity } from '@common/models';
import { Sport } from '@common/models/sports/SportsActivity';
import { getBaseEventType } from '@common/utils';

import { CulturalsView } from './CulturalsView';
import { GeneralView } from './GeneralView';
import { SportsView } from './SportsView';

interface ActivityFormProps {
    eventId?: string;
    activity: Activity | null;
    isCreating: boolean;
    onSave: (formData: Activity) => Promise<void>;
    onDelete?: (activityId: string) => Promise<void>;
}

const MemoizedSportsView = memo(SportsView);
const MemoizedCulturalsView = memo(CulturalsView);
const MemoizedGeneralView = memo(GeneralView);

export const ActivityForm = ({ eventId, activity, isCreating, onSave, onDelete }: ActivityFormProps) => {
    const [formData, setFormData] = useState<Partial<Activity>>({
        id: '',
        name: '',
        eventType: EventType.GENERAL,
        startTime: new Date(),
        endTime: undefined,  // Add endTime field with default undefined
        participants: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form with activity data if editing - with cleanup
    useEffect(() => {
        let isMounted = true;
        
        if (activity && isMounted) {
            setFormData(Activity.parse(activity));
        } else if (isMounted) {
            // Reset form if creating new activity
            setFormData(Activity.parse({
                id: '',
                name: '',
                eventType: EventType.GENERAL,
                startTime: new Date(),
                endTime: undefined,
                participants: [],
            }));
        }
        
        return () => {
            isMounted = false;
        };
    }, [activity]);

    // Handle form field changes
    const handleChange = useCallback((field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Form validation
    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Activity name is required';
        }

        if (!formData.eventType) {
            newErrors.eventType = 'Activity type is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData.name, formData.eventType]);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // Ensure we have an ID if we're creating
            const dataToSave = {
                ...formData,
                id: formData.id || `activity_${Date.now()}`,
                eventId: eventId
            } as Activity;

            await onSave(dataToSave);
        } catch (error) {
            console.error('Error saving activity:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [validateForm, formData, eventId, onSave]);

    // Handle delete button click
    const handleDelete = useCallback(async () => {
        if (!activity?.id || !onDelete) return;
        
        if (window.confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
            setIsSubmitting(true);
            try {
                await onDelete(activity.id);
            } catch (error) {
                console.error('Error deleting activity:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [activity?.id, onDelete]);

    // Render different view based on activity type - memoized
    const renderActivityTypeSpecificView = useCallback(() => {
        switch (getBaseEventType(formData.eventType)) {
            case EventType.SPORTS:
                return <MemoizedSportsView formData={formData as SportsActivity<Sport>} setFormData={setFormData} />;
            case EventType.CULTURAL:
                return <MemoizedCulturalsView formData={formData as CulturalActivity} setFormData={setFormData} />;
            case EventType.TECH:
                return <MemoizedGeneralView formData={formData} setFormData={setFormData} />; // Use GeneralView for Tech for now
            default:
                return <MemoizedGeneralView formData={formData} setFormData={setFormData} />;
        }
    }, [formData]);
    const eventTypes = Object.entries(EventType).map(([key, value]) => ({ key, value }));

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                {isCreating ? 'Create New Activity' : 'Edit Activity'}
            </Typography>

            <Box component="form" noValidate sx={{ textAlign: 'left' }}>
                {/* Basic Details Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Basic Details</Typography>

                    <TextField
                        fullWidth
                        label="Activity Name"
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        margin="normal"
                        error={!!errors.name}
                        helperText={errors.name}
                        required
                    />

                    <FormControl fullWidth margin="normal" error={!!errors.eventType}>
                        <InputLabel>Activity Type</InputLabel>
                        <Select
                            value={formData.eventType || ''}
                            label="Activity Type"
                            onChange={(e) => handleChange('eventType', e.target.value)}
                        >
                            {eventTypes.map(({ key, value }) => (
                                Number(value) && <MenuItem key={key} value={value}>{key}</MenuItem>
                            ))}
                        </Select>
                        {errors.eventType && <Typography color="error">{errors.eventType}</Typography>}
                    </FormControl>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6} display="flex" alignItems="center">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    label="Start Time"
                                    value={dayjs(formData.startTime)}
                                    onChange={(newValue) => handleChange('startTime', newValue?.toDate() || new Date())}
                                    viewRenderers={{
                                        hours: renderTimeViewClock,
                                        minutes: renderTimeViewClock,
                                    }}
                                    sx={{ width: '100%' }}
                                />
                            </LocalizationProvider>
                            <IconButton onClick={() => handleChange('startTime', null)}><ClearIcon /></IconButton>
                        </Grid>
                        <Grid item xs={12} md={6} display="flex" alignItems="center">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    label="End Time"
                                    value={formData.endTime ? dayjs(formData.endTime) : null}
                                    onChange={(newValue) => handleChange('endTime', newValue?.toDate())}
                                    viewRenderers={{
                                        hours: renderTimeViewClock,
                                        minutes: renderTimeViewClock,
                                    }}
                                    slotProps={{
                                        textField: {
                                            helperText: "Fill after activity has ended (if applicable)",
                                        },
                                    }}
                                    sx={{ width: '100%' }}
                                />
                            </LocalizationProvider>
                            <IconButton onClick={() => handleChange('endTime', null)}><ClearIcon /></IconButton>
                        </Grid>
                    </Grid>
                </Box>

                {/* Activity Type Specific View */}
                <Box sx={{ mb: 4 }}>
                    {renderActivityTypeSpecificView()}
                </Box>

                {/* Form Actions */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    {!isCreating && onDelete && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            startIcon={<DeleteOutlineIcon />}
                            sx={{ 
                                borderColor: 'rgba(211, 47, 47, 0.5)', 
                                color: 'error.main',
                                '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                                    borderColor: 'error.main'
                                }
                            }}
                        >
                            Delete
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        sx={{ minWidth: 150 }}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : isCreating ? 'Create' : 'Save Changes'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};
