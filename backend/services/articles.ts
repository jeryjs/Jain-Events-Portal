import Article from '@common/models/Article';
import { ItemVisibility, Role } from '@common/constants';
import { parseArticles } from '@common/utils';
import { cache, TTL } from '@config/cache';
import db from '@config/firebase';
import { 
  getCachedItem, 
  getCachedCollection, 
  createCachedItem, 
  updateCachedItem, 
  deleteCachedItem 
} from '@utils/cacheUtils';

// Collection references
const articlesCollection = db.collection('articles');
const COLLECTION_KEY = "articles";
const ITEM_KEY_PREFIX = "articles";

type RequestUser = { role: number; username: string };

const getVisibilityScope = (user?: RequestUser) => ((user?.role ?? Role.GUEST) >= Role.ADMIN ? 'admin' : 'public');
const getCollectionKey = (user?: RequestUser) => `${COLLECTION_KEY}-${getVisibilityScope(user)}`;
const getItemKey = (articleId: string, user?: RequestUser) => `${ITEM_KEY_PREFIX}-${articleId}-${getVisibilityScope(user)}`;

const filterArticleForUser = (article: any, user?: RequestUser) => {
  if (article?.visibility === ItemVisibility.PRIVATE && (user?.role ?? Role.GUEST) < Role.ADMIN) {
    return null;
  }
  return article;
};

/**
 * Get all articles
 */
export const getArticles = async (user?: RequestUser) => {
  return getCachedCollection<Article>({
    key: getCollectionKey(user),
    fetchFn: async () => {
      const snapshot = await articlesCollection.get();
      return parseArticles(
        snapshot.docs
          .map(doc => filterArticleForUser(doc.data(), user))
          .filter(Boolean)
      );
    },
    ttl: TTL.ARTICLES
  });
};

/**
 * Get article by ID
 */
export const getArticleById = async (articleId: string, user?: RequestUser) => {
  return getCachedItem<Article>({
    key: getItemKey(articleId, user),
    fetchFn: async () => {
      const doc = await articlesCollection.doc(articleId).get();
      if (!doc.exists) return null;
      const filtered = filterArticleForUser(doc.data(), user);
      if (!filtered) return null;
      return Article.parse(filtered);
    },
    ttl: TTL.ARTICLES
  });
};

/**
 * Update article view count
 */
export const updateArticleViewCount = async (articleId: string, user?: RequestUser) => {
  const articleKey = getItemKey(articleId, user);
  let articleData: Article | null = cache.get(articleKey) as Article;
  
  if (!articleData) {
    console.log(`🔥 Database: Fetching article by ID for view count update: ${articleId}`);
    const doc = await articlesCollection.doc(articleId).get();
    if (!doc.exists) return null;
    const filtered = filterArticleForUser(doc.data(), user);
    if (!filtered) return null;
    articleData = Article.parse(filtered);
  }
  
  articleData.viewCount = (articleData.viewCount || 0) + 1;
  
  const updated = await updateCachedItem<Article>({
    item: articleData,
    collectionKey: getCollectionKey(user),
    itemKeyPrefix: ITEM_KEY_PREFIX,
    updateFn: async (item) => {
      await articlesCollection.doc(item.id).update({ viewCount: item.viewCount });
    },
    ttl: TTL.ARTICLES
  });

  cache.keys().forEach(key => {
    if (key.startsWith(`${ITEM_KEY_PREFIX}-${articleId}-`) || key.startsWith(`${COLLECTION_KEY}-`)) {
      cache.del(key);
    }
  });

  return updated;
};

/**
 * Create new article
 */
export const createArticle = async (articleData: any) => {
  const article = Article.parse(articleData);
  
  const created = await createCachedItem<Article>({
    item: article,
    collectionKey: `${COLLECTION_KEY}-public`,
    itemKeyPrefix: ITEM_KEY_PREFIX,
    saveFn: async (item) => {
      await articlesCollection.doc(item.id).set(item.toJSON());
    },
    ttl: TTL.ARTICLES
  });

  invalidateArticlesCache();
  return created;
};

/**
 * Update existing article
 */
export const updateArticle = async (_articleId: string, articleData: any) => {
  const article = Article.parse(articleData);
  
  const updated = await updateCachedItem<Article>({
    item: article,
    collectionKey: `${COLLECTION_KEY}-public`,
    itemKeyPrefix: ITEM_KEY_PREFIX,
    updateFn: async (item) => {
      await articlesCollection.doc(item.id).update(item.toJSON());
    },
    ttl: TTL.ARTICLES
  });

  invalidateArticlesCache();
  return updated;
};

/**
 * Delete article
 */
export const deleteArticle = async (articleId: string) => {
  const articleDoc = articlesCollection.doc(articleId);
  const doc = await articleDoc.get();
  
  if (!doc.exists) return false;
  
  const deleted = await deleteCachedItem<Article>({
    id: articleId,
    collectionKey: `${COLLECTION_KEY}-public`,
    itemKeyPrefix: ITEM_KEY_PREFIX,
    deleteFn: async () => {
      await articleDoc.delete();
    },
    ttl: TTL.ARTICLES
  });

  invalidateArticlesCache();
  return deleted;
};

/**
 * Invalidate cache for articles
 */
export const invalidateArticlesCache = () => {
  cache.keys().forEach(key => {
    if (key.startsWith(ITEM_KEY_PREFIX) || key.startsWith(COLLECTION_KEY)) {
      cache.del(key);
    }
  });
  console.log("Cache invalidated successfully for articles!");
  return "Cache invalidated successfully for articles!";
}