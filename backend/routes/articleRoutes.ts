import { Router, Request, Response } from 'express';
import {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    updateArticleViewCount,
    invalidateArticlesCache,
} from "@services/articles";
import { adminMiddleware } from '@middlewares/auth';
import { getUserFromRequest } from '@utils/authUtils';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const router = Router();

// Rate limiter to prevent abuse (1 request per minute per article)
const viewCountLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 1,
    message: 'Article already marked as read!',
    keyGenerator: function (req: Request, res: Response) {
        // Use ipKeyGenerator to handle IPv6 properly, then append articleId
        return ipKeyGenerator(req.ip ?? '') + '-' + req.params.articleId; // Unique key per IP and article ID
    },
});

/**
 * Article Routes
 */

// Get all articles
router.get('/', async (req: Request, res: Response) => {
    try {
        const userData = await getUserFromRequest(req, true);
        const user = userData ? { role: userData.role, username: userData.username } : undefined;
        const articles = await getArticles(user);
        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Error fetching articles', details: error });
    }
});

// Get article by ID
router.get('/:articleId', async (req: Request, res: Response) => {
    try {
        const userData = await getUserFromRequest(req, true);
        const user = userData ? { role: userData.role, username: userData.username } : undefined;
        const article = await getArticleById(req.params.articleId as string, user);
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
router.post('', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const newArticle = await createArticle(req.body);
        res.status(201).json(newArticle);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ message: 'Error creating article', details: error });
    }
});

// Update article
router.patch('/:articleId', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const updatedArticle = await updateArticle(req.params.articleId as string, req.body);
        res.json(updatedArticle);
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ message: 'Error updating article', details: JSON.stringify(error) });
    }
});

// Delete article
router.delete('/:articleId', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const result = await deleteArticle(req.params.articleId as string);
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

// Update article view count
router.post('/:articleId/view', viewCountLimiter, async (req: Request, res: Response) => {
    try {
        const userData = await getUserFromRequest(req, true);
        const user = userData ? { role: userData.role, username: userData.username } : undefined;
        const article = await updateArticleViewCount(req.params.articleId as string, user);
        if (article) {
            res.json({ message: 'View count updated successfully' });
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        console.error('Error updating article view count:', error);
        res.status(500).json({ message: 'Error updating article view count', details: error });
    }
});

// Invalidate cache for articles
router.post('/invalidate-cache', adminMiddleware, async (req: Request, res: Response) => {
    try {
        const message = await invalidateArticlesCache();
        res.json({ message });
    } catch (error) {
        console.error('Error invalidating cache:', error);
        res.status(500).json({ message: 'Error invalidating cache', details: error });
    }
});

export default router;