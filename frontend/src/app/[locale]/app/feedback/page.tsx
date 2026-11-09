'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MessageSquare, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function FeedbackPage() {
  const t = useTranslations('Feedback');
  const [formData, setFormData] = useState({
    type: 'GENERAL',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast.error(t('fillAllFields'));
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('http://localhost:3000/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success(t('successMessage'));
        setFormData({ type: 'GENERAL', subject: '', message: '' });
      } else {
        toast.error(t('errorMessage'));
      }
    } catch (err) {
      toast.error(t('networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-500 text-sm">{t('description')}</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> {t('submitTicket')}
          </CardTitle>
          <CardDescription>{t('submitTicketDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('typeLabel')}</label>
              <select 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="BUG">{t('bugReport')}</option>
                <option value="FEATURE_REQUEST">{t('featureRequest')}</option>
                <option value="GENERAL">{t('generalFeedback')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('subjectLabel')}</label>
              <Input 
                value={formData.subject} 
                onChange={e => setFormData({...formData, subject: e.target.value})} 
                placeholder={t('subjectPlaceholder')} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('messageLabel')}</label>
              <textarea 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[150px]"
                value={formData.message} 
                onChange={e => setFormData({...formData, message: e.target.value})} 
                placeholder={t('messagePlaceholder')} 
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? t('sending') : t('sendFeedback')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
