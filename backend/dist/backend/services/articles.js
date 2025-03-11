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
exports.deleteArticle = exports.updateArticle = exports.createArticle = exports.getArticleById = exports.getArticles = void 0;
const Article_1 = __importDefault(require("@common/models/Article"));
const utils_1 = require("@common/utils");
const cache_1 = require("@config/cache");
const firebase_1 = __importDefault(require("@config/firebase"));
// Collection references
const articlesCollection = firebase_1.default.collection('articles');
/**
 * Get all articles
 */
const getArticles = () => __awaiter(void 0, void 0, void 0, function* () {
    const cachedArticles = cache_1.cache.get("articles");
    if (cachedArticles) {
        console.log(`📦 Serving cached articles`);
        return cachedArticles;
    }
    const snapshot = yield articlesCollection.get();
    const articles = (0, utils_1.parseArticles)(snapshot.docs.map(doc => doc.data()));
    cache_1.cache.set("articles", articles, cache_1.TTL.ARTICLES);
    return articles;
});
exports.getArticles = getArticles;
/**
 * Get article by ID
 */
const getArticleById = (articleId) => __awaiter(void 0, void 0, void 0, function* () {
    const cachedArticle = cache_1.cache.get(`articles-${articleId}`);
    if (cachedArticle) {
        console.log(`📦 Serving cached article ${articleId}`);
        return cachedArticle;
    }
    const doc = yield articlesCollection.doc(articleId).get();
    if (!doc.exists)
        return null;
    const articleData = Article_1.default.parse(doc.data());
    cache_1.cache.set(`articles-${articleId}`, articleData, cache_1.TTL.ARTICLES);
    return articleData;
});
exports.getArticleById = getArticleById;
/**
 * Create new article
 */
const createArticle = (articleData) => __awaiter(void 0, void 0, void 0, function* () {
    const article = Article_1.default.parse(articleData);
    const articleDoc = articlesCollection.doc(article.id);
    yield articleDoc.set(article.toJSON());
    cache_1.cache.set(`articles-${article.id}`, article, cache_1.TTL.ARTICLES);
    cache_1.cache.del("articles");
    return article;
});
exports.createArticle = createArticle;
/**
 * Update existing article
 */
const updateArticle = (articleId, articleData) => __awaiter(void 0, void 0, void 0, function* () {
    const article = Article_1.default.parse(articleData);
    const articleDoc = articlesCollection.doc(article.id);
    yield articleDoc.update(article.toJSON());
    cache_1.cache.set(`articles-${articleId}`, article, cache_1.TTL.ARTICLES);
    cache_1.cache.del("articles");
    return article;
});
exports.updateArticle = updateArticle;
/**
 * Delete article
 */
const deleteArticle = (articleId) => __awaiter(void 0, void 0, void 0, function* () {
    const articleDoc = articlesCollection.doc(articleId);
    const doc = yield articleDoc.get();
    if (!doc.exists)
        return false;
    yield articleDoc.delete();
    cache_1.cache.del(`articles-${articleId}`);
    cache_1.cache.del("articles");
    return true;
});
exports.deleteArticle = deleteArticle;
