import Article from '@common/models/Article';
import { parseArticles } from '@common/utils';
import { cache, TTL } from '@config/cache';
import db from '@config/firebase';

// Collection references
const articlesCollection = db.collection('articles');


/**
 * Get all articles
 */
export const getArticles = async () => {
    const cachedArticles = cache.get("articles");

    if (cachedArticles) {
        console.log(`📦 Serving cached articles`);
        return cachedArticles as Article[];
    }
    const snapshot = await articlesCollection.get();
    const articles = parseArticles(snapshot.docs.map(doc => doc.data()));

    cache.set("articles", articles, TTL.ARTICLES);

    return articles;
};

/**
 * Get article by ID
 */
export const getArticleById = async (articleId: string) => {
    const cachedArticle = cache.get(`articles-${articleId}`);

    if (cachedArticle) {
        console.log(`📦 Serving cached article ${articleId}`);
        return cachedArticle as Article;
    }

    const doc = await articlesCollection.doc(articleId).get();
    
    if (!doc.exists) return null;

    const articleData = Article.parse(doc.data());
    cache.set(`articles-${articleId}`, articleData, TTL.ARTICLES);
    
    return articleData;
};

/**
 * Update article view count
 */
export const updateArticleViewCount = async (articleId: string) => {
  const cachedArticle = cache.get(`articles-${articleId}`);
  let articleData: Article | undefined;

  if (cachedArticle) {
    console.log(`📦 Serving cached article ${articleId} from cache`);
    articleData = cachedArticle as Article;
  } else {
    const doc = await articlesCollection.doc(articleId).get();

    if (!doc.exists) return null;

    articleData = Article.parse(doc.data());
  }

  if (!articleData) return null;

  articleData.viewCount = (articleData.viewCount || 0) + 1;
  await articlesCollection.doc(articleId).update({ viewCount: articleData.viewCount });
  cache.set(`articles-${articleId}`, articleData, TTL.ARTICLES); // Update cache with new view count

  return articleData;
};

/**
 * Create new article
 */
export const createArticle = async (articleData: any) => {
    const article = Article.parse(articleData);
    const articleDoc = articlesCollection.doc(article.id);
    
    await articleDoc.set(article.toJSON());

    cache.set(`articles-${article.id}`, article, TTL.ARTICLES);
    cache.del("articles");
    
    return article;
};

/**
 * Update existing article
 */
export const updateArticle = async (articleId: string, articleData: any) => {
    const article = Article.parse(articleData);
    const articleDoc = articlesCollection.doc(article.id);
    
    await articleDoc.update(article.toJSON());

    cache.set(`articles-${articleId}`, article, TTL.ARTICLES);
    cache.del("articles");

    return article;
};

/**
 * Delete article
 */
export const deleteArticle = async (articleId: string) => {
    const articleDoc = articlesCollection.doc(articleId);
    const doc = await articleDoc.get();
    
    if (!doc.exists) return false;
    
    await articleDoc.delete();
    
    cache.del(`articles-${articleId}`);
    cache.del("articles");
    
    return true;
};