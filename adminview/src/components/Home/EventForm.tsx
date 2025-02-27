import { useState, useEffect } from 'react';
import {
  Box, TextField, Typography, Button,
  FormControl, InputLabel, Select, MenuItem,
  Paper, IconButton, Collapse, CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { EventType } from '@common/constants';
import { Event } from '@common/models';

interface EventFormProps {
  event?: Event;
  isCreating: boolean;
  onSave: (eventData: Event) => Promise<void>;
}

export function EventForm({ event, isCreating, onSave }: EventFormProps) {
  // States for form fields
  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>(EventType.CULTURAL);
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [timings, setTimings] = useState<Date[]>([new Date(), new Date(Date.now() + 2 * 60 * 60 * 1000)]);
  const [banner, setBannerImage] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isImageEditOpen, setIsImageEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Populate form with event data if editing
  useEffect(() => {
    if (event) {
      setName(event.name);
      setType(event.type);
      setDescription(event.description);
      setVenue(event.venue);
      setTimings(event.timings || [event.time.start, event.time.end]);
      setBannerImage(event.banner);
    } else if (isCreating) {
      // Reset form for create mode
      setName('');
      setType(EventType.GENERAL);
      setDescription('');
      setVenue('');
      setTimings([new Date(), new Date(Date.now() + 2 * 60 * 60 * 1000)]);
      setBannerImage({});
    }
  }, [event, isCreating]);

  // Reset success state when form changes
  useEffect(() => {
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  }, [name, type, description, venue, timings, banner]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Name is required';
    if (!venue.trim()) errors.venue = 'Venue is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (timings.length < 2 || timings[1] <= timings[0]) {
      errors.timings = 'End time must be after start time';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const eventData: Event = Event.parse({
        id: event?.id,
        name,
        type,
        timings,
        description,
        venue,
        banner
      });

      await onSave(eventData);
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

  // Handle image URL change
  const handleImageUrlChange = (url: string) => {
    setBannerImage(prev => ({ ...prev, url }));
  };

  // Handle custom CSS change
  const handleCustomCssChange = (customCss: string) => {
    setBannerImage(prev => ({ ...prev, customCss }));
  };

  return (
    <Paper
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
          bgcolor: banner.url ? 'transparent' : '#F0F0F0',
          borderBottom: banner.url ? 'none' : '2px dashed #CCCCCC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
        onClick={() => setIsImageEditOpen(!isImageEditOpen)}
      >
        {banner.url ? (
          <>
            <Box
              component="img"
              src={banner.url}
              alt={name}
              sx={{ width: '100%', height: '100%' }}
              style={
                banner.customCss
                  ? Object.fromEntries(
                    banner.customCss.split(';')
                      .filter(prop => prop.trim())
                      .map(prop => {
                        const [key, value] = prop.split(':').map(p => p.trim());
                        return [key.replace(/-([a-z])/g, (g) => g[1].toUpperCase()), value];
                      })
                  )
                  : {}
              }
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(255,255,255,0.8)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsImageEditOpen(!isImageEditOpen);
              }}
            >
              {isImageEditOpen ? <CloseIcon /> : <EditIcon />}
            </IconButton>
          </>
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
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 24,
            bgcolor: 'white',
            borderRadius: 1,
            px: 2,
            py: 0.5,
          }}
        >
          <Typography fontWeight="bold" variant="body2">
            {type} Event
          </Typography>
        </Box>
      </Box>

      {/* Image Edit Overlay */}
      <Collapse in={isImageEditOpen}>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" gutterBottom>Edit Banner Image</Typography>

          <TextField
            label="Banner Image URL"
            placeholder="Enter image URL here..."
            fullWidth
            margin="normal"
            value={banner.url || ''}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Custom CSS"
            placeholder="e.g., object-fit: cover; object-position: center top;"
            fullWidth
            margin="normal"
            value={banner.customCss || ''}
            onChange={(e) => handleCustomCssChange(e.target.value)}
            multiline
            helperText="Enter CSS properties for fine-tuning image display"
            sx={{ mb: 2 }}
          />
        </Box>
      </Collapse>

      <Box sx={{ p: 3 }}>
        {/* Event Title */}
        <TextField
          label="Event Title"
          placeholder="Enter event title here..."
          fullWidth
          variant="filled"
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!formErrors.name}
          helperText={formErrors.name}
          required
          slotProps={{
            input: { style: { fontSize: '1.5rem', fontWeight: 600 } }
          }}
          sx={{ mb: 4 }}
        />

        {/* Event Type */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
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
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              label="Event Type"
            >
              <MenuItem value={EventType.GENERAL}>General</MenuItem>
              <MenuItem value={EventType.SPORTS}>Sports</MenuItem>
              <MenuItem value={EventType.CULTURAL}>Cultural</MenuItem>
              <MenuItem value={EventType.TECH}>Tech</MenuItem>
            </Select>
          </FormControl>
        </Box>

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

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <DateTimePicker
                label="Start Time"
                value={timings[0]}
                onChange={(newValue) => {
                  if (newValue) {
                    setTimings([newValue, timings[1]]);
                  }
                }}
                sx={{ flex: 1 }}
              />

              <DateTimePicker
                label="End Time"
                value={timings[1]}
                onChange={(newValue) => {
                  if (newValue) {
                    setTimings([timings[0], newValue]);
                  }
                }}
                sx={{ flex: 1 }}
                slotProps={{
                  textField: {
                    error: !!formErrors.timings,
                    helperText: formErrors.timings
                  }
                }}
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
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!formErrors.description}
            helperText={formErrors.description}
            required
          />
        </Box>

        {/* Save Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
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
        </Box>
      </Box>
    </Paper>
  );
};