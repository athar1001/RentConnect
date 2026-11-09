'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Download, Trash2, Calendar, HardDrive, FileStack, X, ExternalLink } from 'lucide-react';
import { UploadModal } from '@/components/documents/UploadModal';
import { MergeModal } from '@/components/documents/MergeModal';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

export default function DocumentsPage() {
  const t = useTranslations('Documents');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Merge Selection Mode States
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [mergeLoading, setMergeLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/documents', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDownload = (id: string) => {
    window.open(`http://localhost:3000/documents/${id}/download`, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('dialogs.confirmDelete'))) return;
    
    try {
      const res = await fetch(`http://localhost:3000/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(t('toast.deleteSuccess'));
        setDocuments(documents.filter(d => d.id !== id));
      } else {
        toast.error(t('toast.deleteFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    }
  };

  const isPdf = (doc: any) => {
    const mime = doc.mimeType?.toLowerCase() || '';
    const url = doc.fileUrl?.toLowerCase() || '';
    return (
      mime === 'application/pdf' ||
      mime === 'image/png' ||
      mime === 'image/jpeg' ||
      mime === 'image/jpg' ||
      url.endsWith('.pdf') ||
      url.endsWith('.png') ||
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg')
    );
  };

  const pdfDocs = documents.filter(isPdf);
  const hasTwoOrMorePdfs = pdfDocs.length >= 2;

  const handleCardClick = (doc: any) => {
    if (!isSelectionMode) return;
    if (!isPdf(doc)) return;

    if (selectedDocIds.includes(doc.id)) {
      setSelectedDocIds(selectedDocIds.filter(id => id !== doc.id));
    } else {
      setSelectedDocIds([...selectedDocIds, doc.id]);
    }
  };

  const handleMergeSubmit = async (orderedIds: string[], filename: string) => {
    try {
      setMergeLoading(true);
      const res = await fetch('http://localhost:3000/documents/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: orderedIds,
          filename,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Merge Error:', errorText);
        if (res.status === 400) {
          if (errorText.includes('Only PDF')) {
            toast.error(t('merge.errors.onlyPDF'));
          } else {
            toast.error(t('merge.errors.minSelection'));
          }
        } else if (res.status === 500) {
          toast.error(t('merge.errors.corrupted'));
        } else {
          toast.error(t('merge.errors.failed'));
        }
        return;
      }

      // Download the PDF file automatically
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('merge.success'));
      setIsMergeModalOpen(false);
      setIsSelectionMode(false);
      setSelectedDocIds([]);
    } catch (err) {
      toast.error(t('merge.errors.failed'));
    } finally {
      setMergeLoading(false);
    }
  };

  const selectedDocsForModal = selectedDocIds
    .map(id => documents.find(d => d.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-8 pb-24 relative animate-in fade-in duration-300">
      {/* Header Banner (Landlord Portal Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">{t('subtitle')}</p>
          <p className="text-[11px] text-gray-400 mt-1 max-w-xl leading-relaxed">
            {t('schufa.disclaimer')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {documents.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                if (!hasTwoOrMorePdfs) {
                  toast.error(t('emptyStateMerge'));
                  return;
                }
                setIsSelectionMode(!isSelectionMode);
                setSelectedDocIds([]);
              }}
              className={`gap-2 rounded-xl border-gray-200 text-xs font-semibold shadow-sm transition-all ${
                isSelectionMode 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileStack className="w-4 h-4 text-emerald-600" />
              {t('actionMerge')}
            </Button>
          )}

          <a 
            href="https://www.meineschufa.de/produkte/schufa-bonitaetscheck" 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              "gap-2 rounded-xl border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 text-xs font-semibold h-10 px-4"
            )}
          >
            <ExternalLink className="w-4 h-4 text-gray-400" />
            {t('schufa.button')}
          </a>

          <UploadModal onUploadSuccess={fetchDocuments} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="glass-panel border border-dashed border-gray-300/50 rounded-3xl flex flex-col items-center justify-center h-64 text-center p-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('empty.title')}</h3>
          <p className="text-gray-500 max-w-sm mb-6">{t('empty.subtitle')}</p>
          <div className="flex items-center gap-3">
            <a 
              href="https://www.meineschufa.de/produkte/schufa-bonitaetscheck" 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                "gap-2 rounded-xl border-gray-200/80 shadow-sm text-gray-600 hover:bg-gray-50 h-10 px-4"
              )}
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
              {t('schufa.button')}
            </a>
            <UploadModal onUploadSuccess={fetchDocuments} />
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const docIsPdf = isPdf(doc);
            const isSelected = selectedDocIds.includes(doc.id);
            const orderIndex = selectedDocIds.indexOf(doc.id) + 1;

            return (
              <Card 
                key={doc.id} 
                onClick={() => handleCardClick(doc)}
                className={`glass-panel border-0 shadow-sm relative transition-all duration-300 rounded-2xl group select-none ${
                  isSelectionMode && docIsPdf ? 'cursor-pointer hover:ring-2 hover:ring-primary/25' : ''
                } ${
                  isSelectionMode && !docIsPdf ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl'
                } ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50/5' : ''
                }`}
              >
                {/* Selection Order Indicator */}
                {isSelectionMode && docIsPdf && (
                  <div className="absolute top-4 right-4 z-10">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-white">
                        {orderIndex}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white hover:border-blue-500 transition-colors shadow-sm" />
                    )}
                  </div>
                )}

                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="bg-white text-xs">
                      {t(`modal.types.${doc.type}`)}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1" title={doc.title}>{doc.title}</h3>
                  
                  <div className="mt-auto pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-6 pt-4 border-t" onClick={e => isSelectionMode && e.stopPropagation()}>
                    <Button 
                      variant="secondary" 
                      className="flex-1 bg-primary/5 text-primary hover:bg-primary/10" 
                      onClick={() => handleDownload(doc.id)}
                      disabled={isSelectionMode}
                    >
                      <Download className="w-4 h-4 mr-2" /> {t('actionDownload')}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0" 
                      onClick={() => handleDelete(doc.id)}
                      disabled={isSelectionMode}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* SCHUFA placeholder card if not uploaded yet */}
          {!documents.some(doc => doc.type === 'SCHUFA') && (
            <Card 
              className={`glass-panel border border-dashed border-gray-300/60 shadow-sm relative transition-all duration-300 rounded-2xl group flex flex-col justify-between p-5 min-h-[220px] ${
                isSelectionMode ? 'opacity-40 cursor-not-allowed' : 'hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-gray-400/80" />
                </div>
                <Badge variant="outline" className="bg-white text-xs border-gray-200 text-gray-400 font-medium">
                  {t('modal.types.SCHUFA')}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">SCHUFA</h3>
                <p className="text-xs text-amber-500 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse shrink-0"></span>
                  {t('emptyStateSchufa')}
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-dashed border-gray-200">
                <a 
                  href="https://www.meineschufa.de/produkte/schufa-bonitaetscheck" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    "w-full gap-2 rounded-xl text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 hover:text-primary text-xs font-semibold py-2 h-10 justify-center",
                    isSelectionMode ? 'opacity-40 pointer-events-none' : ''
                  )}
                >
                  <ExternalLink className="w-3.5 h-3.5 animate-bounce shrink-0" />
                  {t('schufa.button')}
                </a>
                <p className="text-[9px] text-gray-400 leading-normal text-center mt-1">
                  {t('schufa.disclaimer')}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Sticky Merge Toolbar */}
      {isSelectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200/80 shadow-2xl rounded-2xl px-6 py-4 flex items-center justify-between gap-8 max-w-lg w-[calc(100%-2rem)] animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-gray-800">
              {t('merge.selected', { count: selectedDocIds.length })}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              {selectedDocIds.length < 2 
                ? t('merge.errors.minSelection') 
                : 'Ready to combine'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 px-4 py-2"
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedDocIds([]);
              }}
            >
              {t('actionCancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              type="button"
              className="rounded-xl text-xs font-semibold px-4 py-2 bg-primary hover:bg-primary/95 text-white disabled:opacity-50"
              disabled={selectedDocIds.length < 2}
              onClick={() => setIsMergeModalOpen(true)}
            >
              {t('actionMerge')}
            </Button>
          </div>
        </div>
      )}

      {/* Merge Confirmation & Reordering Modal */}
      <MergeModal
        isOpen={isMergeModalOpen}
        onOpenChange={setIsMergeModalOpen}
        selectedDocs={selectedDocsForModal}
        onMerge={handleMergeSubmit}
        loading={mergeLoading}
      />
    </div>
  );
}
