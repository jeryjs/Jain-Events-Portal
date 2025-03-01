import ArticleCard from '@components/Articles/ArticleCard';
import ArticleList from '@components/Articles/ArticleList';
import ArticlesHeader from '@components/Articles/ArticlesHeader';
import RecentArticles from '@components/Articles/RecentArticles';
import PageTransition from '@components/shared/PageTransition';
import { useArticles } from '@hooks/useApi';
import { Box, Container, Skeleton, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColorModeContext } from '../App';

const ArticlesPage: React.FC = () => {
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const { data, isLoading } = useArticles();
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarked, setBookmarked] = useState<number[]>([]);

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ pb: 8, mt: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 4 }} />
        <Skeleton variant="text" height={40} width="60%" sx={{ mb: 2 }} />
        <Grid2 container spacing={3}>
          {Array.from(new Array(6)).map((_, index) => (
            <Grid2 key={index} size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 1 }} />
              <Skeleton variant="text" height={30} />
              <Skeleton variant="text" height={20} width="80%" />
            </Grid2>
          ))}
        </Grid2>
      </Container>
    );
  }

  // Filter and sort articles
  const articles = data
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .filter(article => {
      const searchText = searchTerm.toLowerCase();
      return (
        article.title.toLowerCase().includes(searchText) ||
        article.summary.toLowerCase().includes(searchText) ||
        article.author.name.toLowerCase().includes(searchText)
      );
    });

  if (!articles || articles.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h5">No articles found.</Typography>
      </Container>
    );
  }

  const featuredArticle = articles[0];
  const mainArticles = articles.slice(1);
  // Get recent articles marked as recent. If empty, take the latest 7 articles
  const recentArticles = articles.filter(article => article.isRecent).length > 3
    ? articles.filter(article => article.isRecent)
    : articles.slice(0, 7);

  const toggleBookmark = (id: number) => {
    setBookmarked(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  return (
    <PageTransition>
      <ArticlesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onBack={() => navigate(-1)}
        toggleColorMode={colorMode.toggleColorMode}
        isDarkMode={colorMode.mode === 'dark'}
      />
      <Container maxWidth="xl" sx={{ pb: 8 }}>
        <Grid2 container spacing={4}>
          <Grid2 size={{ xs: 12, md: 8 }}>
            <ArticleCard
              variant="featured"
              article={featuredArticle}
              bookmarked={bookmarked.includes(featuredArticle.id)}
              onToggleBookmark={toggleBookmark}
            />
            <Typography variant="h5" color="text.primary" sx={{ mt: 6, mb: 3, fontWeight: 700 }}>
              All Articles
            </Typography>
            <ArticleList
              articles={mainArticles}
              bookmarked={bookmarked}
              onToggleBookmark={toggleBookmark}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                position: { md: 'sticky' },
                top: { md: 24 },
                mt: { xs: 4, md: 0 }
              }}
            >
              <RecentArticles articles={recentArticles} />
            </Box>
          </Grid2>
        </Grid2>
      </Container>
    </PageTransition>
  );
};

export default ArticlesPage;