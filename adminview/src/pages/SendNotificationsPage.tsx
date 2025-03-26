import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert, 
  Paper,
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Snackbar,
  Card,
  Grid,
  IconButton,
  Avatar,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSendNotification } from '../hooks/App';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Styled components
const NotificationForm = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  maxWidth: 700,
  margin: '0 auto',
  overflow: 'hidden',
  position: 'relative',
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.light,
  width: 80,
  height: 80,
  margin: '0 auto 20px auto',
}));

const NotificationPreview = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginTop: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
}));

const SendNotificationsPage = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const { mutate: sendNotification, isPending, error } = useSendNotification();

  const handleSendNotification = () => {
    sendNotification(
      { 
        title, 
        message: body, 
        imageUrl: imageUrl || undefined
      },
      {
        onSuccess: () => {
          setOpenDialog(false);
          setOpenSuccess(true);
          setTitle('');
          setBody('');
          setImageUrl('');
          setPreviewVisible(false);
        }
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    setOpenDialog(true);
  };

  const isFormValid = title.trim() !== '' && body.trim() !== '';

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Header with back button */}
      <Card sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, p: 2 }}>
        <Typography variant="h4" component="h1">
          Send Custom Notifications
        </Typography>

        <IconButton component={Link} to="/events">
          <ArrowBackIcon /> Back to Events
        </IconButton>
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <NotificationForm as="form" onSubmit={handleSubmit}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <IconContainer>
                <NotificationsActiveIcon sx={{ fontSize: 40, color: 'primary.contrastText' }} />
              </IconContainer>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Push Notification Manager
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send custom notifications to all users that will appear on their devices.
              </Typography>
            </Box>

            <TextField
              label="Notification Title"
              fullWidth
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!previewVisible && e.target.value) setPreviewVisible(true);
              }}
              sx={{ mb: 3 }}
              required
              error={title === ''}
              helperText={title === '' ? 'Title is required' : ''}
            />

            <TextField
              label="Notification Body"
              multiline
              rows={4}
              fullWidth
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (!previewVisible && e.target.value) setPreviewVisible(true);
              }}
              sx={{ mb: 3 }}
              required
              error={body === ''}
              helperText={body === '' ? 'Message body is required' : ''}
            />

            <TextField
              label="Image URL (optional)"
              fullWidth
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              sx={{ mb: 3 }}
              helperText="Leave empty to use the default app icon"
              InputProps={{
                endAdornment: (
                  <IconButton 
                    size="small" 
                    sx={{ visibility: imageUrl ? 'visible' : 'hidden' }}
                    onClick={() => setImageUrl('')}
                  >
                    <CloseIcon />
                  </IconButton>
                ),
              }}
            />

            {previewVisible && (
              <NotificationPreview>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Preview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Avatar src={imageUrl} sx={{ bgcolor: 'primary.main' }}>
                    {!imageUrl && <ImageIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {title || 'Notification Title'}
                    </Typography>
                    <Typography variant="body2">
                      {body || 'Notification message will appear here'}
                    </Typography>
                  </Box>
                </Box>
              </NotificationPreview>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!isFormValid || isPending}
                endIcon={isPending ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{ px: 4, py: 1.2, borderRadius: 2 }}
              >
                {isPending ? 'Sending...' : 'Send Notification'}
              </Button>
            </Box>
          </NotificationForm>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Notification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to send this notification? It will be delivered to all users who have the app installed on their devices.
          </DialogContentText>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
            <Typography variant="body2">{body}</Typography>
            {imageUrl && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                With image: {imageUrl}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendNotification} 
            variant="contained" 
            disabled={isPending} 
            startIcon={isPending && <CircularProgress size={16} />}
            color="primary"
          >
            {isPending ? 'Sending...' : 'Send Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={openSuccess}
        autoHideDuration={6000}
        onClose={() => setOpenSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSuccess(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Notification sent successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => {/* Clear error */}}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => {/* Clear error */}} 
          severity="error"
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {error instanceof Error ? error.message : 'Failed to send notification'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SendNotificationsPage;