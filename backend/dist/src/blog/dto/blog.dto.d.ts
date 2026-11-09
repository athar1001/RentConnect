import { BlogPostStatus } from '@prisma/client';
export declare class CreateBlogPostDto {
    title: string;
    slug?: string;
    excerpt: string;
    featuredImage?: string;
    content: string;
    category: string;
    tags?: string;
    language?: string;
    status?: BlogPostStatus;
    isFeatured?: boolean;
    publishDate?: Date;
    readingTime?: string;
    relatedPostIds?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    twitterImage?: string;
}
export declare class UpdateBlogPostDto {
    title?: string;
    slug?: string;
    excerpt?: string;
    featuredImage?: string;
    content?: string;
    category?: string;
    tags?: string;
    language?: string;
    status?: BlogPostStatus;
    isFeatured?: boolean;
    publishDate?: Date;
    readingTime?: string;
    relatedPostIds?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    twitterImage?: string;
}
