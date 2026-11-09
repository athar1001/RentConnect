'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  FileText, Eye, ArrowRight, ShieldCheck, ShieldAlert, 
  History, Globe, Ban, UploadCloud, CheckCircle, XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from '@/i18n/routing';

interface Version {
  id: string;
  versionNumber: number;
  titleEn: string;
  titleDe: string;
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
  titleEn: string;
  titleDe: string;
}

export default function AdminLegalPagesPage() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedPageForPublish, setSelectedPageForPublish] = useState<LegalPage | null>(null);
  const [changeNote, setChangeNote] = useState('');
  
  const [selectedPageForHistory, setSelectedPageForHistory] = useState<LegalPage | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/control/legal-pages', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      } else {
        toast.error('Failed to fetch legal pages');
      }
    } catch (err) {
      toast.error('Network error fetching legal pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const getPageTypeName = (type: string) => {
    switch (type) {
      case 'PRIVACY_POLICY': return 'Privacy Policy';
      case 'TERMS_OF_SERVICE': return 'Terms of Service';
      case 'COOKIE_POLICY': return 'Cookie Policy';
      case 'IMPRINT': return 'Imprint / Impressum';
      default: return type;
    }
  };

  const handleUnpublish = async (id: string) => {
    if (!window.confirm('Are you sure you want to unpublish this page? It will revert to draft status and become inaccessible to the public.')) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/control/legal-pages/${id}/unpublish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success('Legal page unpublished successfully');
        fetchPages();
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to unpublish page');
      }
    } catch (err) {
      toast.error('Network error during unpublishing');
    }
  };

  const handlePublishSubmit = async () => {
    if (!selectedPageForPublish) return;
    try {
      const res = await fetch(`http://localhost:3000/control/legal-pages/${selectedPageForPublish.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeNote }),
        credentials: 'include',
      });
      if (res.ok) {
        toast.success('Legal page published successfully!');
        setSelectedPageForPublish(null);
        setChangeNote('');
        fetchPages();
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to publish legal page');
      }
    } catch (err) {
      toast.error('Network error during publishing');
    }
  };

  const openHistory = async (page: LegalPage) => {
    setSelectedPageForHistory(page);
    setLoadingVersions(true);
    try {
      const res = await fetch(`http://localhost:3000/control/legal-pages/${page.id}/versions`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      } else {
        toast.error('Failed to fetch version logs');
      }
    } catch (err) {
      toast.error('Network error fetching versions');
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleRestore = async (versionId: string, versionNumber: number) => {
    if (!selectedPageForHistory) return;
    if (!window.confirm(`Are you sure you want to restore Version ${versionNumber}? The active editor version will revert to this snapshot and status will become DRAFT.`)) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/control/legal-pages/${selectedPageForHistory.id}/restore/${versionId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(`Successfully restored Version ${versionNumber} to Draft!`);
        setSelectedPageForHistory(null);
        fetchPages();
      } else {
        toast.error('Failed to restore version snapshot');
      }
    } catch (err) {
      toast.error('Network error restoring version');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Legal Pages CMS</h1>
        <p className="text-gray-500 text-sm">Manage legal, privacy, imprint, and compliance policies in English and German.</p>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-150">
                <tr>
                  <th className="px-6 py-4">Page</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4">Published At</th>
                  <th className="px-6 py-4">Languages</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">Loading pages...</td>
                  </tr>
                ) : pages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">No pages initialized. The system auto-seeds default pages on start.</td>
                  </tr>
                ) : (
                  pages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>{getPageTypeName(page.pageType)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          page.status === 'PUBLISHED' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : page.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}>
                          {page.status === 'PUBLISHED' ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <ShieldAlert className="w-3 h-3" />
                          )}
                          {page.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-medium">
                        {format(new Date(page.updatedAt), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-medium">
                        {page.publishedAt 
                          ? format(new Date(page.publishedAt), 'MMM d, yyyy HH:mm') 
                          : <span className="text-slate-300 italic text-xs">Unpublished</span>
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${page.titleEn ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                            EN
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${page.titleDe ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                            DE
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <Link 
                            href={{ pathname: '/control/content/legal-pages/[id]/edit', params: { id: page.id } }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50/20 transition-all"
                          >
                            Edit
                          </Link>
                          
                          <Link
                            href={{ pathname: '/control/content/legal-pages/[id]/preview/[lang]', params: { id: page.id, lang: 'en' } }}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 px-2 py-1 hover:underline shrink-0"
                            title="Preview EN"
                          >
                            Prev EN
                          </Link>
                          <Link
                            href={{ pathname: '/control/content/legal-pages/[id]/preview/[lang]', params: { id: page.id, lang: 'de' } }}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 px-2 py-1 hover:underline shrink-0"
                            title="Preview DE"
                          >
                            Prev DE
                          </Link>

                          {page.status === 'PUBLISHED' ? (
                            <button
                              onClick={() => handleUnpublish(page.id)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-800 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" /> Unpublish
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedPageForPublish(page)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 cursor-pointer"
                            >
                              <UploadCloud className="w-3.5 h-3.5" /> Publish
                            </button>
                          )}

                          <button
                            onClick={() => openHistory(page)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" /> History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Publish Change Note Modal */}
      {selectedPageForPublish && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                Publish {getPageTypeName(selectedPageForPublish.pageType)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Describe the changes in this version. Snapshot will be captured in version history.</p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Change Note</label>
              <textarea 
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 h-24 focus:outline-indigo-600"
                placeholder="e.g. Initial draft, spelling corrections, or GDPR clause updates..."
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => { setSelectedPageForPublish(null); setChangeNote(''); }}
                className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishSubmit}
                className="px-4.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Slide-Over / Modal */}
      {selectedPageForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  Version History
                </h3>
                <p className="text-xs text-slate-450 mt-0.5">{getPageTypeName(selectedPageForHistory.pageType)}</p>
              </div>
              <button
                onClick={() => setSelectedPageForHistory(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {loadingVersions ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading snapshot logs...</div>
              ) : versions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No published versions exist yet. Click Publish to create a snapshot.</div>
              ) : (
                versions.map((ver) => (
                  <div key={ver.id} className="p-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-extrabold bg-slate-100 px-2 py-0.5 rounded text-slate-750">
                          Version {ver.versionNumber}
                        </span>
                        <span className="text-[11px] text-slate-450">
                          {format(new Date(ver.publishedAt), 'MMM d, yyyy HH:mm')} by <strong>{ver.publishedBy}</strong>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium italic">
                        "{ver.changeNote || 'No change description provided'}"
                      </p>
                    </div>

                    <button
                      onClick={() => handleRestore(ver.id, ver.versionNumber)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                    >
                      Restore Draft
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedPageForHistory(null)}
                className="px-4.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
