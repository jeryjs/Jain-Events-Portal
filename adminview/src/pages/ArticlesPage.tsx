import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Container, Paper, Grid2 as Grid, Card, IconButton } from '@mui/material';

import { ArticlesList, ArticleForm } from '../components/Articles';
import { useArticle, useCreateArticle, useUpdateArticle, useDeleteArticle } from '@hooks/App';
import { Article } from '@common/models';

const ArticlesPage = () => {
    const { articleId } = useParams<{ articleId: string }>();
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(articleId === 'create');

    // Fetch article data if editing
    const articleQuery = useArticle(articleId, !isCreating && !!articleId);
    const createMutation = useCreateArticle();
    const updateMutation = useUpdateArticle();
    const deleteMutation = useDeleteArticle();

    // Handle article selection
    const handleSelectArticle = (id: string) => {
        setIsCreating(false);
        navigate(`/articles/${id}`);
    };

    // Handle create new article action
    const handleCreateArticle = () => {
        setIsCreating(true);
        navigate('/articles/create');
    };

    // Handle save (create or update)
    const handleSaveArticle = async (formData: Article) => {
        if (isCreating) {
            await createMutation.mutateAsync(formData, {
                onSuccess: (newArticle) => {
                    setIsCreating(false);
                    navigate(`/articles/${newArticle.id}`);
                }
            });
        } else if (articleId) {
            await updateMutation.mutateAsync(formData, {
                onSuccess: () => navigate(`/articles/${articleId}`),
            });
        }
    };

    const handleDeleteArticle = async (articleId: string) => {
        await deleteMutation.mutateAsync(articleId, {
            onSuccess: () => {
                navigate('/articles');
            },
        });
    };

    return (
        <Container maxWidth={false} sx={{ height: '100vh', py: 3 }}>
            <Card sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Article Management
                </Typography>

                <IconButton component={Link} to="/events">
                    go to events
                </IconButton>
            </Card>

            <Grid container spacing={3} sx={{ height: 'calc(100% - 60px)', width: '100%' }}>
                {/* Left pane - Articles list */}
                <Grid flex={1}>
                    <ArticlesList
                        selectedArticleId={articleId}
                        onSelectArticle={handleSelectArticle}
                        onCreateArticle={handleCreateArticle}
                    />
                </Grid>

                {/* Right pane - Article form */}
                <Grid flex={2.8}>
                    {!articleId && !isCreating ? (
                        <Paper
                            elevation={2}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                p: 4,
                                borderRadius: 2,
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: 2 }}>
                                Select an article or create a new one
                            </Typography>
                            <Typography color="text.secondary">
                                Use the list on the left to select an existing article or click "Create Article"
                            </Typography>
                        </Paper>
                    ) : (
                        <Box sx={{ height: '100%' }}>
                            <ArticleForm
                                article={articleQuery.data}
                                isCreating={isCreating}
                                onSave={handleSaveArticle}
                                onDelete={handleDeleteArticle}
                            />
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default ArticlesPage;