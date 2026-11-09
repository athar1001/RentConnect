'use client';

import { useRouter, Link } from '@/i18n/routing';
import { 
  Save, ArrowLeft, Image as ImageIcon, Globe, FileText, Settings, Share2, Upload, AlertCircle, Link as LinkIcon, Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Table 
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  content: string;
  category: string;
  tags: string | null;
  language: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  views?: number;
  isFeatured: boolean;
  publishDate: string | null;
  readingTime: string | null;
  relatedPostIds: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  twitterImage: string | null;
}

interface BlogFormProps {
  initialData?: BlogPost;
  isEdit?: boolean;
}

export default function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  // Tabs: 'general' | 'classification' | 'seo' | 'publishing'
  const [activeTab, setActiveTab] = useState<'general' | 'classification' | 'seo' | 'publishing'>('general');

  // Form State
  const [formData, setFormData] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    featuredImage: '',
    content: '',
    category: 'Apartment Search',
    tags: '',
    language: 'de',
    status: 'DRAFT',
    isFeatured: false,
    publishDate: '',
    readingTime: '',
    relatedPostIds: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    canonicalUrl: '',
    ogImage: '',
    twitterImage: '',
  });

  // All posts in system (for related articles picker)
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Parse publishDate properly for datetime-local input
      let formattedDate = '';
      if (initialData.publishDate) {
        const date = new Date(initialData.publishDate);
        formattedDate = date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
      }

      setFormData({
        ...initialData,
        publishDate: formattedDate,
        tags: initialData.tags || '',
        relatedPostIds: initialData.relatedPostIds || '',
        seoTitle: initialData.seoTitle || '',
        seoDescription: initialData.seoDescription || '',
        seoKeywords: initialData.seoKeywords || '',
        canonicalUrl: initialData.canonicalUrl || '',
        ogImage: initialData.ogImage || '',
        twitterImage: initialData.twitterImage || '',
      });
    }
  }, [initialData]);

  // Fetch all posts to list in "Related Articles"
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const res = await fetch('http://localhost:3000/blog/control', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          // Exclude current editing post
          const filtered = data.filter((p: BlogPost) => p.id !== initialData?.id);
          setAllPosts(filtered);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllPosts();
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // --- Rich Text Editor Helper formatting ---
  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = before + selectedText + after;

    setFormData(prev => ({
      ...prev,
      content: text.substring(0, start) + replacement + text.substring(end)
    }));

    // Focus back & select replacement
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 50);
  };

  // --- Featured Image Upload ---
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFeatured(true);
    const body = new FormData();
    body.append('image', file);

    try {
      const res = await fetch('http://localhost:3000/blog/control/upload', {
        method: 'POST',
        body,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          featuredImage: data.url,
          // Set as OG Image as well if not already set
          ogImage: prev.ogImage || data.url,
          twitterImage: prev.twitterImage || data.url
        }));
        toast.success('Cover image uploaded successfully');
      } else {
        toast.error('Failed to upload cover image');
      }
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed');
    } finally {
      setUploadingFeatured(false);
    }
  };

  // --- Inline Editor Image Upload ---
  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingInline(true);
    const body = new FormData();
    body.append('image', file);

    try {
      const res = await fetch('http://localhost:3000/blog/control/upload', {
        method: 'POST',
        body,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        insertFormatting(`<img src="${data.url}" alt="${file.name.split('.')[0]}" />\n`);
        toast.success('Image inserted');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed');
    } finally {
      setUploadingInline(false);
    }
  };

  const handleRelatedPostToggle = (postId: string) => {
    const currentIds = formData.relatedPostIds 
      ? formData.relatedPostIds.split(',').map(id => id.trim()).filter(Boolean)
      : [];
    
    let newIds = [];
    if (currentIds.includes(postId)) {
      newIds = currentIds.filter(id => id !== postId);
    } else {
      newIds = [...currentIds, postId];
    }

    setFormData(prev => ({
      ...prev,
      relatedPostIds: newIds.join(',')
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast.error('Please fill in all general required fields (Title, Excerpt, Content)');
      setActiveTab('general');
      return;
    }

    setSaving(true);
    try {
      // Map empty inputs to null for database compatibility
      const submissionData = {
        ...formData,
        publishDate: formData.publishDate ? new Date(formData.publishDate) : null,
        tags: formData.tags || null,
        readingTime: formData.readingTime || null,
        relatedPostIds: formData.relatedPostIds || null,
        seoTitle: formData.seoTitle || null,
        seoDescription: formData.seoDescription || null,
        seoKeywords: formData.seoKeywords || null,
        canonicalUrl: formData.canonicalUrl || null,
        ogImage: formData.ogImage || null,
        twitterImage: formData.twitterImage || null,
        featuredImage: formData.featuredImage || null,
      };

      const url = isEdit 
        ? `http://localhost:3000/blog/control/${initialData?.id}` 
        : 'http://localhost:3000/blog/control';

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(isEdit ? 'Article updated successfully!' : 'Article created successfully!');
        router.push('/control/blog');
        router.refresh();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to save article');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = [
    'Apartment Search',
    'Application Documents',
    'Living in Germany',
    'Apartment Tips',
    'City Guides',
    'Rental Market',
    'WohnBoard Updates'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <Link href="/control/blog" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to List
          </Link>
          <h1 className="text-xl font-extrabold text-slate-900">
            {isEdit ? 'Edit Blog Article' : 'Create New Article'}
          </h1>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Article'}</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'general'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> General Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('classification')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'classification'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" /> Classification
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'seo'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Share2 className="w-4 h-4" /> SEO & Social
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('publishing')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'publishing'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" /> Publishing
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white p-6 rounded-2xl border border-slate-250/70 shadow-sm min-h-[400px]">
        {/* TAB 1: GENERAL CONTENT */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. How to Find an Apartment in Germany"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Custom Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="e.g. how-to-find-an-apartment-in-germany (auto-generated if empty)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Short Excerpt <span className="text-red-500">*</span>
              </label>
              <textarea
                name="excerpt"
                required
                rows={3}
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="A compelling, short summary of the article. Displays on the cards and list views."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Featured Cover Image
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <input
                  type="text"
                  name="featuredImage"
                  value={formData.featuredImage || ''}
                  onChange={handleChange}
                  placeholder="Image URL or upload a file"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                  className="hidden"
                />
                
                <button
                  type="button"
                  disabled={uploadingFeatured}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-semibold border border-indigo-150 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingFeatured ? 'Uploading...' : 'Upload Image'}</span>
                </button>
              </div>
              {formData.featuredImage && (
                <div className="w-40 aspect-video rounded-lg overflow-hidden border border-slate-200 mt-2 relative">
                  <img src={formData.featuredImage} alt="Featured cover thumbnail" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Content & Rich Text Editor */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Article Body Content <span className="text-red-500">*</span>
              </label>
              
              {/* WYSIWYG helper buttons */}
              <div className="bg-slate-50 border border-slate-200 rounded-t-xl p-2 flex flex-wrap gap-1 items-center border-b-0">
                <button
                  type="button"
                  onClick={() => insertFormatting('<strong>', '</strong>')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<em>', '</em>')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-350 mx-1"></div>
                <button
                  type="button"
                  onClick={() => insertFormatting('<h2>', '</h2>')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<h3>', '</h3>')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-350 mx-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    const url = window.prompt('Enter link URL:');
                    if (url) insertFormatting(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>');
                  }}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                  title="Insert Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<ol>\n  <li>', '</li>\n</ol>')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<blockquote>', '</blockquote>')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                  title="Blockquote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-350 mx-1"></div>
                <button
                  type="button"
                  onClick={() => insertFormatting('<table>\n  <thead>\n    <tr>\n      <th>Header 1</th>\n      <th>Header 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Data 1</td>\n      <td>Data 2</td>\n    </tr>\n  </tbody>\n</table>\n')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                  title="Insert Table"
                >
                  <Table className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = window.prompt('Enter YouTube Video ID (e.g. dQw4w9WgXcQ):');
                    if (id) insertFormatting(`<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n`);
                  }}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                  title="Insert YouTube Video"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </button>
                
                <input
                  type="file"
                  ref={inlineFileInputRef}
                  accept="image/*"
                  onChange={handleInlineImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingInline}
                  onClick={() => inlineFileInputRef.current?.click()}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Upload & Insert Inline Image"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-[10px]">{uploadingInline ? '...' : 'Insert Img'}</span>
                </button>
              </div>

              <textarea
                name="content"
                ref={textareaRef}
                required
                rows={16}
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your article body content here (Supports HTML formatting)"
                className="w-full px-4 py-3 border border-slate-200 rounded-b-xl text-slate-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 2: CLASSIFICATION */}
        {activeTab === 'classification' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="en">English (EN)</option>
                  <option value="de">German (DE)</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags || ''}
                onChange={handleChange}
                placeholder="e.g. apartment search, germany, schufa, rental contract"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Featured Article switch */}
            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isFeatured" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Mark as Featured Article (Highlight at the top of the blog page)
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: SEO & SOCIAL */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex gap-3 text-slate-600">
              <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800">Why fill in SEO parameters?</p>
                <p>Providing optimized metadata helps Google, Bing, and other crawlers index your guides correctly, and ensures beautiful previews when shared on LinkedIn, X/Twitter, and Facebook.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SEO Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  SEO Title
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle || ''}
                  onChange={handleChange}
                  placeholder="e.g. Finding Apartments in Germany: 10 Steps"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* SEO Keywords */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  name="seoKeywords"
                  value={formData.seoKeywords || ''}
                  onChange={handleChange}
                  placeholder="e.g. apartment, renting, germany, guide, tracker"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* SEO Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                SEO Meta Description (Under 160 characters)
              </label>
              <textarea
                name="seoDescription"
                rows={3}
                value={formData.seoDescription || ''}
                onChange={handleChange}
                placeholder="A description that matches user intent and includes key terms for high CTR on search results."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Canonical URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Canonical URL
              </label>
              <input
                type="text"
                name="canonicalUrl"
                value={formData.canonicalUrl || ''}
                onChange={handleChange}
                placeholder="e.g. https://wohnboard.de/blog/apartment-guide"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* OG Image */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Open Graph Image (Facebook/LinkedIn preview)
                </label>
                <input
                  type="text"
                  name="ogImage"
                  value={formData.ogImage || ''}
                  onChange={handleChange}
                  placeholder="URL of social share image"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Twitter Image */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Twitter Preview Image
                </label>
                <input
                  type="text"
                  name="twitterImage"
                  value={formData.twitterImage || ''}
                  onChange={handleChange}
                  placeholder="URL of X/Twitter share image"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PUBLISHING */}
        {activeTab === 'publishing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              {/* Publish Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Publish / Scheduled Date
                </label>
                <input
                  type="datetime-local"
                  name="publishDate"
                  value={formData.publishDate || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Reading Time */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Reading Time (Manual override)
              </label>
              <input
                type="text"
                name="readingTime"
                value={formData.readingTime || ''}
                onChange={handleChange}
                placeholder="e.g. 8 min read (leave blank to auto-calculate)"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Related Articles picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Related Articles
              </label>
              
              {allPosts.length === 0 ? (
                <p className="text-xs text-slate-400">No other articles available to link as related posts.</p>
              ) : (
                <div className="border border-slate-200 rounded-xl max-h-56 overflow-y-auto p-4 divide-y divide-slate-100 space-y-2 bg-slate-50/50">
                  {allPosts.map((p) => {
                    const isChecked = formData.relatedPostIds
                      ? formData.relatedPostIds.split(',').map(id => id.trim()).includes(p.id!)
                      : false;
                    return (
                      <div key={p.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                        <input
                          type="checkbox"
                          id={`related-${p.id}`}
                          checked={isChecked}
                          onChange={() => handleRelatedPostToggle(p.id!)}
                          className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor={`related-${p.id}`} className="text-xs font-semibold text-slate-700 cursor-pointer flex-1">
                          {p.title} <span className="text-[10px] text-slate-400">({p.language === 'de' ? 'German' : 'English'})</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
