'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function ImportBar({ onImportSuccess, onImportFail }: { onImportSuccess: (apartment: any) => void, onImportFail?: (url: string) => void }) {
  const t = useTranslations('ImportBar');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    let cleanedUrl = url.trim();
    if (!cleanedUrl) return;

    if (!/^https?:\/\//i.test(cleanedUrl)) {
      cleanedUrl = 'https://' + cleanedUrl;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/apartments/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanedUrl }),
        credentials: 'include',
      });

      if (res.ok) {
        const apartment = await res.json();
        toast.success(t('toastSuccess'));
        setUrl('');
        onImportSuccess(apartment);
      } else {
        const err = await res.json();
        toast.error(err.message || t('toastFailed'));
        if (onImportFail) onImportFail(cleanedUrl);
      }
    } catch (error) {
      toast.error(t('toastError'));
      if (onImportFail) onImportFail(cleanedUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleImport} className="flex w-full max-w-3xl items-center space-x-2 bg-white p-2 rounded-2xl shadow-sm border">
      <div className="flex-1 flex items-center px-3 gap-2">
        <LinkIcon className="w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder={t('placeholder')}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 px-0 text-base bg-transparent"
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="rounded-xl px-6 h-11">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('btnImport')}
      </Button>
    </form>
  );
}
