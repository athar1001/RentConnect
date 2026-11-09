'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { ReminderDashboardHeader } from '@/components/reminders/ReminderDashboardHeader';
import { ReminderList } from '@/components/reminders/ReminderList';
import { ReminderSidebar } from '@/components/reminders/ReminderSidebar';
import { QuickAddReminderModal } from '@/components/reminders/QuickAddReminderModal';

export default function RemindersPage() {
  const t = useTranslations('Reminders');
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/reminders', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      } else {
        toast.error(t('toast.loadFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return (
    <div className="flex flex-col h-full space-y-6 max-w-[1400px]">
      
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 mb-1">{t('title')}</h1>
          <p className="text-gray-500 font-medium">{t('subtitle')}</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#2d3134] hover:bg-[#1a1c1e] text-white rounded-xl h-11 px-6 gap-2 shadow-sm font-semibold">
          <Plus className="w-5 h-5" /> {t('actionNew')}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3134]"></div>
        </div>
      ) : (
        <div className="space-y-6 pb-10">
          
          {/* Dashboard Header (Metrics) */}
          <ReminderDashboardHeader reminders={reminders} />

          {/* Main Layout (Split Pane) */}
          <div className="grid lg:grid-cols-4 gap-6">
            
            {/* Left: Main Reminder List */}
            <div className="lg:col-span-3">
              {reminders.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 mx-auto mb-4">
                    <Plus className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{t('empty.title')}</h2>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    {t('empty.subtitle')}
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#2d3134] hover:bg-[#1a1c1e] text-white">
                    {t('empty.actionCreate')}
                  </Button>
                </div>
              ) : (
                <ReminderList reminders={reminders} onUpdate={fetchReminders} />
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <ReminderSidebar reminders={reminders} onUpdate={fetchReminders} />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddReminderModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchReminders}
      />

    </div>
  );
}
