import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function DangerZoneSection() {
  const t = useTranslations('Settings');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') return;

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/users/me', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success(t('toast.deleteSuccess'));
        setTimeout(() => {
          fetch('http://localhost:3000/auth/logout', { method: 'POST', credentials: 'include' }).then(() => {
            router.push('/login');
          });
        }, 2000);
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
        <h2 className="text-2xl font-bold text-red-600 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" /> {t('danger.title')}
        </h2>
        <p className="text-gray-500">{t('danger.subtitle')}</p>
      </div>

      <Card className="border-red-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          
          <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm border border-red-100">
            <strong className="font-semibold block mb-1">{t('notifications.warningLabel')}</strong>
            {t('danger.warning')}
          </div>

          <div className="max-w-md space-y-4">
            <p className="text-sm text-gray-700 font-medium">
              {t('danger.confirmationPrompt')}
            </p>
            <Input 
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={t('danger.placeholderConfirmation')}
              className="border-red-200 focus-visible:ring-red-500"
            />
            <Button 
              variant="destructive" 
              className="w-full rounded-xl h-11"
              disabled={confirmation !== 'DELETE' || loading}
              onClick={handleDelete}
            >
              {loading ? t('danger.actionDeleting') : t('danger.actionDelete')}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
