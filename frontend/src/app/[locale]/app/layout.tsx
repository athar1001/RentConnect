'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import {
  Home,
  Search,
  LayoutDashboard,
  Folder,
  Bell,
  Settings,
  LogOut,
  PenLine,
  Columns,
  Trash2,
  Check,
  User,
  ShieldCheck,
  HardDrive,
  AlertTriangle,
  MessageSquare,
  UserCheck,
  FileText,
  Building2,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { useState, useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tNav = useTranslations('Navigation');
  const tUserMenu = useTranslations('UserMenu');
  const tFooter = useTranslations('HomePage.Footer');
  const tNotifications = useTranslations('Notifications');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = useLocale();

  const [authorized, setAuthorized] = useState(false);
  const [publishedStatus, setPublishedStatus] = useState({
    PRIVACY_POLICY: false,
    TERMS_OF_SERVICE: false,
    COOKIE_POLICY: false,
    IMPRINT: false,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:3000/legal-pages/published');
        if (res.ok) {
          const data = await res.json();
          setPublishedStatus(data);
        }
      } catch (err) {
        // Fallback silently
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    const fetchUserAndCheckLocale = async () => {
      try {
        const res = await fetch('http://localhost:3000/auth/me', { credentials: 'include' });
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const userData = await res.json();
        if (userData.role !== 'USER') {
          router.push('/login');
          return;
        }
        setAuthorized(true);

        const preferredLocale = userData.preferredLanguage;
        if (preferredLocale && preferredLocale !== currentLocale) {
          router.replace(
            // @ts-expect-error -- Standard next-intl dynamic route typing bypass
            { pathname, params },
            { locale: preferredLocale }
          );
        }
      } catch (err) {
        console.error('Failed to check user auth / locale preference:', err);
        router.push('/login');
      }
    };
    fetchUserAndCheckLocale();
  }, [currentLocale, pathname, params, router]);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:3000/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      try {
        await fetch(`http://localhost:3000/notifications/${notification.id}/read`, {
          method: 'PATCH',
          credentials: 'include',
        });
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    setIsOpen(false);
    router.push('/app/reminders');
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:3000/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:3000/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('http://localhost:3000/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', { method: 'POST', credentials: 'include' });
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { icon: <LayoutDashboard className="w-4 h-4" />, translationKey: 'dashboard', href: '/app/dashboard', exact: true },
    { icon: <Sparkles className="w-4 h-4 text-emerald-400" />, translationKey: 'onboarding', href: '/app/onboarding', exact: false },
    { icon: <ShieldCheck className="w-4 h-4" />, translationKey: 'housingIdentity', href: '/app/housing-identity', exact: false },
    { icon: <Search className="w-4 h-4" />, translationKey: 'apartments', href: '/app/apartments', exact: false },
    { icon: <FileText className="w-4 h-4" />, translationKey: 'applications', href: '/app/applications', exact: false },
    { icon: <Folder className="w-4 h-4" />, translationKey: 'documents', href: '/app/documents', exact: false },
    { icon: <Bell className="w-4 h-4" />, translationKey: 'reminders', href: '/app/reminders', exact: false },
    { icon: <PenLine className="w-4 h-4" />, translationKey: 'notes', href: '/app/notes', exact: false },
    { icon: <Settings className="w-4 h-4" />, translationKey: 'settings', href: '/app/settings', exact: false },
  ] as const;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname.endsWith('/app/dashboard') || pathname.endsWith('/app');
    }
    return pathname.includes(href);
  };

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      {/* Top Header Bar (Landlord Portal Style) */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-600/30">
              WB
            </div>
            <div>
              <span className="font-bold tracking-tight text-white block text-sm">WohnBoard</span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Tenant Housing Identity Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-slate-400 hover:text-white transition-colors p-1"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-950 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden text-gray-900 animate-in fade-in duration-200">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <span className="font-semibold text-gray-800 text-xs">{tNotifications('title')}</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} className="text-xs font-semibold text-emerald-600 hover:underline">
                          {tNotifications('markAllAsRead')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 text-xs">
                      {notifications.length === 0 ? (
                        <div className="px-5 py-8 text-center text-gray-400">
                          <Bell className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                          <p className="font-medium text-xs text-gray-500">{tNotifications('allCaughtUp')}</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 transition-colors cursor-pointer ${n.read ? 'bg-white text-gray-600' : 'bg-emerald-50/40 text-gray-900 font-medium'}`}
                          >
                            <span className="font-bold block text-xs">{n.title}</span>
                            <p className="text-[11px] text-gray-500 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Landlord Mode Switcher Button */}
            <Link
              href="/landlord/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Switch to Landlord Portal
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
              title={tNav('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout (Landlord Portal Style) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-6 py-8 gap-8">
        {/* Navigation Sidebar (Matching Landlord Sidebar Cards) */}
        <aside className="w-64 shrink-0 hidden md:block space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
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
                  {tNav(item.translationKey)}
                </Link>
              );
            })}
          </div>

          {/* Housing Identity Verification Badge box */}
          <div className="bg-emerald-950 text-emerald-100 rounded-3xl p-5 border border-emerald-900 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">Reusable Housing Identity</span>
            </div>
            <p className="text-[11px] text-emerald-300 leading-relaxed">
              Your profile documents are encrypted, watermarked, and shareable with landlords in 30 seconds.
            </p>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 min-w-0 flex flex-col justify-between">
          <div>{children}</div>

          <footer className="mt-12 pt-6 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium">
            <div>&copy; {new Date().getFullYear()} {tFooter('copyright')}</div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {publishedStatus.PRIVACY_POLICY && (
                <Link href="/privacy-policy" className="hover:text-gray-600 transition-colors">
                  {tFooter('privacy')}
                </Link>
              )}
              {publishedStatus.TERMS_OF_SERVICE && (
                <Link href="/terms-of-service" className="hover:text-gray-600 transition-colors">
                  {tFooter('terms')}
                </Link>
              )}
              {publishedStatus.COOKIE_POLICY && (
                <Link href="/cookie-policy" className="hover:text-gray-600 transition-colors">
                  {tFooter('cookies')}
                </Link>
              )}
              {publishedStatus.IMPRINT && (
                <Link href="/imprint" className="hover:text-gray-600 transition-colors">
                  {currentLocale === 'de' ? 'Impressum' : 'Imprint'}
                </Link>
              )}
              <Link href={"/app/feedback" as any} className="hover:text-gray-600 transition-colors">
                {tNav('feedback')}
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
