import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlogPostStatus } from '@prisma/client';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Public Methods ---

  async findAllPublished(query: {
    category?: string;
    search?: string;
    language?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 9;
    const skip = (page - 1) * limit;

    const where: any = {
      status: BlogPostStatus.PUBLISHED,
      OR: [
        { publishDate: null },
        { publishDate: { lte: new Date() } }
      ]
    };

    if (query.category && query.category !== 'All' && query.category !== 'Alle') {
      where.category = query.category;
    }

    if (query.language) {
      where.language = query.language;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { content: { contains: query.search } },
        { tags: { contains: query.search } },
      ];
    }

    const [total, posts] = await Promise.all([
      this.prisma.blogPost.count({ where }),
      this.prisma.blogPost.findMany({
        where,
        orderBy: { publishDate: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFeatured(language?: string) {
    const where: any = {
      status: BlogPostStatus.PUBLISHED,
      isFeatured: true,
      OR: [
        { publishDate: null },
        { publishDate: { lte: new Date() } }
      ]
    };

    if (language) {
      where.language = language;
    }

    let featured = await this.prisma.blogPost.findFirst({
      where,
      orderBy: { publishDate: 'desc' },
    });

    // Fallback: If no post is explicitly marked as featured, return the latest published post
    if (!featured) {
      const fallbackWhere: any = {
        status: BlogPostStatus.PUBLISHED,
        OR: [
          { publishDate: null },
          { publishDate: { lte: new Date() } }
        ]
      };
      if (language) fallbackWhere.language = language;

      featured = await this.prisma.blogPost.findFirst({
        where: fallbackWhere,
        orderBy: { publishDate: 'desc' },
      });
    }

    return featured;
  }

  async getCategories(language?: string) {
    const where: any = {
      status: BlogPostStatus.PUBLISHED,
      OR: [
        { publishDate: null },
        { publishDate: { lte: new Date() } }
      ]
    };

    if (language) {
      where.language = language;
    }

    const posts = await this.prisma.blogPost.findMany({
      where,
      select: { category: true },
      distinct: ['category'],
    });

    return posts.map(p => p.category);
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: {
        slug,
        status: BlogPostStatus.PUBLISHED,
        OR: [
          { publishDate: null },
          { publishDate: { lte: new Date() } }
        ]
      },
    });

    if (!post) {
      throw new NotFoundException(`Blog article with slug "${slug}" not found`);
    }

    // Increment views asynchronously
    this.prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    }).catch(err => console.error('Failed to increment blog post views:', err));

    let relatedArticles: any[] = [];
    if (post.relatedPostIds) {
      const ids = post.relatedPostIds.split(',').map(id => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        relatedArticles = await this.prisma.blogPost.findMany({
          where: {
            id: { in: ids },
            status: BlogPostStatus.PUBLISHED,
          },
          take: 3,
        });
      }
    }

    // If we have less than 3 related articles, fill with other latest articles in the same category/language
    if (relatedArticles.length < 3) {
      const fillCount = 3 - relatedArticles.length;
      const excludeIds = [post.id, ...relatedArticles.map(a => a.id)];
      const fillArticles = await this.prisma.blogPost.findMany({
        where: {
          id: { notIn: excludeIds },
          status: BlogPostStatus.PUBLISHED,
          language: post.language,
          category: post.category,
        },
        orderBy: { publishDate: 'desc' },
        take: fillCount,
      });
      relatedArticles = [...relatedArticles, ...fillArticles];
    }

    return {
      ...post,
      relatedArticles,
    };
  }

  // --- Admin Methods ---

  async findAllAdmin(query: {
    category?: string;
    search?: string;
    language?: string;
    status?: string;
  }) {
    const where: any = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.language) {
      where.language = query.language;
    }

    if (query.status) {
      where.status = query.status as BlogPostStatus;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { excerpt: { contains: query.search } },
      ];
    }

    return this.prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneAdmin(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Blog post with ID "${id}" not found`);
    }

    return post;
  }

  async create(dto: CreateBlogPostDto) {
    let slug = dto.slug ? this.generateSlug(dto.slug) : this.generateSlug(dto.title);
    
    // Ensure unique slug
    slug = await this.ensureUniqueSlug(slug);

    const readingTime = dto.readingTime || this.calculateReadingTime(dto.content);
    const publishDate = dto.status === BlogPostStatus.PUBLISHED && !dto.publishDate 
      ? new Date() 
      : dto.publishDate;

    return this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        featuredImage: dto.featuredImage || null,
        content: dto.content,
        category: dto.category,
        tags: dto.tags || null,
        language: dto.language || 'en',
        status: dto.status || BlogPostStatus.DRAFT,
        isFeatured: dto.isFeatured || false,
        publishDate,
        readingTime,
        relatedPostIds: dto.relatedPostIds || null,
        seoTitle: dto.seoTitle || null,
        seoDescription: dto.seoDescription || null,
        seoKeywords: dto.seoKeywords || null,
        canonicalUrl: dto.canonicalUrl || null,
        ogImage: dto.ogImage || null,
        twitterImage: dto.twitterImage || null,
      },
    });
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const post = await this.findOneAdmin(id);

    const data: any = { ...dto };

    if (dto.title && !dto.slug) {
      // Regenerate slug if title changed and slug wasn't explicitly updated
      let newSlug = this.generateSlug(dto.title);
      if (newSlug !== post.slug) {
        data.slug = await this.ensureUniqueSlug(newSlug);
      }
    } else if (dto.slug) {
      let newSlug = this.generateSlug(dto.slug);
      if (newSlug !== post.slug) {
        data.slug = await this.ensureUniqueSlug(newSlug);
      }
    }

    if (dto.content && !dto.readingTime) {
      data.readingTime = this.calculateReadingTime(dto.content);
    }

    if (dto.status === BlogPostStatus.PUBLISHED && !post.publishDate && !dto.publishDate) {
      data.publishDate = new Date();
    }

    return this.prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOneAdmin(id);
    return this.prisma.blogPost.delete({
      where: { id },
    });
  }

  // --- Helper Methods ---

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      // Replace German umlauts
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private calculateReadingTime(content: string): string {
    if (!content) return '1 min read';
    // Strip HTML tags
    const cleanContent = content.replace(/<[^>]*>/g, '');
    const words = cleanContent.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  }

  private async ensureUniqueSlug(slug: string, id?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;
    
    while (true) {
      const existing = await this.prisma.blogPost.findFirst({
        where: {
          slug: uniqueSlug,
          id: id ? { not: id } : undefined,
        },
      });

      if (!existing) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }
}
