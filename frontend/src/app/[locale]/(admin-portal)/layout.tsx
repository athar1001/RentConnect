'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { ShieldCheck, Activity, Users, LogOut, ArrowLeft, Database, DownloadCloud, Stethoscope, Home, FileText, MessageSquare, Bell, UserX, BookOpen, Cookie } from 'lucide-react';

import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:3000/auth/me', { credentials: 'include' });
        if (!res.ok) {
          router.push('/control/sign-in');
          return;
        }
        const user = await res.json();
        if (user.role !== 'ADMIN') {
          router.push('/control/sign-in');
          return;
        }
        setAuthorized(true);
      } catch (err) {
        router.push('/control/sign-in');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', { method: 'POST', credentials: 'include' });
      router.push('/control/sign-in');
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { icon: <Activity className="w-5 h-5" />, label: 'Dashboard', href: '/control' },
    { icon: <Users className="w-5 h-5" />, label: 'Users', href: '/control/users' },
    { icon: <Stethoscope className="w-5 h-5" />, label: 'Platforms', href: '/control/platforms' },
    { icon: <DownloadCloud className="w-5 h-5" />, label: 'Imports', href: '/control/imports' },
    { icon: <Cookie className="w-5 h-5" />, label: 'Settings', href: '/control/settings' },
    { icon: <UserX className="w-5 h-5" />, label: 'System', href: '/control/system' },
    { icon: <Database className="w-5 h-5" />, label: 'Logs', href: '/control/logs' },
  ] as const;

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Admin Sidebar (Dark Theme) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex h-screen sticky top-0 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/control" className="flex items-center gap-2 text-white">
            <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">Admin Portal</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3 mt-4">Menu</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href || (item.href !== '/control' && pathname.includes(item.href))
                  ? 'bg-primary text-white'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 px-3 mt-6">Content</div>
          <Link
            href="/control/blog"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname.includes('/control/blog')
                ? 'bg-primary text-white'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Blog
          </Link>
          <Link
            href="/control/content/legal-pages"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname.includes('/control/content/legal-pages')
                ? 'bg-primary text-white'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5" />
            Legal Pages
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/app"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to App
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="md:hidden flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold tracking-wider">
              ADMINISTRATOR
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
