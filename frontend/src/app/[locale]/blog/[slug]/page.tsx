'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Calendar, Clock, ArrowLeft, Link2, Eye, User, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  content: string;
  category: string;
  tags: string | null;
  language: string;
  status: string;
  views: number;
  isFeatured: boolean;
  publishDate: string | null;
  readingTime: string | null;
  createdAt: string;
  relatedArticles?: BlogPost[];
}

export default function BlogDetailPage() {
  const t = useTranslations('Blog');
  const locale = useLocale();
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/blog/slug/${slug}`);
        if (res.ok) {
          const data = await res.json();
          // Filter related posts to match current locale
          if (data.relatedArticles) {
            data.relatedArticles = data.relatedArticles.filter((a: BlogPost) => a.language === locale);
          }
          setPost(data);
        } else {
          toast.error(locale === 'de' ? 'Artikel nicht gefunden' : 'Article not found');
          router.push('/blog');
        }
      } catch (err) {
        console.error('Failed to load blog post', err);
        router.push('/blog');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, locale, router]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success(locale === 'de' ? 'Link kopiert!' : 'Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getLocalizedCategoryName = (cat: string) => {
    try {
      return t(`categoriesList.${cat}`);
    } catch (_) {
      return cat;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* Back Button Header */}
        <div className="container mx-auto px-4 max-w-4xl pt-8 pb-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>{t('back')}</span>
          </Link>
        </div>

        {/* Article Core Layout */}
        <article className="container mx-auto px-4 max-w-4xl bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-16">
          {/* Cover Image */}
          <div className="aspect-[21/9] w-full relative overflow-hidden bg-slate-100">
            <img
              src={post.featuredImage || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="p-6 md:p-12">
            {/* Metadata Header */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 mb-6">
              <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider">
                {getLocalizedCategoryName(post.category)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.publishDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime || '5 min read'}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.views} {locale === 'de' ? 'Aufrufe' : 'views'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight mb-6">
              {post.title}
            </h1>

            {/* Excerpt/Intro */}
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed border-l-4 border-indigo-500 pl-4 py-1 mb-8">
              {post.excerpt}
            </p>

            {/* Author card & Sharing */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-6 border-y border-slate-100 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                  WB
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">WohnBoard Staff</p>
                  <p className="text-xs text-slate-400 font-semibold">{t('by')} WohnBoard Team</p>
                </div>
              </div>

              {/* Social sharing */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" /> Share:
                </span>
                
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-500 hover:text-sky-500 border border-slate-100 hover:border-sky-100 transition-colors"
                  title="Share on X"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-100 hover:border-blue-100 transition-colors"
                  title="Share on Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 transition-colors"
                  title="Share on LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 border border-slate-100 hover:border-emerald-100 transition-colors cursor-pointer"
                  title="Copy Link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Article Content Render */}
            <div 
              className="blog-content prose prose-indigo max-w-none text-slate-700 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Related Articles Section */}
        {post.relatedArticles && post.relatedArticles.length > 0 && (
          <section className="container mx-auto px-4 max-w-4xl">
            <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <span>{t('related')}</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {post.relatedArticles.map((relPost) => (
                <article 
                  key={relPost.id} 
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  <Link href={{ pathname: '/blog/[slug]', params: { slug: relPost.slug } }} className="block relative aspect-video overflow-hidden">
                    <img
                      src={relPost.featuredImage || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80'}
                      alt={relPost.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </Link>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase mb-1.5 block">
                      {getLocalizedCategoryName(relPost.category)}
                    </span>
                    
                    <h4 className="text-sm font-bold text-slate-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      <Link href={{ pathname: '/blog/[slug]', params: { slug: relPost.slug } }}>
                        {relPost.title}
                      </Link>
                    </h4>
                    
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-semibold mt-auto pt-3 border-t border-slate-50">
                      <Clock className="w-3 h-3" />
                      {relPost.readingTime || '5 min read'}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      
      {/* Dynamic styling inject to handle standard wysiwyg output elements */}
      <style jsx global>{`
        .blog-content h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .blog-content p {
          margin-bottom: 1.25rem;
          font-size: 1rem;
          color: #334155;
          line-height: 1.75;
        }
        .blog-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .blog-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        .blog-content blockquote {
          border-left: 4px solid #6366f1;
          background-color: #f8fafc;
          padding: 1rem 1.5rem;
          margin-bottom: 1.25rem;
          font-style: italic;
          color: #475569;
          border-radius: 0 0.75rem 0.75rem 0;
        }
        .blog-content a {
          color: #4f46e5;
          text-decoration: underline;
          font-weight: 600;
        }
        .blog-content img {
          border-radius: 1rem;
          margin: 1.5rem auto;
          max-height: 400px;
          object-fit: cover;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
        }
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.25rem;
        }
        .blog-content th, .blog-content td {
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          text-align: left;
        }
        .blog-content th {
          background-color: #f8fafc;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
