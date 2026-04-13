import ArticleCard from '@components/Articles/ArticleCard';
import ArticleList from '@components/Articles/ArticleList';
import ArticlesHeader from '@components/Articles/ArticlesHeader';
import RecentArticles from '@components/Articles/RecentArticles';
import { useLogin } from '@components/shared';
import PageTransition from '@components/shared/PageTransition';
import { useArticles } from '@hooks/useApi';
import { Box, Container, Skeleton, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useColorMode } from '@utils/ColorMode';
import { ItemVisibility, Role } from '@common/constants';

const ArticlesPage: React.FC = () => {
  const colorMode = useColorMode();
  const navigate = useNavigate();
  const { userData } = useLogin();
  const isAdmin = (userData?.role ?? Role.GUEST) >= Role.ADMIN;
  const { data, isLoading, error } = useArticles();
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarked, setBookmarked] = useState<string[]>([]);

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

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h5">Failed to load articles. Please try again later.</Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Error: {error.message}
          </Typography>
        </Box>
      </Container>
    );
  }

  // Filter and sort articles
  const articles = data!
    .filter(article => isAdmin || article.visibility !== ItemVisibility.PRIVATE)
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

  const toggleBookmark = (id: string) => {
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
            <Typography variant="h5" sx={{ color: "text.primary", mt: 6, mb: 3, fontWeight: 700 }}>
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