import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { InfoActivity } from '@common/models';
import MarkdownIcon from '@mui/icons-material/CodeTwoTone';
import EditIcon from '@mui/icons-material/Edit';
import HtmlIcon from '@mui/icons-material/Html';
import { Box, Grid, Paper, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import React, { useEffect, useState } from 'react';

// Function to detect if content is likely HTML
const isHtmlContent = (content: string): boolean => {
  if (!content) return false;
  // Check for common HTML tags with a more precise pattern
  const htmlTagPattern = /<\/?[\w\s="/.':;#-\/\?]+>/i;
  return htmlTagPattern.test(content);
};

interface InfoViewProps {
  formData: InfoActivity;
  setFormData: (data: InfoActivity) => void;
  errors?: Record<string, string>;
}

export const InfoView = ({ formData, setFormData, errors = {} }: InfoViewProps) => {
  const editor = useCreateBlockNote({});
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  
  // Default to HTML for new activities (empty content) or detect content type for existing ones
  const [contentType, setContentType] = useState<'markdown' | 'html'>(() => {
    if (!formData.content || formData.content.trim() == '') {
      return 'html'; // Default to HTML for new activities
    }
    return isHtmlContent(formData.content) ? 'html' : 'markdown';
  });
  
  // Initialize editor with content when component mounts or content changes
  useEffect(() => {
    try{
      if (!formData.content) {
        editor.replaceBlocks(editor.document, []);
        return;
      }
      
      // Only parse to BlockNote if it's markdown content
      if (contentType === 'markdown') {
        editor.tryParseMarkdownToBlocks(formData.content).then((blocks) => {
          editor.replaceBlocks(editor.document, blocks);
        });
      }
    } catch (error) {
      console.error('Error initializing editor:', error);
    }
  }, [formData.id, contentType]); // Reinitialize when activity ID or content type changes
  
  const handleChange = (field: keyof InfoActivity, value: any) => {
    setFormData(InfoActivity.parse({
      ...formData,
      [field]: value
    }));
  };

  // Update markdown content when editor changes
  const handleEditorChange = () => {
    editor.blocksToMarkdownLossy().then((markdown) => {
      handleChange('content', markdown);
    });
  };

  const handleContentTypeChange = (event: React.MouseEvent<HTMLElement>, newType: 'markdown' | 'html' | null) => {
    if (newType !== null) {
      setContentType(newType);
      
      // When switching from HTML to Markdown, try to parse the HTML
      if (newType === 'markdown' && isHtmlContent(formData.content)) {
        // Simple approach: strip tags to convert to plain text
        const plainText = formData.content.replace(/<[^>]*>/g, '');
        handleChange('content', plainText);
      }
    }
  };

  return (
    <Box>
      {/* Information Content Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Information Page Details</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name || 'Title of the information page'}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Content
                {errors.content && (
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    {errors.content}
                  </Typography>
                )}
              </Typography>
              
              <ToggleButtonGroup
                value={contentType}
                exclusive
                onChange={handleContentTypeChange}
                size="small"
              >
                <ToggleButton value="markdown" disabled={true}>
                  <MarkdownIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Markdown
                </ToggleButton>
                <ToggleButton value="html">
                  <HtmlIcon sx={{ mr: 0.5 }} fontSize="small" />
                  HTML
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            {/* Content Editor */}
            <Paper
              variant="outlined"
              sx={{
                height: 500,
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
              {contentType === 'markdown' ? (
                <>
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                    onClick={() => {
                      setIsMarkdownMode(!isMarkdownMode);
                      if (isMarkdownMode) {
                        editor.tryParseMarkdownToBlocks(formData.content).then((blocks) => {
                          editor.replaceBlocks(editor.document, blocks);
                        });
                      }
                    }}
                  >
                    {isMarkdownMode ? <EditIcon /> : <MarkdownIcon />}
                  </IconButton>
                  
                  {isMarkdownMode ? (
                    <TextField
                      fullWidth
                      multiline
                      minRows={20}
                      value={formData.content || ''}
                      onChange={(e) => handleChange('content', e.target.value)}
                      variant="outlined"
                      error={!!errors.content}
                      sx={{ height: '100%' }}
                    />
                  ) : (
                    <BlockNoteView
                      editor={editor}
                      theme="light"
                      onChange={handleEditorChange} 
                    />
                  )}
                </>
              ) : (
                // HTML Editor (with live preview in a spoiler)
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    minRows={20}
                    value={formData.content || ''}
                    onChange={(e) => handleChange('content', e.target.value)}
                    variant="outlined"
                    error={!!errors.content}
                    sx={{ height: 'auto' }}
                    placeholder="<html>\n  <body>\n    <h1>Your HTML Content</h1>\n    <p>Enter HTML content here...</p>\n  </body>\n</html>"
                  />
                  <details style={{ marginTop: 8, cursor: 'pointer' }}>
                    <summary>Live Preview</summary>
                    <div
                      style={{
                        border: '1px solid #ccc',
                        padding: 8,
                        borderRadius: 4,
                        marginTop: 8,
                        backgroundColor: '#fafafa'
                      }}
                      dangerouslySetInnerHTML={{ __html: formData.content || '' }}
                    />
                  </details>
                </Box>
              )}
            </Paper>
            
            <FormHelperText sx={{ mt: 1 }}>
              {contentType === 'markdown' 
                ? 'Create your information content using the Markdown editor. You can switch to raw markdown mode with the icon in the top-right.' 
                : 'Enter HTML code directly. HTML mode provides more design flexibility but requires HTML knowledge.'
              }
            </FormHelperText>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default InfoView;