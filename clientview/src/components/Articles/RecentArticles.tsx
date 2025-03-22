import { Article } from '@common/models';
import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router-dom';

interface RecentArticlesProps {
    articles: Article[];
}

const SidebarTitle = styled(Typography)(({ theme }) => ({
    position: 'relative',
    fontWeight: 700,
    display: 'inline-block',
    marginBottom: theme.spacing(3),
    '&:after': {
        content: '""',
        position: 'absolute',
        left: 0,
        bottom: -8,
        height: 4,
        width: '40%',
        backgroundColor: theme.palette.primary.main,
        borderRadius: 2,
    }
}));

const RecentArticleItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2, 0),
    '&:not(:last-child)': {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));

const RecentArticleContent = styled(Box)(({ theme }) => ({
    flex: 1,
    paddingLeft: theme.spacing(2),
}));

const RecentArticleImg = styled('img')(({ theme }) => ({
    width: 80,
    height: 80,
    borderRadius: theme.shape.borderRadius,
    objectFit: 'cover',
}));

const RecentArticles: React.FC<RecentArticlesProps> = ({ articles }) => {
    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <SidebarTitle variant="h5">Recent Articles</SidebarTitle>
                {articles.map((article) => (
                    <RecentArticleItem key={article.id}>
                        <Link to={`/articles/${article.id}`} style={{ textDecoration: 'none', display: 'flex', width: '100%' }}>
                            <RecentArticleImg src={article.image.url} alt={article.title} style={article.imageStyles} />
                            <RecentArticleContent>
                                <Typography variant="subtitle1" sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    mb: 0.5
                                }}>
                                    {article.title}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">{article.dateString}</Typography>
                                    {article.eventTypeString && <Chip label={article.eventTypeString} size="small" sx={{ height: 20, fontSize: '0.625rem' }} variant="outlined" />}
                                </Box>
                            </RecentArticleContent>
                        </Link>
                    </RecentArticleItem>
                ))}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="outlined" component={Link} to="/articles" fullWidth>View Archive</Button>
                </Box>
            </motion.div>
        </Paper>
    );
};

export default RecentArticles;