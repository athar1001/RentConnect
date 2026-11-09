import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Monitor, Moon, Sun } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function PreferencesSection({ user, onUpdate }: { user: any, onUpdate: () => void }) {
  const t = useTranslations('Settings');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  useEffect(() => {
    if (user) {
      setLanguage(user.preferredLanguage || 'en');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredLanguage: language }),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success(t('toast.saveSuccess'));
        onUpdate();
        router.replace(
          // @ts-expect-error -- Standard next-intl dynamic route typing bypass
          { pathname, params },
          { locale: language }
        );
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
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('preferences.title')}</h2>
        <p className="text-gray-500">{t('preferences.subtitle')}</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-6">
            
            {/* Language */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">{t('preferences.fieldLanguage')}</h3>
              <p className="text-sm text-gray-500">{t('preferences.languageDescription')}</p>
              <select 
                className="w-full max-w-sm rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
              </select>
            </div>

            <hr className="border-gray-100" />

            {/* Theme Placeholder */}
            <div className="space-y-4 opacity-50 pointer-events-none">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  {t('preferences.fieldTheme')}{' '}
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
                    {t('preferences.themeSoon')}
                  </span>
                </h3>
                <p className="text-sm text-gray-500">{t('preferences.themeSoonDescription')}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="border-2 border-[#2d3134] bg-white rounded-xl p-4 flex flex-col items-center gap-2 w-32 cursor-pointer">
                  <Sun className="w-6 h-6 text-[#2d3134]" />
                  <span className="text-sm font-medium text-[#2d3134]">{t('preferences.themeLight')}</span>
                </div>
                <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-2 w-32 grayscale cursor-not-allowed">
                  <Moon className="w-6 h-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">{t('preferences.themeDark')}</span>
                </div>
                <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-2 w-32 grayscale cursor-not-allowed">
                  <Monitor className="w-6 h-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">{t('preferences.themeSystem')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button onClick={handleSave} disabled={loading} className="bg-[#2d3134] hover:bg-[#1a1c1e] text-white rounded-xl">
                {loading ? t('preferences.actionSaving') : t('preferences.actionSave')}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
