'use client';

import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, Save, Globe, Eye, Settings, History, 
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Table, HelpCircle, FileCheck, Ban, ShieldAlert, BookOpen
} from 'lucide-react';
import { format } from 'date-fns';

interface Version {
  id: string;
  versionNumber: number;
  titleEn: string;
  contentEn: string;
  titleDe: string;
  contentDe: string;
  publishedBy: string;
  publishedAt: string;
  changeNote: string | null;
}

interface LegalPage {
  id: string;
  pageType: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  updatedAt: string;
  publishedAt: string | null;
  lastReviewedAt: string | null;
  noIndex: boolean;

  titleEn: string;
  slugEn: string;
  contentEn: string;
  seoTitleEn: string | null;
  seoDescriptionEn: string | null;

  titleDe: string;
  slugDe: string;
  contentDe: string;
  seoTitleDe: string | null;
  seoDescriptionDe: string | null;

  versions: Version[];
}

export default function AdminLegalPageEditor() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [page, setPage] = useState<LegalPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'en' | 'de' | 'publishing'>('general');
  const [editorType, setEditorType] = useState<'markdown' | 'raw'>('markdown');
  
  // Publish modal state
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [changeNote, setChangeNote] = useState('');

  // Form states
  const [form, setForm] = useState({
    status: 'DRAFT',
    noIndex: true,
    titleEn: '',
    slugEn: '',
    contentEn: '',
    seoTitleEn: '',
    seoDescriptionEn: '',
    titleDe: '',
    slugDe: '',
    contentDe: '',
    seoTitleDe: '',
    seoDescriptionDe: '',
  });

  const textareaEnRef = useRef<HTMLTextAreaElement>(null);
  const textareaDeRef = useRef<HTMLTextAreaElement>(null);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/control/legal-pages/${id}`, { credentials: 'include' });
      if (res.ok) {
        const data: LegalPage = await res.json();
        setPage(data);
        setForm({
          status: data.status,
          noIndex: data.noIndex,
          titleEn: data.titleEn || '',
          slugEn: data.slugEn || '',
          contentEn: data.contentEn || '',
          seoTitleEn: data.seoTitleEn || '',
          seoDescriptionEn: data.seoDescriptionEn || '',
          titleDe: data.titleDe || '',
          slugDe: data.slugDe || '',
          contentDe: data.contentDe || '',
          seoTitleDe: data.seoTitleDe || '',
          seoDescriptionDe: data.seoDescriptionDe || '',
        });
      } else {
        toast.error('Failed to fetch legal page details');
      }
    } catch (err) {
      toast.error('Network error fetching page data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPage();
    }
  }, [id]);

  const handleFieldChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const insertFormatting = (before: string, after: string) => {
    const isEn = activeTab === 'en';
    const textarea = isEn ? textareaEnRef.current : textareaDeRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    if (isEn) {
      handleFieldChange('contentEn', newContent);
    } else {
      handleFieldChange('contentDe', newContent);
    }

    // Reset selection focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  const handleSave = async (statusOverride?: 'DRAFT' | 'ARCHIVED') => {
    try {
      setSaving(true);
      const targetStatus = statusOverride || form.status;
      const res = await fetch(`http://localhost:3000/control/legal-pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: targetStatus,
        }),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(statusOverride ? `Status updated to ${statusOverride}` : 'Page content saved successfully as Draft');
        fetchPage();
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to save legal page');
      }
    } catch (err) {
      toast.error('Network error saving page');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:3000/control/legal-pages/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeNote }),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Legal page published and new version snapshot captured!');
        setPublishModalOpen(false);
        setChangeNote('');
        fetchPage();
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to publish legal page');
      }
    } catch (err) {
      toast.error('Network error during publish');
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!window.confirm('Are you sure you want to unpublish this page? It will become inaccessible to the public.')) {
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:3000/control/legal-pages/${id}/unpublish`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Legal page reverted to DRAFT status');
        fetchPage();
      } else {
        toast.error('Failed to unpublish legal page');
      }
    } catch (err) {
      toast.error('Network error unpublishing page');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (versionId: string, versionNumber: number) => {
    if (!window.confirm(`Are you sure you want to restore Version ${versionNumber}? Active editor content will be overwritten (saved as Draft).`)) {
      return;
    }
    
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:3000/control/legal-pages/${id}/restore/${versionId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(`Successfully restored content from Version ${versionNumber}! Status set to Draft.`);
        fetchPage();
        setActiveTab('en');
      } else {
        toast.error('Failed to restore version');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const getPageTypeName = (type: string) => {
    switch (type) {
      case 'PRIVACY_POLICY': return 'Privacy Policy';
      case 'TERMS_OF_SERVICE': return 'Terms of Service';
      case 'COOKIE_POLICY': return 'Cookie Policy';
      case 'IMPRINT': return 'Imprint / Impressum';
      default: return type;
    }
  };

  if (loading && !page) {
    return <div className="text-center py-12 text-gray-500 font-medium">Loading editor details...</div>;
  }

  if (!page) {
    return <div className="text-center py-12 text-red-500 font-medium">Legal page not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <Link href="/control/content/legal-pages" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to CMS List
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-extrabold text-slate-900">{getPageTypeName(page.pageType)}</h1>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              page.status === 'PUBLISHED' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : page.status === 'DRAFT'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-50 text-slate-700 border border-slate-200'
            }`}>
              {page.status}
            </span>
          </div>
        </div>

        {/* Global Toolbar actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditorType(prev => prev === 'markdown' ? 'raw' : 'markdown')}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
          >
            Editor: {editorType === 'markdown' ? 'Markdown' : 'Raw Text'}
          </button>
          
          <Link
            href={{ pathname: '/control/content/legal-pages/[id]/preview/[lang]', params: { id, lang: 'en' } }}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <Eye className="w-4 h-4" /> Preview EN
          </Link>
          <Link
            href={{ pathname: '/control/content/legal-pages/[id]/preview/[lang]', params: { id, lang: 'de' } }}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <Eye className="w-4 h-4" /> Preview DE
          </Link>
          
          <button
            onClick={() => handleSave('DRAFT')}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          
          {page.status === 'PUBLISHED' ? (
            <button
              onClick={handleUnpublish}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Ban className="w-4 h-4" /> Unpublish
            </button>
          ) : (
            <button
              onClick={() => setPublishModalOpen(true)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4" /> Publish Active
            </button>
          )}

          {page.status !== 'ARCHIVED' && (
            <button
              onClick={() => handleSave('ARCHIVED')}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
            >
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Editor Body with Left Sidebar Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'general' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-l-4 border-indigo-600' 
                : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" /> 1. General & SEO
          </button>
          
          <button
            onClick={() => setActiveTab('en')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'en' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-l-4 border-indigo-600' 
                : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" /> 2. English Content
          </button>

          <button
            onClick={() => setActiveTab('de')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'de' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-l-4 border-indigo-600' 
                : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" /> 3. German Content
          </button>

          <button
            onClick={() => setActiveTab('publishing')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
              activeTab === 'publishing' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-l-4 border-indigo-600' 
                : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <History className="w-4 h-4" /> 4. Publishing & History
            </span>
            <span className="bg-slate-200/80 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {page.versions.length}
            </span>
          </button>
        </div>

        {/* Tab Canvas Area */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-6">
              
              {/* TAB 1: General & SEO */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-750 mb-1.5">Page Type (Read-only)</label>
                      <input 
                        type="text"
                        className="w-full text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-xl px-4 py-3 font-semibold"
                        value={page.pageType}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-750 mb-1.5">Status</label>
                      <select 
                        className="w-full text-sm border border-slate-250 rounded-xl px-4 py-3 focus:outline-indigo-600 focus:border-indigo-600 bg-white"
                        value={form.status}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Robot Index Settings</h3>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={form.noIndex}
                        onChange={(e) => handleFieldChange('noIndex', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-800">Add No-Index / No-Follow Robots tags</span>
                        <p className="text-[11px] text-slate-400">Recommended for drafts, testing, or internal-only documents.</p>
                      </div>
                    </label>
                  </div>

                  {/* English SEO Fields */}
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> English SEO Configuration
                    </h3>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SEO Title (EN)</label>
                      <input 
                        type="text"
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5"
                        placeholder="Privacy Policy | WohnBoard"
                        value={form.seoTitleEn}
                        onChange={(e) => handleFieldChange('seoTitleEn', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SEO Description (EN)</label>
                      <textarea 
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 h-20"
                        placeholder="Read our privacy compliance statement..."
                        value={form.seoDescriptionEn}
                        onChange={(e) => handleFieldChange('seoDescriptionEn', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* German SEO Fields */}
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> German SEO Configuration
                    </h3>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SEO Title (DE)</label>
                      <input 
                        type="text"
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5"
                        placeholder="Datenschutzerklärung | WohnBoard"
                        value={form.seoTitleDe}
                        onChange={(e) => handleFieldChange('seoTitleDe', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SEO Description (DE)</label>
                      <textarea 
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 h-20"
                        placeholder="Lesen Sie unsere Datenschutzerklärung..."
                        value={form.seoDescriptionDe}
                        onChange={(e) => handleFieldChange('seoDescriptionDe', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: English Content */}
              {activeTab === 'en' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-750 mb-1.5">Document Title (EN)</label>
                    <input 
                      type="text"
                      className="w-full text-sm border border-slate-250 rounded-xl px-4 py-3 focus:outline-indigo-600 focus:border-indigo-600"
                      placeholder="e.g. Privacy Policy"
                      value={form.titleEn}
                      onChange={(e) => handleFieldChange('titleEn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-750 mb-1.5">Slug (EN)</label>
                    <input 
                      type="text"
                      className="w-full text-sm border border-slate-250 rounded-xl px-4 py-3 bg-slate-50 text-slate-500 font-medium"
                      placeholder="privacy-policy"
                      value={form.slugEn}
                      disabled
                    />
                  </div>

                  {/* WYSIWYG helpers */}
                  {editorType === 'markdown' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-750 mb-1.5">Markdown Format Helpers</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-t-xl p-2 flex flex-wrap gap-1 items-center border-b-0">
                        <button
                          type="button"
                          onClick={() => insertFormatting('**', '**')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Bold"
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('*', '*')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Italic"
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-slate-350 mx-1"></div>
                        <button
                          type="button"
                          onClick={() => insertFormatting('## ', '')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Heading 2"
                        >
                          <Heading2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('### ', '')}
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
                            if (url) insertFormatting('[Link Text]', `(${url})`);
                          }}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Insert Link"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('- ', '')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Bullet List"
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('1. ', '')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Numbered List"
                        >
                          <ListOrdered className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('> ', '')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Blockquote"
                        >
                          <Quote className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('\n---\n', '')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Horizontal Rule"
                        >
                          <span className="text-[10px] font-extrabold uppercase">HR</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <textarea 
                    ref={textareaEnRef}
                    className={`w-full h-96 border border-slate-200 px-4 py-3 text-sm font-mono focus:outline-indigo-600 focus:border-indigo-600 ${editorType === 'markdown' ? 'rounded-b-xl' : 'rounded-xl'}`}
                    value={form.contentEn}
                    onChange={(e) => handleFieldChange('contentEn', e.target.value)}
                    placeholder="Write Markdown policy contents in English..."
                  />
                </div>
              )}

              {/* TAB 3: German Content */}
              {activeTab === 'de' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-750 mb-1.5">Document Title (DE)</label>
                    <input 
                      type="text"
                      className="w-full text-sm border border-slate-250 rounded-xl px-4 py-3 focus:outline-indigo-600 focus:border-indigo-600"
                      placeholder="e.g. Datenschutzerklärung"
                      value={form.titleDe}
                      onChange={(e) => handleFieldChange('titleDe', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-750 mb-1.5">Slug (DE)</label>
                    <input 
                      type="text"
                      className="w-full text-sm border border-slate-250 rounded-xl px-4 py-3 bg-slate-50 text-slate-500 font-medium"
                      placeholder="datenschutzerklaerung"
                      value={form.slugDe}
                      disabled
                    />
                  </div>

                  {/* WYSIWYG helpers */}
                  {editorType === 'markdown' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-750 mb-1.5">Markdown Format Helpers</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-t-xl p-2 flex flex-wrap gap-1 items-center border-b-0">
                        <button
                          type="button"
                          onClick={() => insertFormatting('**', '**')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Bold"
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('*', '*')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Italic"
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-slate-350 mx-1"></div>
                        <button
                          type="button"
                          onClick={() => insertFormatting('## ', '')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Heading 2"
                        >
                          <Heading2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('### ', '')}
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
                            if (url) insertFormatting('[Link Text]', `(${url})`);
                          }}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Insert Link"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('- ', '')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Bullet List"
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('1. ', '')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Numbered List"
                        >
                          <ListOrdered className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('> ', '')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Blockquote"
                        >
                          <Quote className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('\n---\n', '')}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Horizontal Rule"
                        >
                          <span className="text-[10px] font-extrabold uppercase">HR</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <textarea 
                    ref={textareaDeRef}
                    className={`w-full h-96 border border-slate-200 px-4 py-3 text-sm font-mono focus:outline-indigo-600 focus:border-indigo-600 ${editorType === 'markdown' ? 'rounded-b-xl' : 'rounded-xl'}`}
                    value={form.contentDe}
                    onChange={(e) => handleFieldChange('contentDe', e.target.value)}
                    placeholder="Schreiben Sie Richtlinien-Inhalte in Deutsch (Markdown)..."
                  />
                </div>
              )}

              {/* TAB 4: Publishing & History */}
              {activeTab === 'publishing' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500">First Published At</span>
                      <p className="text-sm font-bold text-slate-800">
                        {page.publishedAt 
                          ? format(new Date(page.publishedAt), 'PPP p') 
                          : <span className="text-slate-400 italic">Not published yet</span>
                        }
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500">Last Reviewed At</span>
                      <p className="text-sm font-bold text-slate-800">
                        {page.lastReviewedAt 
                          ? format(new Date(page.lastReviewedAt), 'PPP p') 
                          : <span className="text-slate-400 italic">Never reviewed</span>
                        }
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-850">Published Version History</h3>
                    <p className="text-xs text-slate-450 leading-relaxed">
                      Every time you click <strong>Publish Active</strong>, a new version snapshot is saved. You can inspect previous versions and restore them at any time.
                    </p>

                    <div className="divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/30">
                      {page.versions.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400 font-medium">No published versions exist yet.</div>
                      ) : (
                        page.versions.map((ver) => (
                          <div key={ver.id} className="p-4 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold bg-slate-100 px-2 py-0.5 rounded text-slate-750">
                                  Version {ver.versionNumber}
                                </span>
                                <span className="text-[11px] text-slate-450 font-medium">
                                  {format(new Date(ver.publishedAt), 'MMM d, yyyy HH:mm')} by <strong>{ver.publishedBy}</strong>
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium italic">
                                "{ver.changeNote || 'No change description provided'}"
                              </p>
                            </div>

                            <button
                              onClick={() => handleRestore(ver.id, ver.versionNumber)}
                              className="text-[11px] font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Restore Draft
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Publish Change Note Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Publish Legal Page</h3>
              <p className="text-xs text-slate-400">Describe the changes in this version. This will be stored in the permanent version history.</p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Change Note</label>
              <textarea 
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 h-24 focus:outline-indigo-600"
                placeholder="e.g. Added section regarding GDPR data exports..."
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => { setPublishModalOpen(false); setChangeNote(''); }}
                className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="px-4.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
