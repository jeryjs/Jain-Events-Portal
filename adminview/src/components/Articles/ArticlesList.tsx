import { memo } from 'react';
import { Box, Typography, Button, Paper, Skeleton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ArticleCard } from './ArticleCard';
import { useArticles } from '@hooks/App';
import { Article } from '@common/models';

interface ArticlesListProps {
  selectedArticleId?: string;
  onSelectArticle: (id: string) => void;
  onCreateArticle: () => void;
  collapsed?: boolean;
}

export const ArticlesList = memo(({ 
  selectedArticleId, 
  onSelectArticle, 
  onCreateArticle,
  collapsed = false
}: ArticlesListProps) => {
  const { data: articles, isLoading } = useArticles();
  
  const handleSelectArticle = (id: string) => {
    onSelectArticle(id);
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      width: collapsed ? 'auto' : 300,
      transition: 'width 0.3s ease'
    }}>
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        justifyContent: collapsed ? 'center' : 'space-between', 
        alignItems: 'center',
        px: collapsed ? 0 : 1
      }}>
        {!collapsed && (
          <Typography variant="h6" component="h2">
            Articles
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={onCreateArticle}
          startIcon={!collapsed && <AddIcon />}
          sx={{ 
            minWidth: collapsed ? '48px' : 'auto',
            width: collapsed ? '48px' : 'auto',
            borderRadius: collapsed ? '50%' : undefined,
            p: collapsed ? 1 : undefined
          }}
        >
          {collapsed ? <AddIcon /> : "Create Article"}
        </Button>
      </Box>
      
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          borderRadius: 2, 
          flexGrow: 1, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column' 
        }}
      >
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
              </Box>
            ))
          ) : !articles || articles.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 100 }}>
              <Typography color="text.secondary" align="center">
                No articles available. Create one to get started.
              </Typography>
            </Box>
          ) : (
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {articles.map((article: Article) => (
                <Box component="li" key={article.id} sx={{ mb: 2 }}>
                  <ArticleCard
                    article={article}
                    isSelected={article.id === selectedArticleId}
                    collapsed={collapsed}
                    onClick={() => handleSelectArticle(article.id)}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
});

ArticlesList.displayName = 'ArticlesList';