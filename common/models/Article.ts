import { EventType, ArticleStatus } from "@common/constants";

export default class Article {
  constructor(
    public id: string,
    public title: string,
    public summary: string,
    public markdownContent: string,
    public publishedAt: Date,
    public lastUpdatedAt: Date,
    public author: {
      id: string,
      name: string,
      avatar?: string,
    },
    public image: {
      url: string,
      alt?: string,
      customCss?: string,
    },
    public relatedEventType?: EventType,
    public tags: string[] = [],
    public status: ArticleStatus = ArticleStatus.PUBLISHED,
    public viewCount: number = 0,
    public relatedArticleIds: string[] = [],
  ) {}
  
  static parse(data: any): Article {
    return new Article(
      data.id || '',
      data.title || '',
      data.summary || '',
      data.markdownContent || '',
      data.publishedAt ? new Date(data.publishedAt) : new Date(),
      data.lastUpdatedAt ? new Date(data.lastUpdatedAt) : new Date(),
      data.author || { id: '', name: '' },
      data.image || { url: '' },
      data.relatedEventType || undefined,
      data.tags || [],
      data.status || ArticleStatus.PUBLISHED,
      data.viewCount || 0,
      data.relatedArticleIds || []
    );
  }
  
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      summary: this.summary,
      markdownContent: this.markdownContent,
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
  get imageStyles(): Record<string, string> {
    if (!this.image.customCss) return {};
    
    return this.image.customCss
      .split(";")
      .filter(Boolean)
      .reduce<Record<string, string>>((styleObj, rule) => {
        const [prop, value] = rule.split(":").map(s => s.trim());
        if (prop && value) {
          // Convert kebab-case to camelCase
          const camelProp = prop.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
          styleObj[camelProp] = value;
        }
        return styleObj;
      }, {});
  }
  
  // Get estimated reading time based on content length
  get readingTimeMinutes(): number {
    const wordsPerMinute = 200;
    const wordCount = this.markdownContent.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
  
  // Check if article is recently published (within last 7 days)
  get isRecent(): boolean {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.publishedAt > oneWeekAgo;
  }
}