'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

const DOCUMENT_TYPES = [
  'SCHUFA',
  'PAYSLIP',
  'ID_COPY',
  'RENT_ARREARS_CERTIFICATE',
  'COVER_LETTER',
  'OTHER'
];

export function UploadModal({ onUploadSuccess, customTrigger }: { onUploadSuccess: () => void, customTrigger?: React.ReactElement }) {
  const t = useTranslations('Documents');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('SCHUFA');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('type', type);

    try {
      const res = await fetch('http://localhost:3000/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('toast.uploadSuccess'));
        setOpen(false);
        setFile(null);
        setTitle('');
        onUploadSuccess();
      } else {
        toast.error(t('toast.uploadFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={customTrigger || (
        <Button className="gap-2 shadow-sm rounded-xl">
          <UploadCloud className="w-4 h-4 mr-2" /> {t('modal.actionUpload')}
        </Button>
      )} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('modal.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('modal.fieldTitle')}</Label>
            <Input 
              id="title" 
              placeholder={t('modal.placeholderTitle')} 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">{t('modal.fieldType')}</Label>
            <select 
              id="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {DOCUMENT_TYPES.map(t_type => (
                <option key={t_type} value={t_type}>{t(`modal.types.${t_type}`)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">{t('modal.fieldFile')}</Label>
            <Input 
              id="file" 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required 
            />
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? t('modal.actionUploading') : t('modal.actionUpload')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
