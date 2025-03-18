import { Box, TextField, Typography, Paper, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { InfoActivity } from '@common/models';
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import MarkdownIcon from '@mui/icons-material/CodeTwoTone';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';

interface InfoViewProps {
  formData: InfoActivity;
  setFormData: (data: InfoActivity) => void;
  errors?: Record<string, string>;
}

export const InfoView = ({ formData, setFormData, errors = {} }: InfoViewProps) => {
  const editor = useCreateBlockNote({});
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  
  // Initialize editor with content when component mounts or content changes
  useEffect(() => {
    if (formData.content) {
      editor.tryParseMarkdownToBlocks(formData.content).then((blocks) => {
        editor.replaceBlocks(editor.document, blocks);
      });
    } else {
      editor.replaceBlocks(editor.document, []);
    }
  }, [formData.id]); // Only reinitialize when activity ID changes
  
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

  return (
    <Box>
      {/* Information Content Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
              Content
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
                  theme='light'
                  onChange={handleEditorChange} 
                />
              )}
            </Paper>
            <FormHelperText sx={{ mt: 1 }}>
              Create your information content using the editor above. You can switch between visual editor and markdown modes.
            </FormHelperText>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default InfoView;