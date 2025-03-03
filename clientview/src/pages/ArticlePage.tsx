import {
  Box,
  Container,
  Grid2 as Grid,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Components
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import ArticleContent from '@components/Article/ArticleContent';
import ArticleHero from '@components/Article/ArticleHero';
import RecentArticles from '@components/Articles/RecentArticles';
import PageTransition from '@components/shared/PageTransition';
import { useArticles } from '@hooks/useApi';
import { ColorModeContext } from '../App';
import { generateLoremMarkdown } from '@utils/loremMarkdownGenerator';
import ArticleSkeleton from '@components/Article/ArticleSkeleton';

const ArticlePage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isDarkMode = theme.palette.mode === 'dark';
  const editor = useCreateBlockNote({});
  
  const { data: allArticles, isLoading: articleLoading } = useArticles();
  const article = allArticles?.find(a => a.id === articleId);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);

  useEffect(() => {
    if (allArticles) {
      // Get recent articles, excluding current article
      const recents = allArticles
        .filter(a => a.id !== articleId && (a.isRecent || a.isTrending))
        .slice(0, 5);
      setRecentArticles(recents);
      
      // Check if article exists before accessing content
      if (article && article.content) {
        const loremIpsum = generateLoremMarkdown(5);
        const dummyContent = article.content + "\n\n" + loremIpsum;
        editor.tryParseMarkdownToBlocks(dummyContent)
          .then((blocks) => {
            editor.replaceBlocks(editor.document, blocks);
          }).catch(err => {
            console.error("Error parsing markdown:", err);
          });
      }
    }
    
    // Reset page scroll on load
    window.scrollTo(0, 0);
  }, [allArticles, articleId, article, editor]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggleBookmark = () => {
    setBookmarked(prev => !prev);
  };

  const handleShare = async () => {
    if (!article) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing: ', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a tooltip/snackbar here to confirm copy
    }
  };

  if (articleLoading) {
    return <ArticleSkeleton />;
  }

  return (
    <PageTransition>
      <Box sx={{ position: 'relative' }}>
        <ArticleHero
          article={article}
          onBack={handleBack}
          onToggleTheme={colorMode.toggleColorMode}
          isDarkMode={isDarkMode}
        />

        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Main Content Area */}
            <Grid size={{ xs: 12, md: 8 }}>
              <ArticleContent
                article={article}
                bookmarked={bookmarked}
                onToggleBookmark={handleToggleBookmark}
                onShare={handleShare}
                relatedArticles={allArticles || []}
                editor={editor}
                theme={theme}
              />
            </Grid>

            {/* Recent Articles Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  position: { md: 'sticky' },
                  top: { md: 24 },
                  mt: { xs: 0, md: 0 }
                }}
              >
                <RecentArticles articles={recentArticles} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </PageTransition>
  );
};

export default ArticlePage;