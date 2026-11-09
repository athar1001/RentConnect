'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, Calendar, Clock, ArrowRight, BookOpen, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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
}

export default function BlogListPage() {
  const t = useTranslations('Blog');
  const locale = useLocale();
  const params = useParams();
  const categoryParam = params?.category ? decodeURIComponent(params.category as string) : null;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Sync category param
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, [categoryParam]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch categories & featured article on load
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const catRes = await fetch(`http://localhost:3000/blog/categories?language=${locale}`);
        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats);
        }

        const featRes = await fetch(`http://localhost:3000/blog/featured?language=${locale}`);
        if (featRes.ok) {
          const text = await featRes.text();
          if (text) {
            const feat = JSON.parse(text);
            if (feat && feat.id) {
              setFeaturedPost(feat);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load initial blog data', err);
      }
    };
    fetchInitial();
  }, [locale]);

  // Fetch articles on search, category or locale change
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const url = new URL('http://localhost:3000/blog');
        url.searchParams.append('language', locale);
        if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'Alle') {
          url.searchParams.append('category', selectedCategory);
        }
        if (debouncedSearch) {
          url.searchParams.append('search', debouncedSearch);
        }
        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error('Failed to load articles', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [locale, selectedCategory, debouncedSearch]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getLocalizedCategoryName = (cat: string) => {
    try {
      return t(`categoriesList.${cat}`);
    } catch (_) {
      return cat;
    }
  };

  // Pre-defined fallback categories just in case
  const defaultCategories = [
    'All',
    'Apartment Search',
    'Application Documents',
    'Living in Germany',
    'Apartment Tips',
    'City Guides',
    'Rental Market',
    'WohnBoard Updates'
  ];

  const allCategories = categories.length > 0 
    ? ['All', ...categories] 
    : defaultCategories;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Navbar />
      
      <main className="flex-1 pb-24">
        {/* Blog Hero Header */}
        <section className="bg-white border-b border-slate-100 py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-7xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-4">
              <BookOpen className="w-4 h-4" />
              <span>{t('resources')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-4">
              {t('subtitle')}
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
              {locale === 'de' 
                ? 'Erfahre, wie du deine Wohnungssuche optimierst, Unterlagen perfekt vorbereitest und schneller Zusagen erhältst.'
                : 'Learn how to optimize your apartment search, prepare your documents perfectly, and get approved faster.'
              }
            </p>
            
            {/* Search Input */}
            <div className="max-w-lg mx-auto relative shadow-sm rounded-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
              />
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="container mx-auto px-4 max-w-7xl py-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
            {allCategories.map((cat) => {
              const isActive = selectedCategory === cat || (cat === 'All' && selectedCategory === 'Alle');
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200/60 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {getLocalizedCategoryName(cat)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Featured Article Section */}
        {featuredPost && !searchQuery && selectedCategory === 'All' && (
          <section className="container mx-auto px-4 max-w-7xl mb-16">
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[450px] overflow-hidden group">
                <img
                  src={featuredPost.featuredImage || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'}
                  alt={featuredPost.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/10"></div>
              </div>
              
              <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                    {getLocalizedCategoryName(featuredPost.category)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredPost.readingTime || '5 min read'}
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 leading-tight mb-4 hover:text-indigo-600 transition-colors">
                  <Link href={{ pathname: '/blog/[slug]', params: { slug: featuredPost.slug } }}>
                    {featuredPost.title}
                  </Link>
                </h2>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                      WB
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">WohnBoard Staff</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{formatDate(featuredPost.publishDate)}</p>
                    </div>
                  </div>
                  
                  <Link href={{ pathname: '/blog/[slug]', params: { slug: featuredPost.slug } }} className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors group">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Latest Articles */}
        <section className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-2">
            <span>{t('latest')}</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-96 border border-slate-100 animate-pulse"></div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 max-w-xl mx-auto shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('noArticles')}</h3>
              <p className="text-sm text-slate-500">
                {locale === 'de' 
                  ? 'Wir arbeiten an neuen Ratgebern für diese Kategorie. Schau bald wieder vorbei!' 
                  : 'We are working on new guides for this category. Check back soon!'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article 
                  key={post.id} 
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  <Link href={{ pathname: '/blog/[slug]', params: { slug: post.slug } }} className="block relative aspect-video overflow-hidden">
                    <img
                      src={post.featuredImage || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </Link>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                        {getLocalizedCategoryName(post.category)}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                        <Clock className="w-3 h-3" />
                        {post.readingTime || '5 min read'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                      <Link href={{ pathname: '/blog/[slug]', params: { slug: post.slug } }}>
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6.5 h-6.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                          WB
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-900">WohnBoard Staff</p>
                          <p className="text-[9px] text-slate-400 font-semibold">{formatDate(post.publishDate)}</p>
                        </div>
                      </div>
                      
                      <Link href={{ pathname: '/blog/[slug]', params: { slug: post.slug } }} className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors group/link">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
