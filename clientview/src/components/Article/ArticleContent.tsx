import React from 'react';
import { Box, Typography, Chip, Paper, Divider, IconButton, Button } from '@mui/material';
import { styled, alpha, Theme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import ShareIcon from '@mui/icons-material/Share';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { BlockNoteView } from "@blocknote/mantine";

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingInline: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(3),
  boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.08)}`,
  [theme.breakpoints.down('sm')]: {
    paddingInline: theme.spacing(2),
  },
}));

const ArticleMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  // margin: theme.spacing(2, 0),
}));

const MetaItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  '& > svg': {
    marginRight: theme.spacing(0.75),
    fontSize: '1rem',
  },
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  margin: theme.spacing(3, 0),
}));

const MarkdownContent = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    ".bn-default-styles": {
      fontSize: '0.9rem',
    }
  },
  ".bn-editor": {
    padding: 0,
  },
}));

interface ArticleContentProps {
  article: any;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
  relatedArticles: any[];
  editor: any;
  theme: Theme;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ 
  article, 
  bookmarked, 
  onToggleBookmark, 
  onShare, 
  relatedArticles,
  editor,
  theme
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <ContentPaper>
        {/* Article Meta Information */}
        <ArticleMeta>
          <MetaItem>
            <AccessTimeIcon />
            <Typography variant="body2">
              {article.readingTimeMinutes} min read
            </Typography>
          </MetaItem>
          <MetaItem>
            <VisibilityIcon />
            <Typography variant="body2">
              {article.viewCount} views
            </Typography>
          </MetaItem>
          <MetaItem>
            <CalendarTodayIcon />
            <Typography variant="body2">
              {new Date(article.publishedAt).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'short', day: 'numeric' 
              })}
            </Typography>
          </MetaItem>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <IconButton onClick={onToggleBookmark} color={bookmarked ? 'primary' : 'default'} size="small">
              {bookmarked ? <BookmarkAddedIcon /> : <BookmarkAddIcon />}
            </IconButton>
            <IconButton onClick={onShare} size="small">
              <ShareIcon />
            </IconButton>
          </Box>
        </ArticleMeta>

        {/* Article Summary */}
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 4, 
            fontSize: '1.1rem', 
            fontWeight: 500,
            color: 'text.secondary',
            fontStyle: 'italic'
          }}
        >
          {article.summary}
        </Typography>

        <Divider sx={{ my: 3 }} />
        
        {/* Article Content */}
        <MarkdownContent>
          <BlockNoteView editor={editor} editable={false} theme={theme.palette.mode} />
        </MarkdownContent>

        {/* Tags */}
        {article.tags.length > 0 && (
          <TagsContainer>
            {article.tags.map((tag: string) => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                variant="outlined" 
                sx={{ fontWeight: 500 }}
              />
            ))}
          </TagsContainer>
        )}

        {/* Related Articles Links */}
        {article.relatedArticleIds.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Related Articles
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {article.relatedArticleIds.map((relatedId: string) => {
                const relatedArticle = relatedArticles?.find(a => a.id === relatedId);
                if (!relatedArticle) return null;
                
                return (
                  <Button 
                    key={relatedId}
                    component={Link}
                    to={`/articles/${relatedId}`}
                    variant="text"
                    sx={{ 
                      textAlign: 'left', 
                      justifyContent: 'flex-start',
                      color: 'text.primary',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    {relatedArticle.title}
                  </Button>
                );
              })}
            </Box>
          </Box>
        )}
      </ContentPaper>
    </motion.div>
  );
};

export default ArticleContent;