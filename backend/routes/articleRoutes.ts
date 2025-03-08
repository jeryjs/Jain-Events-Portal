import { Router, Request, Response } from 'express';
import { 
    getArticles, 
    getArticleById, 
    createArticle, 
    updateArticle, 
    deleteArticle,
} from "@services/articles";
import { adminMiddleware } from '@middlewares/auth';

const router = Router();

/**
 * Article Routes
 */

// Get all articles
router.get('/articles', async (_: Request, res: Response) => {
    try {
        const articles = await getArticles();
        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Error fetching articles', details: error });
    }
});

// Get article by ID
router.get('/articles/:articleId', async (req: Request, res: Response) => {
    try {
        const article = await getArticleById(req.params.articleId);
        if (article) {
            res.json(article);
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ message: 'Error fetching article', details: error });
    }
});

// Create new article
router.post('/articles', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const newArticle = await createArticle(req.body);
        res.status(201).json(newArticle);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ message: 'Error creating article', details: error });
    }
});

// Update article
router.patch('/articles/:articleId', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const updatedArticle = await updateArticle(req.params.articleId, req.body);
        res.json(updatedArticle);
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ message: 'Error updating article', details: JSON.stringify(error) });
    }
});

// Delete article
router.delete('/articles/:articleId', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const result = await deleteArticle(req.params.articleId);
        if (result) {
            res.json({ message: 'Article successfully deleted' });
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ message: 'Error deleting article', details: error });
    }
});

export default router;