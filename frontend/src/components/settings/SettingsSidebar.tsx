import { Button } from '@/components/ui/button';
import { User, Settings, Bell, Shield, HardDrive, Puzzle, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type SettingsSection = 'profile' | 'preferences' | 'notifications' | 'privacy' | 'account' | 'extension' | 'danger';

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSelect: (section: SettingsSection) => void;
}

export function SettingsSidebar({ activeSection, onSelect }: SettingsSidebarProps) {
  const t = useTranslations('Settings.sidebar');
  const sections: { id: SettingsSection; label: string; icon: React.ReactNode; danger?: boolean }[] = [
    { id: 'profile', label: t('profile'), icon: <User className="w-4 h-4" /> },
    { id: 'preferences', label: t('preferences'), icon: <Settings className="w-4 h-4" /> },
    { id: 'notifications', label: t('notifications'), icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: t('privacy'), icon: <Shield className="w-4 h-4" /> },
    { id: 'account', label: t('account'), icon: <HardDrive className="w-4 h-4" /> },
    { id: 'extension', label: t('extension'), icon: <Puzzle className="w-4 h-4" /> },
    { id: 'danger', label: t('danger'), icon: <AlertTriangle className="w-4 h-4" />, danger: true },
  ];

  return (
    <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
      {sections.map((section) => (
        <Button
          key={section.id}
          variant="ghost"
          onClick={() => onSelect(section.id)}
          className={`justify-start gap-3 h-11 px-4 w-full transition-all ${
            activeSection === section.id
              ? section.danger
                ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
                : 'bg-white shadow-sm text-[#2d3134] hover:bg-white hover:text-[#2d3134] font-medium'
              : section.danger
                ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'
          }`}
        >
          {section.icon}
          {section.label}
        </Button>
      ))}
    </div>
  );
}
