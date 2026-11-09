import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { isToday, isPast } from 'date-fns';
import { AlertCircle, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function ReminderSidebar({ reminders, onUpdate }: { reminders: any[], onUpdate: () => void }) {
  const t = useTranslations('Reminders');
  
  const urgentReminders = reminders.filter(r => 
    !r.completed && (isToday(new Date(r.dateTime)) || isPast(new Date(r.dateTime)))
  ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
        credentials: 'include',
      });
      if (res.ok) onUpdate();
    } catch (err) {
      toast.error(t('toast.updateFailed'));
    }
  };

  // Extract dates that have active reminders for the calendar
  const reminderDates = reminders
    .filter(r => !r.completed)
    .map(r => new Date(r.dateTime));

  return (
    <div className="space-y-6 hidden lg:block">
      


      {/* Mini Calendar Widget */}
      <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl bg-white">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
            <CalendarIcon className="w-4 h-4 text-blue-500" /> {t('sidebar.overview')}
          </h3>
        </div>
        <CardContent className="p-2 flex justify-center">
          <Calendar
            mode="multiple"
            selected={reminderDates}
            className="rounded-md border-0 pointer-events-none [--cell-size:26px] p-1"
            classNames={{
              selected: "bg-blue-100 text-blue-900 hover:bg-blue-100 hover:text-blue-900 focus:bg-blue-100 focus:text-blue-900",
              today: "bg-gray-100 text-gray-900 font-bold",
              week: "mt-1 flex w-full",
              months: "relative flex flex-col gap-2",
              month: "flex w-full flex-col gap-2",
            }}
          />
        </CardContent>
      </Card>

    </div>
  );
}
