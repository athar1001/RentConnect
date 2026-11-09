'use client';

import { useState, useEffect, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { SettingsSidebar, SettingsSection } from '@/components/settings/SettingsSidebar';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { PreferencesSection } from '@/components/settings/PreferencesSection';
import { NotificationsSection } from '@/components/settings/NotificationsSection';
import { PrivacySecuritySection } from '@/components/settings/PrivacySecuritySection';
import { AccountSection } from '@/components/settings/AccountSection';
import { ExtensionSettingsSection } from '@/components/settings/ExtensionSettingsSection';
import { DangerZoneSection } from '@/components/settings/DangerZoneSection';

function SettingsPageContent() {
  const t = useTranslations('Settings');
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section') as SettingsSection | null;
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/users/settings', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 mb-1">{t('title')}</h1>
        <p className="text-gray-500 font-medium">{t('subtitle')}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3134]"></div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 pb-10 items-start">
          
          {/* Sidebar Navigation */}
          <SettingsSidebar 
            activeSection={activeSection} 
            onSelect={setActiveSection} 
          />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 w-full">
            {activeSection === 'profile' && <ProfileSection user={user} onUpdate={fetchUser} />}
            {activeSection === 'preferences' && <PreferencesSection user={user} onUpdate={fetchUser} />}
            {activeSection === 'notifications' && <NotificationsSection user={user} onUpdate={fetchUser} />}
            {activeSection === 'privacy' && <PrivacySecuritySection user={user} />}
            {activeSection === 'account' && <AccountSection user={user} />}
            {activeSection === 'extension' && <ExtensionSettingsSection user={user} onUpdate={fetchUser} />}
            {activeSection === 'danger' && <DangerZoneSection />}
          </div>

        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3134]"></div></div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
