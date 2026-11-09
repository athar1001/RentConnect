import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface AddReminderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  apartmentId?: string;
}

export function AddReminderModal({ isOpen, onOpenChange, onSuccess, apartmentId }: AddReminderModalProps) {
  const t = useTranslations('Reminders');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'FOLLOW_UP',
    date: '',
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) {
      toast.error(t('toast.fillRequired'));
      return;
    }

    // Combine date and time
    const dateTimeString = `${formData.date}T${formData.time}:00`;
    let dateTime: Date;
    try {
      dateTime = new Date(dateTimeString);
    } catch (err) {
      toast.error(t('toast.invalidDateTime'));
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('http://localhost:3000/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          dateTime: dateTime.toISOString(),
          apartmentId: apartmentId || undefined,
        }),
        credentials: 'include'
      });

      if (res.ok) {
        toast.success(t('toast.addSuccess'));
        onSuccess();
        onOpenChange(false);
        setFormData({ title: '', description: '', type: 'FOLLOW_UP', date: '', time: '' });
      } else {
        toast.error(t('toast.addFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('modal.title')}</DialogTitle>
          <DialogDescription>
            {t('modal.subtitle')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.fieldTitle')}</label>
            <Input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder={t('modal.placeholderTitle')} 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.fieldType')}</label>
            <select 
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="VIEWING">{t('modal.types.VIEWING')}</option>
              <option value="FOLLOW_UP">{t('modal.types.FOLLOW_UP')}</option>
              <option value="DOCUMENT">{t('modal.types.DOCUMENT')}</option>
              <option value="DEADLINE">{t('modal.types.DEADLINE')}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.fieldDate')}</label>
              <Input 
                type="date"
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.fieldTime')}</label>
              <Input 
                type="time"
                value={formData.time} 
                onChange={e => setFormData({...formData, time: e.target.value})} 
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.fieldDescription')}</label>
            <Input 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder={t('modal.placeholderDescription')} 
            />
          </div>
          <Button type="submit" className="w-full mt-4 bg-[#2d3134] hover:bg-[#1a1c1e] text-white rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? t('modal.actionAdding') : t('modal.actionAdd')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
