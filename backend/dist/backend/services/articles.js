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
exports.invalidateArticlesCache = exports.deleteArticle = exports.updateArticle = exports.createArticle = exports.updateArticleViewCount = exports.getArticleById = exports.getArticles = void 0;
const Article_1 = __importDefault(require("@common/models/Article"));
const constants_1 = require("@common/constants");
const utils_1 = require("@common/utils");
const cache_1 = require("@config/cache");
const firebase_1 = __importDefault(require("@config/firebase"));
const cacheUtils_1 = require("@utils/cacheUtils");
// Collection references
const articlesCollection = firebase_1.default.collection('articles');
const COLLECTION_KEY = "articles";
const ITEM_KEY_PREFIX = "articles";
const getVisibilityScope = (user) => { var _a; return (((_a = user === null || user === void 0 ? void 0 : user.role) !== null && _a !== void 0 ? _a : constants_1.Role.GUEST) >= constants_1.Role.ADMIN ? 'admin' : 'public'); };
const getCollectionKey = (user) => `${COLLECTION_KEY}-${getVisibilityScope(user)}`;
const getItemKey = (articleId, user) => `${ITEM_KEY_PREFIX}-${articleId}-${getVisibilityScope(user)}`;
const filterArticleForUser = (article, user) => {
    var _a;
    if ((article === null || article === void 0 ? void 0 : article.visibility) === constants_1.ItemVisibility.PRIVATE && ((_a = user === null || user === void 0 ? void 0 : user.role) !== null && _a !== void 0 ? _a : constants_1.Role.GUEST) < constants_1.Role.ADMIN) {
        return null;
    }
    return article;
};
/**
 * Get all articles
 */
const getArticles = (user) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, cacheUtils_1.getCachedCollection)({
        key: getCollectionKey(user),
        fetchFn: () => __awaiter(void 0, void 0, void 0, function* () {
            const snapshot = yield articlesCollection.get();
            return (0, utils_1.parseArticles)(snapshot.docs
                .map(doc => filterArticleForUser(doc.data(), user))
                .filter(Boolean));
        }),
        ttl: cache_1.TTL.ARTICLES
    });
});
exports.getArticles = getArticles;
/**
 * Get article by ID
 */
const getArticleById = (articleId, user) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, cacheUtils_1.getCachedItem)({
        key: getItemKey(articleId, user),
        fetchFn: () => __awaiter(void 0, void 0, void 0, function* () {
            const doc = yield articlesCollection.doc(articleId).get();
            if (!doc.exists)
                return null;
            const filtered = filterArticleForUser(doc.data(), user);
            if (!filtered)
                return null;
            return Article_1.default.parse(filtered);
        }),
        ttl: cache_1.TTL.ARTICLES
    });
});
exports.getArticleById = getArticleById;
/**
 * Update article view count
 */
const updateArticleViewCount = (articleId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const articleKey = getItemKey(articleId, user);
    let articleData = cache_1.cache.get(articleKey);
    if (!articleData) {
        console.log(`🔥 Database: Fetching article by ID for view count update: ${articleId}`);
        const doc = yield articlesCollection.doc(articleId).get();
        if (!doc.exists)
            return null;
        const filtered = filterArticleForUser(doc.data(), user);
        if (!filtered)
            return null;
        articleData = Article_1.default.parse(filtered);
    }
    articleData.viewCount = (articleData.viewCount || 0) + 1;
    const updated = yield (0, cacheUtils_1.updateCachedItem)({
        item: articleData,
        collectionKey: getCollectionKey(user),
        itemKeyPrefix: ITEM_KEY_PREFIX,
        updateFn: (item) => __awaiter(void 0, void 0, void 0, function* () {
            yield articlesCollection.doc(item.id).update({ viewCount: item.viewCount });
        }),
        ttl: cache_1.TTL.ARTICLES
    });
    cache_1.cache.keys().forEach(key => {
        if (key.startsWith(`${ITEM_KEY_PREFIX}-${articleId}-`) || key.startsWith(`${COLLECTION_KEY}-`)) {
            cache_1.cache.del(key);
        }
    });
    return updated;
});
exports.updateArticleViewCount = updateArticleViewCount;
/**
 * Create new article
 */
const createArticle = (articleData) => __awaiter(void 0, void 0, void 0, function* () {
    const article = Article_1.default.parse(articleData);
    const created = yield (0, cacheUtils_1.createCachedItem)({
        item: article,
        collectionKey: `${COLLECTION_KEY}-public`,
        itemKeyPrefix: ITEM_KEY_PREFIX,
        saveFn: (item) => __awaiter(void 0, void 0, void 0, function* () {
            yield articlesCollection.doc(item.id).set(item.toJSON());
        }),
        ttl: cache_1.TTL.ARTICLES
    });
    (0, exports.invalidateArticlesCache)();
    return created;
});
exports.createArticle = createArticle;
/**
 * Update existing article
 */
const updateArticle = (_articleId, articleData) => __awaiter(void 0, void 0, void 0, function* () {
    const article = Article_1.default.parse(articleData);
    const updated = yield (0, cacheUtils_1.updateCachedItem)({
        item: article,
        collectionKey: `${COLLECTION_KEY}-public`,
        itemKeyPrefix: ITEM_KEY_PREFIX,
        updateFn: (item) => __awaiter(void 0, void 0, void 0, function* () {
            yield articlesCollection.doc(item.id).update(item.toJSON());
        }),
        ttl: cache_1.TTL.ARTICLES
    });
    (0, exports.invalidateArticlesCache)();
    return updated;
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
    const deleted = yield (0, cacheUtils_1.deleteCachedItem)({
        id: articleId,
        collectionKey: `${COLLECTION_KEY}-public`,
        itemKeyPrefix: ITEM_KEY_PREFIX,
        deleteFn: () => __awaiter(void 0, void 0, void 0, function* () {
            yield articleDoc.delete();
        }),
        ttl: cache_1.TTL.ARTICLES
    });
    (0, exports.invalidateArticlesCache)();
    return deleted;
});
exports.deleteArticle = deleteArticle;
/**
 * Invalidate cache for articles
 */
const invalidateArticlesCache = () => {
    cache_1.cache.keys().forEach(key => {
        if (key.startsWith(ITEM_KEY_PREFIX) || key.startsWith(COLLECTION_KEY)) {
            cache_1.cache.del(key);
        }
    });
    console.log("Cache invalidated successfully for articles!");
    return "Cache invalidated successfully for articles!";
};
exports.invalidateArticlesCache = invalidateArticlesCache;
