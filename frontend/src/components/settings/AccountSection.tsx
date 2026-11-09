import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Bell, FileText, HardDrive, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function AccountSection({ user }: { user: any }) {
  const t = useTranslations('Settings');
  const [stats, setStats] = useState<{ apartments: number, reminders: number, documents: number, totalStorageBytes: number } | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/users/stats', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats', err));
  }, []);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await fetch('http://localhost:3000/users/export', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wohnboard_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(t('toast.exportSuccess'));
      } else {
        toast.error(t('toast.exportFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('account.title')}</h2>
        <p className="text-gray-500">{t('account.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-0.5">{t('account.statApartments')}</p>
              <p className="text-2xl font-bold text-gray-900 leading-none">{stats?.apartments ?? '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 text-[#2d3134] rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-0.5">{t('account.statDocuments')}</p>
              <p className="text-2xl font-bold text-gray-900 leading-none">{stats?.documents ?? '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-0.5">{t('account.statReminders')}</p>
              <p className="text-2xl font-bold text-gray-900 leading-none">{stats?.reminders ?? '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-0.5">{t('account.statStorage')}</p>
              <p className="text-2xl font-bold text-gray-900 leading-none">{stats ? formatBytes(stats.totalStorageBytes) : '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden mt-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('account.exportTitle')}</h3>
              <p className="text-sm text-gray-500 max-w-md">{t('account.exportDescription')}</p>
            </div>
            <Button onClick={handleExport} disabled={exporting} variant="outline" className="shrink-0 gap-2 font-medium rounded-xl h-11 px-6">
              <Download className="w-4 h-4" />
              {exporting ? t('account.actionExporting') : t('account.actionExport')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
