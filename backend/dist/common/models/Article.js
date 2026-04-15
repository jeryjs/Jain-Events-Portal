"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@common/constants");
class Article {
    constructor(id, title, summary, content, publishedAt, lastUpdatedAt, author, image, relatedEventType, tags = [], status = constants_1.ArticleStatus.PUBLISHED, viewCount = 0, relatedArticleIds = []) {
        this.id = id;
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.publishedAt = publishedAt;
        this.lastUpdatedAt = lastUpdatedAt;
        this.author = author;
        this.image = image;
        this.relatedEventType = relatedEventType;
        this.tags = tags;
        this.status = status;
        this.viewCount = viewCount;
        this.relatedArticleIds = relatedArticleIds;
    }
    static parse(data) {
        return new Article(data.id || '', data.title || '', data.summary || '', data.content || '', data.publishedAt ? new Date(data.publishedAt) : new Date(), data.lastUpdatedAt ? new Date(data.lastUpdatedAt) : new Date(), data.author || { id: '', name: '' }, data.image || { url: '' }, data.relatedEventType || undefined, data.tags || [], data.status || constants_1.ArticleStatus.PUBLISHED, data.viewCount || 0, data.relatedArticleIds || []);
    }
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            summary: this.summary,
            content: this.content,
            publishedAt: this.publishedAt.toISOString(),
            lastUpdatedAt: this.lastUpdatedAt.toISOString(),
            author: this.author,
            image: this.image,
            relatedEventType: this.relatedEventType,
            tags: this.tags,
            status: this.status,
            viewCount: this.viewCount,
            relatedArticleIds: this.relatedArticleIds,
        };
    }
    // Convert article image CSS string to object
    get imageStyles() {
        if (!this.image.customCss)
            return {};
        return this.image.customCss
            .split(";")
            .filter(Boolean)
            .reduce((styleObj, rule) => {
            const [prop, value] = rule.split(":").map(s => s.trim());
            if (prop && value) {
                // Convert kebab-case to camelCase
                const camelProp = prop.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
                styleObj[camelProp] = value;
            }
            return styleObj;
        }, {});
    }
    // Get article publication date as a human-readable string
    get dateString() {
        return this.publishedAt.toDateString();
    }
    // Get related event type as a human-readable string
    get eventTypeString() {
        if (this.relatedEventType === undefined || this.relatedEventType === null) {
            return '';
        }
        return constants_1.EventType[this.relatedEventType] || '';
    }
    // Get estimated reading time based on content length
    get readingTimeMinutes() {
        const wordsPerMinute = 200;
        const wordCount = this.content.trim().split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }
    // Check if article is recently published (within last 7 days)
    get isRecent() {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        return this.publishedAt > new Date(sevenDaysAgo);
    }
    // Check if article is trending (view count > 50)
    get isTrending() {
        return this.viewCount > 50;
    }
}
exports.default = Article;
