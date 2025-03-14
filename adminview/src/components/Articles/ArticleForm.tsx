import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid2 as Grid,
  Divider,
  FormHelperText,
  CircularProgress,
  IconButton,
  Fade,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

import { EventType } from '@common/constants';
import { Article } from '@common/models';
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import MarkdownIcon from '@mui/icons-material/CodeTwoTone';
import EditIcon from '@mui/icons-material/Edit';

interface ArticleFormProps {
  article?: Article;
  isCreating: boolean;
  onSave: (article: Article) => Promise<void>;
  onDelete?: (articleId: string) => Promise<void>;
}

export const ArticleForm = ({ article, isCreating, onSave, onDelete }: ArticleFormProps) => {
  const [formData, setFormData] = useState<Partial<Article>>(
    article || {
      title: '',
      summary: '',
      content: '',
      image: { url: '' },
      tags: [],
      author: { id: 'admin', name: 'Administrator' },
      relatedEventType: undefined,
    }
  );
  const editor = useCreateBlockNote({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [isImageEditOpen, setIsImageEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);

  // Reset form when article changes
  useEffect(() => {
    if (isCreating) {
      setFormData(Article.parse({}));
      editor.replaceBlocks(editor.document, []);
    }
    if (article) {
      setFormData(article);
      editor.tryParseMarkdownToBlocks(article.content).then((it) => {
        editor.replaceBlocks(editor.document, it);
      });
    }
  }, [article]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.summary?.trim()) {
      newErrors.summary = 'Summary is required';
    }
    
    if (!formData.content?.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!formData.image?.url?.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      // Create a new Article instance with current form data
      const fullArticle = Article.parse({
        ...formData,
        id: formData.id || Math.floor(Math.random() * 10000).toString(),
        publishedAt: formData.publishedAt || new Date(),
        lastUpdatedAt: new Date(),
      });
      
      await onSave(fullArticle);
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper 
      component="form" 
      onSubmit={handleSubmit}
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        height: '100%',
        overflow: 'auto'
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        {isCreating ? 'Create New Article' : 'Edit Article'}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid size={{xs: 12}}>
          {/* Banner Image Section */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '350px',
              bgcolor: formData.image?.url ? 'transparent' : '#F0F0F0',
              borderBottom: formData.image?.url ? 'none' : '2px dashed #CCCCCC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
          >
            {formData.image?.url ? (
              <Box
                onClick={() => setIsImageEditOpen(!isImageEditOpen)}
                component="img"
                src={formData.image.url}
                alt={formData.title}
                sx={{ width: '100%', height: '100%' }}
                style={formData.image.customCss
                  ? Object.fromEntries(
                      formData.image.customCss.split(';')
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
                    value={formData.image?.url || ''}
                    onChange={(e) => handleChange('image', { ...formData.image, url: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Custom CSS"
                    placeholder="e.g., object-fit: cover; object-position: center top;"
                    fullWidth
                    margin="normal"
                    value={formData.image?.customCss || ''}
                    onChange={(e) => handleChange('image', { ...formData.image, customCss: e.target.value })}
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
        </Grid>
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title || ''}
            onChange={e => handleChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            required
          />
        </Grid>
        
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            label="Summary"
            value={formData.summary || ''}
            onChange={e => handleChange('summary', e.target.value)}
            error={!!errors.summary}
            helperText={errors.summary}
            required
            multiline
            rows={2}
          />
        </Grid>
        
        {/* <Grid size={{xs: 12, md: 6}}>
          <TextField
            fullWidth
            label="Image URL"
            value={formData.image?.url || ''}
            onChange={e => handleChange('image', { ...formData.image, url: e.target.value })}
            error={!!errors.imageUrl}
            helperText={errors.imageUrl || 'URL for the article thumbnail image'}
            required
          />
        </Grid>
        
        <Grid size={{xs: 12, md: 6}}>
          <TextField
            fullWidth
            label="Image Alt Text"
            value={formData.image?.alt || ''}
            onChange={e => handleChange('image', { ...formData.image, alt: e.target.value })}
            helperText="Alternative text for the image"
          />
        </Grid> */}
        
        <Grid size={{xs: 12, md: 6}}>
          <FormControl fullWidth>
            <InputLabel id="event-type-label">Related Event Type</InputLabel>
            <Select
              labelId="event-type-label"
              value={formData.relatedEventType !== undefined ? formData.relatedEventType : ''}
              onChange={e => handleChange('relatedEventType', e.target.value === '' ? undefined : e.target.value)}
              label="Related Event Type"
            >
              <MenuItem value="">None</MenuItem>
              {Object.keys(EventType)
                .filter(key => isNaN(Number(key)))
                .map(key => (
                  <MenuItem key={key} value={EventType[key as keyof typeof EventType]}>
                    {key}
                  </MenuItem>
                ))
              }
            </Select>
            <FormHelperText>Associate this article with an event type</FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid size={{xs: 12, md: 6}}>
          <TextField
            fullWidth
            label="Tags"
            value={(formData.tags || []).join(', ')}
            onChange={e => handleChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
            helperText="Comma-separated list of tags"
          />
        </Grid>
        
        <Grid size={{xs: 12}} mt={2} sx={{ textAlign: 'start' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, ml: 2, fontWeight: 700 }}>
            Article
            {errors.content && (
              <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                {errors.content}
              </Typography>
            )}
          </Typography>
          
          {/* BlockNote Editor */}
          <Paper
            variant="outlined"
            sx={{
              height: 400,
              overflow: 'auto',
              borderRadius: 1,
              borderColor: errors.content ? 'error.main' : 'divider',
              '& .bn-container': {
                border: 'none',
                borderRadius: 0,
                height: '100%'
              },
              position: 'relative'
            }}
          >
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
              onClick={() => {
                setIsMarkdownMode(!isMarkdownMode)
                editor.tryParseMarkdownToBlocks(formData.content).then((it) => {
                  editor.replaceBlocks(editor.document, it);
                });
              }}
            >
              {isMarkdownMode ? <EditIcon /> : <MarkdownIcon />}
            </IconButton>
            {isMarkdownMode ? (
              <TextField
                fullWidth
                multiline
                minRows={18}
                value={formData.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                variant="outlined"
                error={!!errors.content}
                helperText={errors.content}
              />
            ) : (
              <BlockNoteView
                editor={editor}
                theme='light'
                onChange={() => editor.blocksToMarkdownLossy().then((it) => handleChange('content', it))} />
            )}
          </Paper>
          <FormHelperText sx={{ m: 2 }}>
            Format your article using the rich text editor above. Use headings, lists, and formatting tools to make your content engaging.
          </FormHelperText>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {onDelete && article && (
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpenConfirmation(true)}
              disabled={saving || isDeleting}
            >
              Delete Article
            </Button>
            <Dialog
              open={openConfirmation}
              onClose={() => setOpenConfirmation(false)}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {"Confirm Delete"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Are you sure you want to delete this article?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenConfirmation(false)}>Cancel</Button>
                <Button
                  onClick={async () => {
                    setOpenConfirmation(false);
                    setIsDeleting(true);
                    try {
                      await onDelete(article.id);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  color="error"
                  disabled={isDeleting}
                  startIcon={isDeleting && <CircularProgress size={20} color="inherit" />}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={saving}
          startIcon={saving && <CircularProgress size={20} color="inherit" />}
        >
          {saving ? 'Saving...' : isCreating ? 'Create Article' : 'Update Article'}
        </Button>
      </Box>
    </Paper>
  );
};