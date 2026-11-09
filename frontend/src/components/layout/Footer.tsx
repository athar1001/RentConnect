'use client';

import { useEffect, useState } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Logo } from '@/components/ui/logo';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';

export function Footer() {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

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
        // Fallback silently in production
      }
    };
    fetchStatus();
  }, []);

  const switchLocale = (newLocale: string) => {
    router.replace(
      // @ts-expect-error -- Dynamic path types for next-intl
      { pathname, params },
      { locale: newLocale }
    );
  };

  return (
    <footer className="bg-white border-t py-12">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Logo textClassName="text-lg" />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {t('Footer.desc')}
          </p>
          <p className="text-xs text-gray-400">
            {t('Footer.hosted')}
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">{t('Footer.product')}</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href={{ pathname: '/', hash: 'features' }} className="hover:text-primary">{t('Footer.features')}</Link></li>
            <li><Link href={{ pathname: '/', hash: 'how-it-works' }} className="hover:text-primary">{t('Footer.howItWorks')}</Link></li>
            <li><Link href={{ pathname: '/', hash: 'faq' }} className="hover:text-primary">{t('Footer.faq')}</Link></li>
            <li><Link href="/pricing" className="hover:text-primary">{t('Footer.pricing')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">{t('Footer.legal')}</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            {publishedStatus.PRIVACY_POLICY && (
              <li><Link href="/privacy-policy" className="hover:text-primary">{t('Footer.privacy')}</Link></li>
            )}
            {publishedStatus.TERMS_OF_SERVICE && (
              <li><Link href="/terms-of-service" className="hover:text-primary">{t('Footer.terms')}</Link></li>
            )}
            {publishedStatus.COOKIE_POLICY && (
              <li><Link href="/cookie-policy" className="hover:text-primary">{t('Footer.cookies')}</Link></li>
            )}
            {publishedStatus.IMPRINT && (
              <li>
                <Link href="/imprint" className="hover:text-primary">
                  {locale === 'de' ? 'Impressum' : 'Imprint'}
                </Link>
              </li>
            )}
            <li>
              <button 
                onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))} 
                className="hover:text-primary text-left bg-transparent border-0 p-0 cursor-pointer text-sm text-gray-500 hover:text-indigo-650"
              >
                {locale === 'de' ? 'Cookie-Einstellungen' : 'Cookie Settings'}
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-4">{t('Footer.language')}</h4>
          <div className="flex flex-col space-y-2 text-sm text-gray-500">
            <button onClick={() => switchLocale('en')} className={`text-left hover:text-primary ${locale === 'en' ? 'font-semibold text-primary' : ''}`}>English (EN)</button>
            <button onClick={() => switchLocale('de')} className={`text-left hover:text-primary ${locale === 'de' ? 'font-semibold text-primary' : ''}`}>Deutsch (DE)</button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} {t('Footer.copyright')}
      </div>
    </footer>
  );
}
