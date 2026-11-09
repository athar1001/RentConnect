import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function NotificationsSection({ user, onUpdate }: { user: any, onUpdate: () => void }) {
  const t = useTranslations('Settings');
  const [emailReminders, setEmailReminders] = useState(true);
  const [inAppReminders, setInAppReminders] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEmailReminders(user.emailReminders ?? true);
      setInAppReminders(user.inAppReminders ?? true);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailReminders, inAppReminders }),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success(t('toast.saveSuccess'));
        onUpdate();
      } else {
        toast.error(t('toast.saveFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('notifications.title')}</h2>
        <p className="text-gray-500">{t('notifications.subtitle')}</p>
      </div>

      <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-8">
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('notifications.emailReminders')}</h3>
              <p className="text-sm text-gray-500 max-w-md">{t('notifications.emailDescription')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={emailReminders}
                onChange={e => setEmailReminders(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d3134]"></div>
            </label>
          </div>

          <hr className="border-gray-100" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('notifications.inAppReminders')}</h3>
              <p className="text-sm text-gray-500 max-w-md">{t('notifications.inAppDescription')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={inAppReminders}
                onChange={e => setInAppReminders(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d3134]"></div>
            </label>
          </div>

          {!emailReminders && !inAppReminders && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-orange-800 text-sm">
              <strong className="font-semibold">{t('notifications.warningLabel')}</strong> {t('notifications.warningAllDisabled')}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button onClick={handleSave} disabled={loading} className="bg-[#2d3134] hover:bg-[#1a1c1e] text-white rounded-xl">
              {loading ? t('notifications.actionSaving') : t('notifications.actionSave')}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
