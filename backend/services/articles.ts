import Article from '@common/models/Article';
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

/**
 * Get all articles
 */
export const getArticles = async () => {
  return getCachedCollection<Article>({
    key: COLLECTION_KEY,
    fetchFn: async () => {
      const snapshot = await articlesCollection.get();
      return parseArticles(snapshot.docs.map(doc => doc.data()));
    },
    ttl: TTL.ARTICLES
  });
};

/**
 * Get article by ID
 */
export const getArticleById = async (articleId: string) => {
  return getCachedItem<Article>({
    key: `${ITEM_KEY_PREFIX}-${articleId}`,
    fetchFn: async () => {
      const doc = await articlesCollection.doc(articleId).get();
      if (!doc.exists) return null;
      return Article.parse(doc.data());
    },
    ttl: TTL.ARTICLES
  });
};

/**
 * Update article view count
 */
export const updateArticleViewCount = async (articleId: string) => {
  const articleKey = `${ITEM_KEY_PREFIX}-${articleId}`;
  let articleData: Article | null = cache.get(articleKey) as Article;
  
  if (!articleData) {
    console.log(`🔥 Database: Fetching article by ID for view count update: ${articleId}`);
    const doc = await articlesCollection.doc(articleId).get();
    if (!doc.exists) return null;
    articleData = Article.parse(doc.data());
  }
  
  articleData.viewCount = (articleData.viewCount || 0) + 1;
  
  return updateCachedItem<Article>({
    item: articleData,
    collectionKey: COLLECTION_KEY,
    itemKeyPrefix: ITEM_KEY_PREFIX,
    updateFn: async (item) => {
      await articlesCollection.doc(item.id).update({ viewCount: item.viewCount });
    },
    ttl: TTL.ARTICLES
  });
};

/**
 * Create new article
 */
export const createArticle = async (articleData: any) => {
  const article = Article.parse(articleData);
  
  return createCachedItem<Article>({
    item: article,
    collectionKey: COLLECTION_KEY,
    itemKeyPrefix: ITEM_KEY_PREFIX,
    saveFn: async (item) => {
      await articlesCollection.doc(item.id).set(item.toJSON());
    },
    ttl: TTL.ARTICLES
  });
};

/**
 * Update existing article
 */
export const updateArticle = async (articleId: string, articleData: any) => {
  const article = Article.parse(articleData);
  
  return updateCachedItem<Article>({
    item: article,
    collectionKey: COLLECTION_KEY,
    itemKeyPrefix: ITEM_KEY_PREFIX,
    updateFn: async (item) => {
      await articlesCollection.doc(item.id).update(item.toJSON());
    },
    ttl: TTL.ARTICLES
  });
};

/**
 * Delete article
 */
export const deleteArticle = async (articleId: string) => {
  const articleDoc = articlesCollection.doc(articleId);
  const doc = await articleDoc.get();
  
  if (!doc.exists) return false;
  
  return deleteCachedItem<Article>({
    id: articleId,
    collectionKey: COLLECTION_KEY,
    itemKeyPrefix: ITEM_KEY_PREFIX,
    deleteFn: async () => {
      await articleDoc.delete();
    },
    ttl: TTL.ARTICLES
  });
};