'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import {
  Building2,
  Inbox,
  Users,
  Calendar,
  BarChart3,
  Settings,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
  Bell,
  UserCheck
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Landlord');
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: '/landlord/dashboard' },
    { label: 'Properties', icon: <Building2 className="w-4 h-4" />, href: '/landlord/properties' },
    { label: 'Applications', icon: <Inbox className="w-4 h-4" />, href: '/landlord/applications' },
    { label: 'Candidate Comparison', icon: <Users className="w-4 h-4" />, href: '/landlord/compare' },
    { label: 'Viewing Calendar', icon: <Calendar className="w-4 h-4" />, href: '/landlord/calendar' },
    { label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, href: '/landlord/analytics' },
    { label: 'Settings', icon: <Settings className="w-4 h-4" />, href: '/landlord/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-600/30">
              WB
            </div>
            <div>
              <span className="font-bold tracking-tight text-white block text-sm">WohnBoard</span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Landlord & Property Manager Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            <Link href="/app/dashboard" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Switch to Tenant Mode
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-6 py-8 gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm space-y-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Verification Badge box */}
          <div className="bg-emerald-950 text-emerald-100 rounded-3xl p-5 border border-emerald-900 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">GDPR & Fair Housing</span>
            </div>
            <p className="text-[11px] text-emerald-300 leading-relaxed">
              Applicant evaluation matrix uses objective criteria with zero discriminatory AI automated ranking.
            </p>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
