'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useState, useEffect } from 'react';

export function Navbar() {
  const t = useTranslations('Navigation');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          setIsLoggedIn(true);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
          <Link href={{ pathname: '/', hash: 'features' }} className="hover:text-indigo-600 transition-colors">{t('features')}</Link>
          <Link href={{ pathname: '/', hash: 'how-it-works' }} className="hover:text-indigo-600 transition-colors">{t('howItWorks')}</Link>
          <Link href={{ pathname: '/', hash: 'faq' }} className="hover:text-indigo-600 transition-colors">{t('faq')}</Link>
          <Link href="/blog" className="hover:text-indigo-600 transition-colors">{t('blog') || 'Blog'}</Link>
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <Link href="/app">
              <Button className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all">
                {t('dashboard')}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">
                {t('login') || 'Log In'}
              </Link>
              <Link href="/register">
                <Button className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all">
                  {t('signUp')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
