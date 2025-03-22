import { Suspense, useEffect, useState } from 'react';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  Box, Button, CircularProgress,
  IconButton, MenuItem, Fade,
  Paper, Select, TextField, Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';

import { EventType } from '@common/constants';
import { Event } from '@common/models';
import { ActivityButton } from './ActivityButton';
import { getAllBaseEventTypes } from '@common/utils';

const EventTypeInput = styled(Box)`
  position: absolute; bottom: 0; left: 0;
  width: 40%; transform: translateX(70%);
`;

interface EventFormProps {
  event?: Event;
  isCreating: boolean;
  onSave: (eventData: Partial<Event>) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
}

export function EventForm({ event, isCreating, onSave, onDelete }: EventFormProps) {
  // Default States for form fields
  const [formData, setFormData] = useState<Partial<Event>>({
    ...Event.parse({}).toJSON(),
    timings: [new Date(), new Date(Date.now() + 2 * 60 * 60 * 1000)],
    galleryLink: '' // Add googleDriveLink to formData
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isImageEditOpen, setIsImageEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Populate form with event data if editing
  useEffect(() => {
    if (event) {
      setFormData(event);
    } else if (isCreating) {
      setFormData(Event.parse({}));
    }
  }, [event, isCreating]);

  // Reset success state when form changes
  useEffect(() => {
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  }, [formData]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.venue?.trim()) errors.venue = 'Venue is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.type?.toString().trim()) errors.type = 'Event type is required';
    if (formData.timings.length < 2 || formData.timings[1] <= formData.timings[0]) {
      errors.timings = 'End time must be after start time';
    }

    if (Object.keys(errors).length > 0) setFormErrors(errors);
    alert(JSON.stringify(errors, null, 2)); // For debugging purposes
    return Object.keys(errors).length === 0;
  };

  // Utility to update formData
  const editFormData = (key: string, value: any) => {
    setFormData(Event.parse({ ...formData, [key]: value }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      setSaveSuccess(true);

      // Reset success state after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // handle event deletion
  const handleDelete = async () => {
    if (event && window.confirm('Are you sure you want to delete this event?')) {
      await onDelete(event.id);
    }
  };

  return (
    <Suspense fallback={<CircularProgress />}>
      <Paper
        key={formData.id}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 auto',
          padding: { xs: 2, md: 3 }
        }}
      >
        {/* Banner Image Section */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '350px',
            bgcolor: formData.banner.url ? 'transparent' : '#F0F0F0',
            borderBottom: formData.banner.url ? 'none' : '2px dashed #CCCCCC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
        >
          {formData.banner.url ? (
            <Box
              onClick={() => setIsImageEditOpen(!isImageEditOpen)}
              component="img"
              src={formData.banner.url}
              alt={formData.name}
              sx={{ width: '100%', height: '100%' }}
              style={
                formData.banner.customCss
                  ? Object.fromEntries(
                    formData.banner.customCss.split(';')
                      .filter(prop => prop.trim())
                      .map(prop => {
                        const [key, value] = prop.split(':').map(p => p.trim());
                        return [key.replace(/-([a-z])/g, (g) => g[1].toUpperCase()), value];
                      })
                  )
                  : {}
              }
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <AddPhotoAlternateIcon sx={{ fontSize: 48, color: '#999999' }} />
              <Typography variant="subtitle1" color="#999999" mt={1}>
                Add Banner Image
              </Typography>
            </Box>
          )}

          {/* Event Type Tag */}
          <EventTypeInput>
            <Select
              required
              variant='filled'
              value={formData.type}
              onChange={(e) => editFormData('type', e.target.value)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.6)',
                width: '80%',
                height: '60px',
                pb: 1,
                borderRadius: '60px',
                fontSize: '24px',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.7)', // Slightly lighter on hover
                },
              }}
            >
              {getAllBaseEventTypes().map((type) => (
                <MenuItem key={type} value={type}>{EventType[type]}</MenuItem>
              ))}
            </Select>
            {formErrors.type && (
              <Typography variant="caption" color="error">
                {formErrors.type}
              </Typography>
            )}
          </EventTypeInput>

          {/* Image Edit Overlay */}
          <Fade in={isImageEditOpen} timeout={300}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2,
                zIndex: 1,
              }}
            >
              <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.8)', borderRadius: 2, width: '80%', maxWidth: '500px' }}>
                <IconButton
                  aria-label="close"
                  onClick={() => setIsImageEditOpen(false)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="h6" gutterBottom>Edit Banner Image</Typography>

                <TextField
                  label="Banner Image URL"
                  placeholder="Enter image URL here..."
                  fullWidth
                  margin="normal"
                  value={formData.banner.url || ''}
                  onChange={(e) => editFormData('banner', { ...formData.banner, url: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Custom CSS"
                  placeholder="e.g., object-fit: cover; object-position: center top;"
                  fullWidth
                  margin="normal"
                  value={formData.banner.customCss || ''}
                  onChange={(e) => editFormData('banner', { ...formData.banner, customCss: e.target.value })}
                  multiline
                  helperText="Enter CSS properties for fine-tuning image display"
                  sx={{ mb: 2 }}
                />
              </Box>
            </Box>
          </Fade>
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255,255,255,0.8)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              zIndex: 2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsImageEditOpen(!isImageEditOpen);
            }}
          >
            {isImageEditOpen ? <CloseIcon /> : <EditIcon />}
          </IconButton>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Event Title */}
          <TextField
            label="Event Title"
            placeholder="Enter event title here..."
            fullWidth
            variant="filled"
            margin="normal"
            value={formData.name}
            onChange={(e) => editFormData('name', e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name}
            required
            slotProps={{
              input: { style: { fontSize: '1.5rem', fontWeight: 600 } }
            }}
            sx={{ mb: 4 }}
          />

          {/* Event Type */}
          {/* <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                display: 'flex',
                alignItems: 'center',
                mr: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 1,
                minWidth: '240px' // Adjust as needed
              }}
            >
              <CategoryIcon sx={{ mr: 1 }} />
              Event Type
            </Typography>
            <FormControl fullWidth margin="normal" >
              <InputLabel>Event Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => editFormData('type', e.target.value)}
                label="Event Type"
              >
                <MenuItem value={EventType.GENERAL}>General</MenuItem>
                <MenuItem value={EventType.SPORTS}>Sports</MenuItem>
                <MenuItem value={EventType.CULTURAL}>Cultural</MenuItem>
                <MenuItem value={EventType.TECH}>Tech</MenuItem>
              </Select>
            </FormControl>
          </Box> */}

          {/* Date & Time Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 1
              }}
            >
              <CalendarMonthIcon sx={{ mr: 1 }} />
              Date & Time
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <DateTimePicker
                  label="Start Time"
                  value={dayjs(formData.timings[0])}
                  onChange={(newValue) => newValue && editFormData('timings', [newValue, formData.timings[1]])}
                  sx={{ flex: 1 }}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  slotProps={{ textField: { error: !!formErrors.timings, helperText: formErrors.timings } }}
                />
                <DateTimePicker
                  label="End Time"
                  value={dayjs(formData.timings[1])}
                  onChange={(newValue) => newValue && editFormData('timings', [formData.timings[0], newValue])}
                  sx={{ flex: 1 }}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                  }}
                  slotProps={{ textField: { error: !!formErrors.timings, helperText: formErrors.timings } }}
                />
              </Box>
            </LocalizationProvider>
          </Box>

          {/* Location Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <LocationOnIcon sx={{ mr: 1 }} />
              Location
            </Typography>

            <TextField
              label="Venue"
              placeholder="Enter venue name..."
              fullWidth
              margin="normal"
              value={formData.venue}
              onChange={(e) => editFormData('venue', e.target.value)}
              error={!!formErrors.venue}
              helperText={formErrors.venue}
              required
            />
          </Box>

          {/* About Event Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 1
              }}
            >
              <DescriptionIcon sx={{ mr: 1 }} />
              About Event
            </Typography>

            <TextField
              label="Event Description"
              placeholder="Enter event description..."
              fullWidth
              margin="normal"
              multiline
              rows={5}
              value={formData.description}
              onChange={(e) => editFormData('description', e.target.value)}
              error={!!formErrors.description}
              helperText={formErrors.description}
              required
            />
          </Box>

          {/* Gallery Link Section */}
          <Box sx={{ mb: 4 }}>
            <TextField
              label="imgur link"
              placeholder="Enter imgur link link here..."
              fullWidth
              margin="normal"
              value={formData.galleryLink}
              onChange={(e) => editFormData('galleryLink', e.target.value)}
              sx={{ mb: 4 }}
            />
          </Box>

          {/* Save and Delete Buttons */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={isSaving || saveSuccess || Object.keys(formErrors).length > 0}
              sx={{
                px: 4,
                py: 1,
                minWidth: 180,
                position: 'relative'
              }}
            >
              {!isSaving && !saveSuccess && (isCreating ? 'Create Event' : 'Save Changes')}

              {/* Loading Spinner */}
              {isSaving && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: 'white',
                    position: 'absolute'
                  }}
                />
              )}

              {/* Success Checkmark */}
              {saveSuccess && (
                <CheckCircleIcon sx={{ color: 'white', animation: 'checkmark 0.3s ease-out' }} />
              )}
            </Button>

            {event && (
              <Button
                variant="contained"
                size="large"
                color="error"
                onClick={handleDelete}
                disabled={isSaving}
                sx={{
                  minWidth: 120,
                  fontWeight: 'bold',
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                Delete Event
              </Button>
            )}
          </Box>

          {event && <ActivityButton eventId={event.id} />}
        </Box>
      </Paper>
    </Suspense>
  );
};