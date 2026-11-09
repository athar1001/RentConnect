import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Bell, CheckSquare, Clock, Plus, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { UploadModal } from '@/components/documents/UploadModal';
import { useTranslations } from 'next-intl';

const STATUSES = [
  'SAVED', 'CONTACTED', 'APPLIED', 'VIEWING_SCHEDULED', 'WAITING_RESPONSE', 'REJECTED', 'ACCEPTED'
];

export function MissionControlSidebar({ apartment, onUpdate, onAddReminder }: { apartment: any, onUpdate: () => void, onAddReminder: () => void }) {
  const t = useTranslations('ApartmentDetail');
  const tStatus = useTranslations('Status');

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3000/apartments/${apartment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(t('toast.statusUpdateSuccess'));
        onUpdate();
      } else {
        toast.error(t('toast.statusUpdateFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    }
  };

  // Calculate checklist progress
  const totalChecklists = apartment.checklists?.length || 0;
  const completedChecklists = apartment.checklists?.filter((c: any) => c.completed).length || 0;
  const progressPercent = totalChecklists === 0 ? 0 : Math.round((completedChecklists / totalChecklists) * 100);

  // Calculate if status is VIEWING_SCHEDULED
  const isViewing = apartment.status === 'VIEWING_SCHEDULED';

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card className="border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white">
        <div className="bg-[#2d3134] px-5 py-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-gray-300" /> {t('sidebar.stageTitle')}
          </h3>
        </div>
        <CardContent className="p-5">
          <Select value={apartment.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full h-12 bg-gray-50 border-gray-200 font-bold text-gray-900 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s} className="font-medium">
                  {tStatus(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
 
      {/* Viewing Alert (Conditional) */}
      {isViewing && (
        <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-gray-50">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-[#2d3134]" />
            </div>
            <h4 className="font-bold text-[#2d3134]">{t('sidebar.alertViewingTitle')}</h4>
            <p className="text-sm text-gray-600 font-medium">{t('sidebar.alertViewingSubtitle')}</p>
          </CardContent>
        </Card>
      )}

      {/* Checklist Progress */}
      <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-500" /> {t('sidebar.checklistTitle')}
            </h4>
            <span className="text-sm font-bold text-gray-500">{completedChecklists} / {totalChecklists}</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-gray-100" />
        </CardContent>
      </Card>

      {/* Upcoming Reminders (Mocked for UI) */}
      <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-5">
          <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-orange-500" /> {t('sidebar.remindersTitle')}
          </h4>
          <div className="space-y-3">
            <div className="text-sm text-gray-500 italic text-center p-4 border border-dashed border-gray-200 rounded-xl">
              {t('sidebar.remindersEmpty')}
            </div>
            <Button variant="outline" onClick={onAddReminder} className="w-full border-dashed border-gray-300 text-gray-500 hover:text-gray-900 rounded-xl h-10">
              <Plus className="w-4 h-4 mr-2" /> {t('sidebar.actionAddReminder')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <UploadModal 
          onUploadSuccess={onUpdate}
          customTrigger={
            <Button variant="outline" className="bg-white border-gray-200 text-gray-700 rounded-xl h-12 shadow-sm font-semibold">
              {t('sidebar.actionAddDocument')}
            </Button>
          }
        />
        <Button variant="outline" className="bg-white border-gray-200 text-gray-700 rounded-xl h-12 shadow-sm font-semibold" onClick={() => {
          if (navigator.share) {
            navigator.share({ title: apartment.title, url: window.location.href }).catch(() => {});
          } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success(t('toast.copied'));
          }
        }}>
          {t('sidebar.actionShare')}
        </Button>
      </div>

    </div>
  );
}
