import { Article } from '@common/models';
import { Grid } from '@mui/material';
import React from 'react';
import ArticleCard from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  bookmarked: string[];
  onToggleBookmark: (id: string) => void;
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, bookmarked, onToggleBookmark }) => {
  return (
    <Grid container spacing={3}>
      {articles.map((article, index) => (
        <Grid item xs={12} md={6} key={article.id}>
          <ArticleCard
            variant="list"
            article={article}
            bookmarked={bookmarked.includes(article.id)}
            onToggleBookmark={onToggleBookmark}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ArticleList;