import AddIcon from '@mui/icons-material/Add';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import {
  Box, Button,
  Chip,
  CircularProgress,
  Fade,
  IconButton, MenuItem,
  Paper, Select, TextField, Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';
import { Suspense, useEffect, useState } from 'react';

import { EventType } from '@common/constants';
import { BannerItem, Event } from '@common/models';
import { getAllBaseEventTypes } from '@common/utils';
import { ActivityButton } from './ActivityButton';

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
    setFormData(prev => ({ ...prev, [key]: value }));
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
          onClick={(e) => {
            setIsImageEditOpen(!isImageEditOpen);
          }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer'
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
            overflow: 'hidden'
          }}
        >
          {renderBannerPreview(currentBannerItem)}

          {/* Event Type Tag */}
          <EventTypeInput>
            <Select
              required
              variant='filled'
              value={formData.type}
              onClick={(e) => e.stopPropagation()}
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

          {/* Left/Right Navigation Buttons for Banner */}
          {formData.banner && formData.banner.length > 1 && (
            <>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentBannerIndex((prev) =>
                    prev === 0 ? formData.banner.length - 1 : prev - 1
                  );
                }}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.2)',
                  color: 'white',
                  zIndex: 2,
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.4)',
                  },
                }}
              >
                &#10094;
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentBannerIndex((prev) =>
                    (prev + 1) % formData.banner.length
                  );
                }}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.2)',
                  color: 'white',
                  zIndex: 2,
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.4)',
                  },
                }}
              >
                &#10095;
              </IconButton>
            </>
          )}

          {/* Banner Edit Overlay (replaces Dialog) */}
          <Fade in={isImageEditOpen} timeout={300}>
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                p: 3,
                overflow: 'auto',
              }}
            >
              <Paper
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  maxHeight: '100%',
                  overflow: 'auto',
                  borderRadius: 2,
                  boxShadow: 10,
                  p: 3
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Edit Banner {currentBannerItem.type === 'image' ? 'Image' : 'Video'}
                  </Typography>
                  <IconButton
                    aria-label="close"
                    onClick={() => setIsImageEditOpen(false)}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

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

                {/* Banner Navigation in Overlay */}
                {formData.banner && formData.banner.length > 1 && (
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Banner {currentBannerIndex + 1} of {formData.banner.length}
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {formData.banner.map((_, index) => (
                        <Box
                          key={index}
                          onClick={() => setCurrentBannerIndex(index)}
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: currentBannerIndex === index ? 'primary.main' : 'rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

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

                {/* Preview Section */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Preview
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: 150,
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    overflow: 'hidden',
                    mb: 3
                  }}
                >
                  {renderBannerPreview(currentBannerItem)}
                </Box>

                {/* Banner Item Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    disabled={formData.banner?.length <= 1}
                    onClick={() => removeCurrentBannerItem()}
                    variant="outlined"
                  >
                    Remove
                  </Button>

                  <Button
                    startIcon={<AddIcon />}
                    color="primary"
                    onClick={() => addBannerItem()}
                    variant="contained"
                  >
                    Add New
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Fade>

          {/* Edit Button */}
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