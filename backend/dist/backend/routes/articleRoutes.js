"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articles_1 = require("@services/articles");
const auth_1 = require("@middlewares/auth");
const authUtils_1 = require("@utils/authUtils");
const express_rate_limit_1 = __importStar(require("express-rate-limit"));
const router = (0, express_1.Router)();
// Rate limiter to prevent abuse (1 request per minute per article)
const viewCountLimiter = (0, express_rate_limit_1.default)({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 1,
    message: 'Article already marked as read!',
    keyGenerator: function (req, res) {
        var _a;
        // Use ipKeyGenerator to handle IPv6 properly, then append articleId
        return (0, express_rate_limit_1.ipKeyGenerator)((_a = req.ip) !== null && _a !== void 0 ? _a : '') + '-' + req.params.articleId; // Unique key per IP and article ID
    },
});
/**
 * Article Routes
 */
// Get all articles
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield (0, authUtils_1.getUserFromRequest)(req, true);
        const user = userData ? { role: userData.role, username: userData.username } : undefined;
        const articles = yield (0, articles_1.getArticles)(user);
        res.json(articles);
    }
    catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Error fetching articles', details: error });
    }
}));
// Get article by ID
router.get('/:articleId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield (0, authUtils_1.getUserFromRequest)(req, true);
        const user = userData ? { role: userData.role, username: userData.username } : undefined;
        const article = yield (0, articles_1.getArticleById)(req.params.articleId, user);
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
router.post('', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
router.patch('/:articleId', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
router.delete('/:articleId', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
router.post('/:articleId/view', viewCountLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield (0, authUtils_1.getUserFromRequest)(req, true);
        const user = userData ? { role: userData.role, username: userData.username } : undefined;
        const article = yield (0, articles_1.updateArticleViewCount)(req.params.articleId, user);
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
// Invalidate cache for articles
router.post('/invalidate-cache', auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = yield (0, articles_1.invalidateArticlesCache)();
        res.json({ message });
    }
    catch (error) {
        console.error('Error invalidating cache:', error);
        res.status(500).json({ message: 'Error invalidating cache', details: error });
    }
}));
exports.default = router;
