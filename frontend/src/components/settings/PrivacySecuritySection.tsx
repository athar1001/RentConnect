import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShieldCheck, Key } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function PrivacySecuritySection({ user }: { user: any }) {
  const t = useTranslations('Settings');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t('toast.passwordMismatch'));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t('toast.passwordLength'));
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success(t('toast.passwordSuccess'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        toast.error(data.message || t('toast.passwordFailed'));
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
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('privacy.title')}</h2>
        <p className="text-gray-500">{t('privacy.subtitle')}</p>
      </div>

      <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-8">
          
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <ShieldCheck className="w-6 h-6 text-[#2d3134] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900">{t('privacy.bannerTitle')}</h4>
              <p className="text-sm text-gray-600 mt-1">{t('privacy.bannerDescription')}</p>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Key className="w-5 h-5 text-gray-400" /> {t('privacy.changePassword')}
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('privacy.currentPassword')}</label>
                <Input 
                  type="password"
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  required
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('privacy.newPassword')}</label>
                <Input 
                  type="password"
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('privacy.confirmPassword')}</label>
                <Input 
                  type="password"
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={loading || !currentPassword || !newPassword || !confirmPassword} className="bg-[#2d3134] hover:bg-[#1a1c1e] text-white rounded-xl w-full">
                  {loading ? t('privacy.actionUpdating') : t('privacy.actionUpdate')}
                </Button>
              </div>
            </form>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
