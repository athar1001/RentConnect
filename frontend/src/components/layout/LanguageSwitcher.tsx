'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { useParams } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const switchLocale = (newLocale: string) => {
    // Preserve any existing parameters (like dynamic IDs) when switching locale
    router.replace(
      // @ts-expect-error -- TypeScript may complain about dynamic path types, but this is standard next-intl usage
      { pathname, params },
      { locale: newLocale }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" className="rounded-full h-10 px-4 border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900 text-gray-700 font-medium transition-all" />}>
        <Globe className="w-4 h-4" />
        <span className="uppercase tracking-wider text-xs ml-1">{locale}</span>
        <span className="sr-only">Toggle language</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-2xl shadow-xl border-gray-100 p-2">
        <DropdownMenuItem 
          onClick={() => switchLocale('en')} 
          className={`flex items-center justify-between cursor-pointer rounded-xl px-3 py-2.5 transition-colors ${locale === 'en' ? 'bg-gray-50 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          English
          {locale === 'en' && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchLocale('de')}
          className={`flex items-center justify-between cursor-pointer rounded-xl px-3 py-2.5 transition-colors mt-1 ${locale === 'de' ? 'bg-gray-50 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Deutsch
          {locale === 'de' && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
