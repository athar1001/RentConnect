'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Trash2, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { ApartmentHeader } from '@/components/apartment/ApartmentHeader';
import { ApartmentInfoForm } from '@/components/apartment/ApartmentInfoForm';
import { PersonalNotesWorkspace } from '@/components/apartment/PersonalNotesWorkspace';
import { CommunicationTimeline } from '@/components/apartment/CommunicationTimeline';
import { MissionControlSidebar } from '@/components/apartment/MissionControlSidebar';
import { ChecklistManager } from '@/components/apartment/ChecklistManager';
import { AddReminderModal } from '@/components/reminders/AddReminderModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ApartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('ApartmentDetail');
  
  const [apartment, setApartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImageIdx, setPreviewImageIdx] = useState<number | null>(null);

  const allImages = apartment?.images && apartment.images.length > 0
    ? apartment.images
    : (apartment?.coverImage ? [{ url: apartment.coverImage }] : []);

  const handlePrevImage = () => {
    if (previewImageIdx !== null && previewImageIdx > 0) {
      setPreviewImageIdx(previewImageIdx - 1);
    }
  };

  const handleNextImage = () => {
    if (previewImageIdx !== null && previewImageIdx < allImages.length - 1) {
      setPreviewImageIdx(previewImageIdx + 1);
    }
  };

  const fetchApartment = async () => {
    try {
      const res = await fetch(`http://localhost:3000/apartments/${params.id}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setApartment(data);
      } else {
        toast.error(t('toast.loadFailed'));
        router.push('/app');
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartment();
  }, [params.id, router]);

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`http://localhost:3000/apartments/${params.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(t('toast.deleteSuccess'));
        setIsDeleteModalOpen(false);
        router.push('/app/apartments');
      } else {
        toast.error(t('toast.deleteFailed'));
      }
    } catch (err) {
      toast.error(t('toast.deleteNetworkError'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3134]"></div>
      </div>
    );
  }

  if (!apartment) return null;

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      
      {/* 1. Header Section */}
      <ApartmentHeader apartment={apartment} onDelete={() => setIsDeleteModalOpen(true)} onAddReminder={() => setIsReminderModalOpen(true)} />

      <div className="grid lg:grid-cols-4 gap-6 mt-6">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 2. Image Gallery */}
          {apartment.images && apartment.images.length > 0 ? (
            <Card className="border-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden p-2 rounded-2xl bg-white">
              <div className="flex overflow-x-auto gap-4 pb-2 snap-x rounded-xl no-scrollbar">
                {apartment.images.map((img: any, idx: number) => (
                  <img 
                    key={img.id || idx} 
                    src={img.url} 
                    alt={`${apartment.title} - ${idx + 1}`} 
                    className="h-[350px] w-auto object-cover rounded-xl snap-center shrink-0 border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity" 
                    onClick={() => setPreviewImageIdx(idx)}
                  />
                ))}
              </div>
            </Card>
          ) : apartment.coverImage ? (
            <Card 
              className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setPreviewImageIdx(0)}
            >
              <img src={apartment.coverImage} alt={apartment.title} className="w-full h-[350px] object-cover" />
            </Card>
          ) : null}

          {/* 3. Overview / Editable Metadata */}
          <ApartmentInfoForm apartment={apartment} onUpdate={fetchApartment} />

          {/* 4. Personal Notes Workspace */}
          <PersonalNotesWorkspace apartmentId={apartment.id} initialLogs={apartment.logs || []} onUpdate={fetchApartment} />

          {/* 5 & 7. Layout Split for Timeline and Checklist */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <CommunicationTimeline apartmentId={apartment.id} initialLogs={apartment.logs || []} onUpdate={fetchApartment} />
            </div>
            <div>
              <div className="bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl p-5">
                <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-4 mb-4">{t('checklist.title')}</h3>
                <ChecklistManager apartmentId={apartment.id} initialItems={apartment.checklists || []} />
              </div>
            </div>
          </div>

        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-32">
            <MissionControlSidebar 
              apartment={apartment} 
              onUpdate={fetchApartment} 
              onAddReminder={() => setIsReminderModalOpen(true)}
            />
          </div>
        </div>

      </div>

      {/* Global Modals */}
      <AddReminderModal 
        isOpen={isReminderModalOpen} 
        onOpenChange={setIsReminderModalOpen} 
        onSuccess={fetchApartment}
        apartmentId={apartment.id}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2 font-bold text-lg">
              <Trash2 className="w-5 h-5" />
              {t('dialogs.deleteTitle')}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-gray-500">
              {t('dialogs.deleteDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="rounded-xl border-gray-200 text-gray-700"
            >
              {t('dialogs.actionCancel')}
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('dialogs.actionDelete')}...
                </>
              ) : (
                t('dialogs.actionDelete')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {previewImageIdx !== null && allImages[previewImageIdx] && (
        <Dialog open={previewImageIdx !== null} onOpenChange={(open) => !open && setPreviewImageIdx(null)}>
          <DialogContent 
            className="sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] w-full p-0 bg-transparent border-0 shadow-none ring-0 flex items-center justify-center outline-none select-none"
            showCloseButton={false}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrevImage();
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNextImage();
              }
            }}
          >
            <div className="relative w-full flex items-center justify-center group/preview max-h-[90vh]">
              {/* Image */}
              <img 
                src={allImages[previewImageIdx].url || allImages[previewImageIdx]} 
                alt={`${apartment.title} preview - ${previewImageIdx + 1}`} 
                className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-2xl select-none shadow-2xl border border-white/5"
              />

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImageIdx(null);
                }}
                className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 text-white flex items-center justify-center transition-all shadow-md hover:scale-105"
                aria-label="Close Preview"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation: Prev Button */}
              {previewImageIdx > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-4 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 text-white flex items-center justify-center transition-all shadow-md hover:scale-105"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Navigation: Next Button */}
              {previewImageIdx < allImages.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-4 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 text-white flex items-center justify-center transition-all shadow-md hover:scale-105"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Image Counter Badge */}
              <div className="absolute bottom-4 bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                {previewImageIdx + 1} / {allImages.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
