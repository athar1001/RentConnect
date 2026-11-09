'use client';

import { Link } from '@/i18n/routing';
import { 
  Plus, Search, Edit2, Trash2, ExternalLink, Globe, Eye, Calendar, BookOpen 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  category: string;
  language: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  views: number;
  isFeatured: boolean;
  publishDate: string | null;
  createdAt: string;
}

export default function AdminBlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  
  // Available distinct categories (for filter dropdown)
  const [categories, setCategories] = useState<string[]>([]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url = new URL('http://localhost:3000/blog/control');
      if (search) url.searchParams.append('search', search);
      if (status) url.searchParams.append('status', status);
      if (language) url.searchParams.append('language', language);
      if (category) url.searchParams.append('category', category);

      const res = await fetch(url.toString(), { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [search, status, language, category]);

  // Load distinct categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('http://localhost:3000/blog/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the article: "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/blog/control/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Article deleted successfully');
        setPosts(posts.filter(p => p.id !== id));
      } else {
        toast.error('Failed to delete article');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete article');
    }
  };

  const getStatusBadgeClass = (status: BlogPost['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'DRAFT':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'ARCHIVED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span>Blog CMS</span>
          </h1>
          <p className="text-sm text-slate-500">
            Create, edit, and manage search-optimized blog articles for marketing.
          </p>
        </div>
        
        <Link href="/control/blog/create">
          <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>New Article</span>
          </button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Language Filter */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="de">German</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
            <span className="text-sm text-slate-500">Loading articles...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No articles found</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-4">
              Get started by creating your very first article to post on the marketing site.
            </p>
            <Link href="/control/blog/create">
              <button className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Create Article</span>
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Language</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Views</th>
                  <th className="py-4 px-6">Publish Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="w-14 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative">
                        <img
                          src={post.featuredImage || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=120&q=80'}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-4 px-6">
                      <div className="max-w-xs md:max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 line-clamp-1">{post.title}</span>
                          {post.isFeatured && (
                            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded border border-amber-200/50">
                              Featured
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 block font-semibold">/blog/{post.slug}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                        {post.category}
                      </span>
                    </td>

                    {/* Language */}
                    <td className="py-4 px-6 whitespace-nowrap text-slate-500">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        {post.language === 'de' ? 'German (DE)' : 'English (EN)'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(post.status)}`}>
                        {post.status}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="py-4 px-6 whitespace-nowrap text-slate-600">
                      <span className="inline-flex items-center gap-1 font-semibold text-xs">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {post.views}
                      </span>
                    </td>

                    {/* Publish Date */}
                    <td className="py-4 px-6 whitespace-nowrap text-slate-500">
                      <span className="inline-flex items-center gap-1 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2">
                        {post.status === 'PUBLISHED' && (
                          <Link href={{ pathname: '/blog/[slug]', params: { slug: post.slug } }} target="_blank">
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer" title="View Public Post">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </Link>
                        )}
                        <Link href={{ pathname: '/control/blog/edit/[id]', params: { id: post.id } }}>
                          <button className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer" title="Edit Article">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
