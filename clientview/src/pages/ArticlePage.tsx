import {
  Box,
  Container,
  Grid2 as Grid
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Components
import ArticleContent from '@components/Article/ArticleContent';
import ArticleHero from '@components/Article/ArticleHero';
import ArticleSkeleton from '@components/Article/ArticleSkeleton';
import RecentArticles from '@components/Articles/RecentArticles';
import PageTransition from '@components/shared/PageTransition';
import { useArticles, useUpdateArticleViewCount } from '@hooks/useApi';

const ArticlePage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();

  const { data: allArticles, isLoading: articleLoading } = useArticles();
  const article = allArticles?.find(a => a.id === articleId);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const { updateViewCount } = useUpdateArticleViewCount();

  useEffect(() => {
    if (allArticles) {
      // Get recent articles, excluding current article
      const recents = allArticles
        .filter(a => a.id !== articleId && (a.isRecent || a.isTrending))
        .slice(0, 5);
      setRecentArticles(recents);
    }

    // Reset page scroll on load
    window.scrollTo(0, 0);
  }, [allArticles, articleId, article]);

  useEffect(() => {
    if (articleId) {
      updateViewCount(articleId);
    }
  }, [articleId, updateViewCount]);

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