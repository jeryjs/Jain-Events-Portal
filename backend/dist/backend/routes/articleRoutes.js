"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articles_1 = require("@services/articles");
const auth_1 = require("@middlewares/auth");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
// Rate limiter to prevent abuse (1 request per minute per article)
const viewCountLimiter = (0, express_rate_limit_1.default)({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 1,
    message: 'Article already marked as read!',
    keyGenerator: function (req, res) {
        return req.ip + '-' + req.params.articleId; // Unique key per IP and article ID
    },
});
/**
 * Article Routes
 */
// Get all articles
router.get('/articles', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articles = yield (0, articles_1.getArticles)();
        res.json(articles);
    }
    catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Error fetching articles', details: error });
    }
}));
// Get article by ID
router.get('/articles/:articleId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const article = yield (0, articles_1.getArticleById)(req.params.articleId);
        if (article) {
            res.json(article);
        }
        else {
            res.status(404).json({ message: 'Article not found' });
        }
    }
    catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ message: 'Error fetching article', details: error });
    }
}));
// Create new article
router.post('/articles', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newArticle = yield (0, articles_1.createArticle)(req.body);
        res.status(201).json(newArticle);
    }
    catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ message: 'Error creating article', details: error });
    }
}));
// Update article
router.patch('/articles/:articleId', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedArticle = yield (0, articles_1.updateArticle)(req.params.articleId, req.body);
        res.json(updatedArticle);
    }
    catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ message: 'Error updating article', details: JSON.stringify(error) });
    }
}));
// Delete article
router.delete('/articles/:articleId', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, articles_1.deleteArticle)(req.params.articleId);
        if (result) {
            res.json({ message: 'Article successfully deleted' });
        }
        else {
            res.status(404).json({ message: 'Article not found' });
        }
    }
    catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ message: 'Error deleting article', details: error });
    }
}));
// Update article view count
router.post('/articles/:articleId/view', viewCountLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articleId = req.params.articleId;
        const article = yield (0, articles_1.updateArticleViewCount)(articleId);
        if (article) {
            res.json({ message: 'View count updated successfully' });
        }
        else {
            res.status(404).json({ message: 'Article not found' });
        }
    }
    catch (error) {
        console.error('Error updating article view count:', error);
        res.status(500).json({ message: 'Error updating article view count', details: error });
    }
}));
exports.default = router;
