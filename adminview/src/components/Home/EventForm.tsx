import { Suspense, useEffect, useState } from 'react';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ImageIcon from '@mui/icons-material/Image';
import {
  Box, Button, CircularProgress,
  IconButton, MenuItem, Fade,
  Paper, Select, TextField, Typography, 
  Tabs, Tab, Stack, FormControlLabel, Switch, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';

import { EventType } from '@common/constants';
import { BannerItem, Event } from '@common/models';
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
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
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

    // Ensure at least one banner item exists
    if (!formData.banner || formData.banner.length === 0) {
      errors.banner = 'At least one banner item is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Utility to update formData
  const editFormData = (key: string, value: any) => {
    setFormData(prev => ({...prev, [key]: value }));
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

  // Get the current banner item or a default
  const currentBannerItem: BannerItem = formData.banner && 
    formData.banner.length > 0 && 
    currentBannerIndex < formData.banner.length ? 
    formData.banner[currentBannerIndex] : { type: 'image' };

  // Add a new banner item
  const addBannerItem = () => {
    const newItem: BannerItem = { type: 'image' };
    const updatedBanner = [...(formData.banner || []), newItem];
    editFormData('banner', updatedBanner);
    setCurrentBannerIndex(updatedBanner.length - 1);
  };

  // Update the current banner item
  const updateCurrentBannerItem = (updates: Partial<BannerItem>) => {
    if (!formData.banner || currentBannerIndex >= formData.banner.length) return;
    
    const updatedBanner = [...formData.banner];
    updatedBanner[currentBannerIndex] = { 
      ...updatedBanner[currentBannerIndex], 
      ...updates 
    };
    editFormData('banner', updatedBanner);
  };

  // Remove the current banner item
  const removeCurrentBannerItem = () => {
    if (!formData.banner || formData.banner.length <= 1) return;
    
    const updatedBanner = formData.banner.filter((_, index) => index !== currentBannerIndex);
    editFormData('banner', updatedBanner);
    setCurrentBannerIndex(Math.min(currentBannerIndex, updatedBanner.length - 1));
  };

  // Preview rendering for banner item
  const renderBannerPreview = (item: BannerItem) => {
    if (!item.url) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <AddPhotoAlternateIcon sx={{ fontSize: 48, color: '#999999' }} />
          <Typography variant="subtitle1" color="#999999" mt={1}>
            Add Banner {item.type === 'image' ? 'Image' : 'Video'}
          </Typography>
        </Box>
      );
    }

    if (item.type === 'video') {
      return (
        <Box
          component="video"
          src={item.url}
          controls
          muted
          sx={{ width: '100%', height: '100%' }}
          style={
            item.customCss
              ? Object.fromEntries(
                item.customCss.split(';')
                  .filter(prop => prop.trim())
                  .map(prop => {
                    const [key, value] = prop.split(':').map(p => p.trim());
                    return [key.replace(/-([a-z])/g, (g) => g[1].toUpperCase()), value];
                  })
              )
              : {}
          }
        />
      );
    }

    return (
      <Box
        component="img"
        src={item.url}
        alt="Banner image"
        sx={{ width: '100%', height: '100%' }}
        style={
          item.customCss
            ? Object.fromEntries(
              item.customCss.split(';')
                .filter(prop => prop.trim())
                .map(prop => {
                  const [key, value] = prop.split(':').map(p => p.trim());
                  return [key.replace(/-([a-z])/g, (g) => g[1].toUpperCase()), value];
                })
            )
            : {}
        }
      />
    );
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
        {/* Banner Image/Video Section */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '350px',
            bgcolor: currentBannerItem?.url ? 'transparent' : '#F0F0F0',
            borderBottom: currentBannerItem?.url ? 'none' : '2px dashed #CCCCCC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
          onClick={() => setIsImageEditOpen(!isImageEditOpen)}
        >
          {renderBannerPreview(currentBannerItem)}

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

          {/* Banner Navigation/Pagination */}
          {formData.banner && formData.banner.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                zIndex: 2,
              }}
            >
              {formData.banner.map((_, index) => (
                <Box
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentBannerIndex(index);
                  }}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: currentBannerIndex === index ? 'primary.main' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.2)',
                    },
                  }}
                />
              ))}
            </Box>
          )}

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
              <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2, width: '80%', maxWidth: '500px' }}>
                <IconButton
                  aria-label="close"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImageEditOpen(false);
                  }}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="h6" gutterBottom>
                  Edit Banner {currentBannerItem.type === 'image' ? 'Image' : 'Video'}
                </Typography>

                {/* Media Type Selection */}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    icon={<ImageIcon />} 
                    label="Image" 
                    clickable
                    color={currentBannerItem.type === 'image' ? 'primary' : 'default'}
                    onClick={() => updateCurrentBannerItem({ type: 'image' })}
                  />
                  <Chip 
                    icon={<VideoLibraryIcon />} 
                    label="Video" 
                    clickable
                    color={currentBannerItem.type === 'video' ? 'primary' : 'default'}
                    onClick={() => updateCurrentBannerItem({ type: 'video' })}
                  />
                </Box>

                <TextField
                  label={currentBannerItem.type === 'image' ? "Banner Image URL" : "Banner Video URL"}
                  placeholder={`Enter ${currentBannerItem.type} URL here...`}
                  fullWidth
                  margin="normal"
                  value={currentBannerItem.url || ''}
                  onChange={(e) => updateCurrentBannerItem({ url: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Custom CSS"
                  placeholder="e.g., object-fit: cover; object-position: center top;"
                  fullWidth
                  margin="normal"
                  value={currentBannerItem.customCss || ''}
                  onChange={(e) => updateCurrentBannerItem({ customCss: e.target.value })}
                  multiline
                  helperText={`Enter CSS properties for fine-tuning ${currentBannerItem.type} display`}
                  sx={{ mb: 2 }}
                />

                {/* Banner Item Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    disabled={formData.banner?.length <= 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCurrentBannerItem();
                    }}
                  >
                    Remove
                  </Button>
                  
                  <Button
                    startIcon={<AddIcon />}
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      addBannerItem();
                    }}
                  >
                    Add New
                  </Button>
                </Box>
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