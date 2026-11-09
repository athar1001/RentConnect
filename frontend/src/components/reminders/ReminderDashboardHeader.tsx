import { Card, CardContent } from '@/components/ui/card';
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format, isToday, isPast, isFuture, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { useTranslations } from 'next-intl';

export function ReminderDashboardHeader({ reminders }: { reminders: any[] }) {
  const t = useTranslations('Reminders');
  const now = new Date();
  
  const urgent = reminders.filter(r => !r.completed && (isToday(new Date(r.dateTime)) || isPast(new Date(r.dateTime)))).length;
  const today = reminders.filter(r => !r.completed && isToday(new Date(r.dateTime))).length;
  const overdue = reminders.filter(r => !r.completed && isPast(new Date(r.dateTime)) && !isToday(new Date(r.dateTime))).length;
  const upcoming = reminders.filter(r => !r.completed && isFuture(new Date(r.dateTime)) && !isToday(new Date(r.dateTime))).length;
  
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  const completedThisWeek = reminders.filter(r => r.completed && isWithinInterval(new Date(r.updatedAt || r.createdAt), { start, end })).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="border-orange-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl bg-orange-50/50">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white text-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-orange-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-800 mb-0.5">{t('dashboardHeader.urgent')}</p>
            <p className="text-2xl font-black text-orange-900 leading-none">{urgent}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl bg-white">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-0.5">{t('dashboardHeader.today')}</p>
            <p className="text-2xl font-bold text-gray-900 leading-none">{today}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl bg-white">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-0.5">{t('dashboardHeader.upcoming')}</p>
            <p className="text-2xl font-bold text-gray-900 leading-none">{upcoming}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl bg-white">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-0.5">{t('dashboardHeader.overdue')}</p>
            <p className="text-2xl font-bold text-gray-900 leading-none">{overdue}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl bg-white">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 text-[#2d3134] rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-0.5">{t('dashboardHeader.completedThisWeek')}</p>
            <p className="text-2xl font-bold text-gray-900 leading-none">{completedThisWeek}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
