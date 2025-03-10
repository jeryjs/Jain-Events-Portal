import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Container, Paper, Grid, Card, IconButton, Breadcrumbs, CircularProgress, Alert, Snackbar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEventActivities, useCreateActivity, useUpdateActivity, useDeleteActivity } from '@hooks/App';
import { ActivitiesList } from '@components/Activities/ActivitiesList';
import { Activity } from '@common/models';
import { ActivityForm } from '@components/Activities';

const ActivitiesPage = () => {
    const { eventId, activityId } = useParams<{ eventId: string; activityId: string }>();
    const navigate = useNavigate();
    const { activities = [], isLoading: isActivitiesLoading, error: activitiesError } = useEventActivities(eventId);
    
    // Local state
    const [isCreating, setIsCreating] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Mutations
    const createMutation = useCreateActivity(eventId);
    const updateMutation = useUpdateActivity(eventId);
    const deleteMutation = useDeleteActivity(eventId);
    
    // Set isCreating based on URL and find selected activity from activities array
    useEffect(() => {
        const isCreateMode = activityId === 'create';
        setIsCreating(isCreateMode);
        
        if (!isCreateMode && activityId && activities && activities.length > 0) {
            const activity = activities.find((a: any) => a.id === activityId);
            setSelectedActivity(activity || null);
            
            // If activity ID is in URL but not found in data, show error
            if (!activity && !isCreating) {
                setError(`Activity with ID "${activityId}" not found`);
            } else {
                setError(null);
            }
        } else {
            setSelectedActivity(null);
            setError(null);
        }
    }, [activityId, activities]);
    
    // Handle activity selection
    const handleSelectActivity = (id: string) => {
        navigate(`/events/${eventId}/activities/${id}`);
    };
    
    // Handle create new activity
    const handleCreateActivity = () => {
        setIsCreating(true);
        navigate(`/events/${eventId}/activities/create`);
    };
    
    // Handle save (create or update)
    const handleSaveActivity = async (formData: Activity) => {
        try {
            if (isCreating) {
                const newActivity = await createMutation.mutateAsync(formData);
                navigate(`/events/${eventId}/activities/${newActivity.id}`);
            } else if (activityId) {
                // Ensure ID is preserved when updating
                await updateMutation.mutateAsync(formData);
                navigate(`/events/${eventId}/activities/${activityId}`);
            }
        } catch (err) {
            setError(`Failed to ${isCreating ? 'create' : 'update'} activity: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    // Handle delete activity
    const handleDeleteActivity = async (activityId: string) => {
        try {
            setError(null);
            await deleteMutation.mutateAsync(activityId);
            // Navigate back to the activities list after deletion
            setSelectedActivity(null);
            navigate(`/events/${eventId}/activities`);
        } catch (err) {
            console.error('Delete activity error:', err);
            let errorMessage = 'Failed to delete activity';
            
            if (err instanceof Error) {
                if (err.message.includes('401') || err.message.includes('authorized')) {
                    errorMessage = `Not authorized to delete this activity. Please check your permissions or log in again.`;
                } else {
                    errorMessage = `Failed to delete activity: ${err.message}`;
                }
            }
            
            setError(errorMessage);
        }
    };
    
    // Error handling
    const hasError = activitiesError || error;
    
    return (
        <Container maxWidth={false} sx={{ height: '100vh', py: 3 }}>
            {/* Header */}
            <Card sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, p: 2 }}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link to="/events" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Events
                        </Link>
                        <Link to={`/events/${eventId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            Event Details
                        </Link>
                        <Typography color="text.primary">Activities</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" component="h1">
                        Activity Management
                    </Typography>
                </Box>

                <IconButton component={Link} to={`/events/${eventId}`}>
                    <ArrowBackIcon /> Back to Event
                </IconButton>
            </Card>

            {/* Error notification */}
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>

            {/* Main content */}
            <Grid container spacing={3} sx={{ height: 'calc(100% - 80px)' }}>
                {/* Left pane - Activities list */}
                <Grid item xs={12} md={3}>
                    <ActivitiesList
                        eventId={eventId || ''}
                        selectedActivityId={activityId}
                        onSelectActivity={handleSelectActivity}
                        onCreateActivity={handleCreateActivity}
                    />
                </Grid>

                {/* Right pane - Activity form */}
                <Grid item xs={12} md={9} sx={{ height: '100%' }}>
                    {isActivitiesLoading ? (
                        <Paper 
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center' 
                            }}
                        >
                            <CircularProgress />
                        </Paper>
                    ) : activitiesError ? (
                        <Paper
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                p: 4,
                            }}
                        >
                            <Alert severity="error" sx={{ width: '100%' }}>
                                {activitiesError instanceof Error 
                                    ? activitiesError.message 
                                    : 'Failed to load activities'}
                            </Alert>
                        </Paper>
                    ) : !activityId && !isCreating ? (
                        <Paper
                            elevation={2}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                p: 4,
                                borderRadius: 2,
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: 2 }}>
                                Select an activity or create a new one
                            </Typography>
                            <Typography color="text.secondary">
                                Use the list on the left to select an existing activity or click "Create Activity"
                            </Typography>
                        </Paper>
                    ) : (
                        <Box sx={{ height: '100%', overflow: 'auto' }}>
                            <ActivityForm
                                eventId={eventId}
                                activity={isCreating ? null : selectedActivity}
                                isCreating={isCreating}
                                onSave={handleSaveActivity}
                                onDelete={handleDeleteActivity}
                            />
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default ActivitiesPage;