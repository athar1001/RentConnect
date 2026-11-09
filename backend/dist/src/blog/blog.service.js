"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let BlogService = class BlogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllPublished(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 9;
        const skip = (page - 1) * limit;
        const where = {
            status: client_1.BlogPostStatus.PUBLISHED,
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
    async findFeatured(language) {
        const where = {
            status: client_1.BlogPostStatus.PUBLISHED,
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
        if (!featured) {
            const fallbackWhere = {
                status: client_1.BlogPostStatus.PUBLISHED,
                OR: [
                    { publishDate: null },
                    { publishDate: { lte: new Date() } }
                ]
            };
            if (language)
                fallbackWhere.language = language;
            featured = await this.prisma.blogPost.findFirst({
                where: fallbackWhere,
                orderBy: { publishDate: 'desc' },
            });
        }
        return featured;
    }
    async getCategories(language) {
        const where = {
            status: client_1.BlogPostStatus.PUBLISHED,
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
    async findBySlug(slug) {
        const post = await this.prisma.blogPost.findFirst({
            where: {
                slug,
                status: client_1.BlogPostStatus.PUBLISHED,
                OR: [
                    { publishDate: null },
                    { publishDate: { lte: new Date() } }
                ]
            },
        });
        if (!post) {
            throw new common_1.NotFoundException(`Blog article with slug "${slug}" not found`);
        }
        this.prisma.blogPost.update({
            where: { id: post.id },
            data: { views: { increment: 1 } },
        }).catch(err => console.error('Failed to increment blog post views:', err));
        let relatedArticles = [];
        if (post.relatedPostIds) {
            const ids = post.relatedPostIds.split(',').map(id => id.trim()).filter(Boolean);
            if (ids.length > 0) {
                relatedArticles = await this.prisma.blogPost.findMany({
                    where: {
                        id: { in: ids },
                        status: client_1.BlogPostStatus.PUBLISHED,
                    },
                    take: 3,
                });
            }
        }
        if (relatedArticles.length < 3) {
            const fillCount = 3 - relatedArticles.length;
            const excludeIds = [post.id, ...relatedArticles.map(a => a.id)];
            const fillArticles = await this.prisma.blogPost.findMany({
                where: {
                    id: { notIn: excludeIds },
                    status: client_1.BlogPostStatus.PUBLISHED,
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
    async findAllAdmin(query) {
        const where = {};
        if (query.category) {
            where.category = query.category;
        }
        if (query.language) {
            where.language = query.language;
        }
        if (query.status) {
            where.status = query.status;
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
    async findOneAdmin(id) {
        const post = await this.prisma.blogPost.findUnique({
            where: { id },
        });
        if (!post) {
            throw new common_1.NotFoundException(`Blog post with ID "${id}" not found`);
        }
        return post;
    }
    async create(dto) {
        let slug = dto.slug ? this.generateSlug(dto.slug) : this.generateSlug(dto.title);
        slug = await this.ensureUniqueSlug(slug);
        const readingTime = dto.readingTime || this.calculateReadingTime(dto.content);
        const publishDate = dto.status === client_1.BlogPostStatus.PUBLISHED && !dto.publishDate
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
                status: dto.status || client_1.BlogPostStatus.DRAFT,
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
    async update(id, dto) {
        const post = await this.findOneAdmin(id);
        const data = { ...dto };
        if (dto.title && !dto.slug) {
            let newSlug = this.generateSlug(dto.title);
            if (newSlug !== post.slug) {
                data.slug = await this.ensureUniqueSlug(newSlug);
            }
        }
        else if (dto.slug) {
            let newSlug = this.generateSlug(dto.slug);
            if (newSlug !== post.slug) {
                data.slug = await this.ensureUniqueSlug(newSlug);
            }
        }
        if (dto.content && !dto.readingTime) {
            data.readingTime = this.calculateReadingTime(dto.content);
        }
        if (dto.status === client_1.BlogPostStatus.PUBLISHED && !post.publishDate && !dto.publishDate) {
            data.publishDate = new Date();
        }
        return this.prisma.blogPost.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        await this.findOneAdmin(id);
        return this.prisma.blogPost.delete({
            where: { id },
        });
    }
    generateSlug(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/ä/g, 'ae')
            .replace(/ö/g, 'oe')
            .replace(/ü/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    calculateReadingTime(content) {
        if (!content)
            return '1 min read';
        const cleanContent = content.replace(/<[^>]*>/g, '');
        const words = cleanContent.trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return `${minutes} min read`;
    }
    async ensureUniqueSlug(slug, id) {
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
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlogService);
//# sourceMappingURL=blog.service.js.map