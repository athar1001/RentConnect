import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function QuickAddReminderModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  onSuccess: () => void 
}) {
  const t = useTranslations('Reminders');
  const [apartments, setApartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'FOLLOW_UP',
    apartmentId: 'none',
    date: '',
    time: '12:00',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch apartments for the dropdown
      fetch('http://localhost:3000/apartments', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setApartments(data))
        .catch(() => console.error('Failed to fetch apartments'));
        
      // Reset form
      setFormData({
        title: '',
        type: 'FOLLOW_UP',
        apartmentId: 'none',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        description: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) {
      toast.error(t('toast.fillRequired'));
      return;
    }

    try {
      setLoading(true);
      
      const dateTime = new Date(`${formData.date}T${formData.time}:00`).toISOString();
      
      const payload: any = {
        title: formData.title,
        type: formData.type,
        dateTime,
        description: formData.description
      };

      if (formData.apartmentId !== 'none') {
        payload.apartmentId = formData.apartmentId;
      }

      const res = await fetch('http://localhost:3000/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('toast.addSuccess'));
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to create');
      }
    } catch (err) {
      toast.error(t('toast.addFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">{t('modal.title')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{t('modal.fieldTitle')}</label>
            <Input 
              placeholder={t('modal.placeholderTitle')} 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="min-w-0">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{t('modal.fieldType')}</label>
              <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v || 'FOLLOW_UP'})}>
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEWING">{t('modal.types.VIEWING')}</SelectItem>
                  <SelectItem value="FOLLOW_UP">{t('modal.types.FOLLOW_UP')}</SelectItem>
                  <SelectItem value="DOCUMENT">{t('modal.types.DOCUMENT')}</SelectItem>
                  <SelectItem value="DEADLINE">{t('modal.types.DEADLINE')}</SelectItem>
                  <SelectItem value="CUSTOM">{t('modal.types.CUSTOM')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-w-0">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{t('modal.fieldApartment')}</label>
              <Select value={formData.apartmentId} onValueChange={v => setFormData({...formData, apartmentId: v || 'none'})}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 justify-between min-w-0">
                  <span className="truncate block text-left pr-2 flex-1">
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent className="max-w-[320px]">
                  <SelectItem value="none" className="truncate">{t('modal.noAssignment')}</SelectItem>
                  {apartments.map(apt => (
                    <SelectItem key={apt.id} value={apt.id} className="truncate">
                      {apt.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{t('modal.fieldDate')}</label>
              <Input 
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{t('modal.fieldTime')}</label>
              <Input 
                type="time"
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{t('modal.fieldDescription')}</label>
            <Textarea 
              placeholder={t('modal.placeholderDescription')} 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="bg-gray-50 border-gray-200 resize-none h-20"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={onClose} className="text-gray-500">{t('modal.actionCancel')}</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-[#2d3134] hover:bg-[#1a1c1e] text-white rounded-xl">
            {t('modal.actionSave')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
