import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { isToday, isTomorrow, isPast, isFuture, startOfWeek, endOfWeek, isWithinInterval, addHours, addDays, addWeeks } from 'date-fns';
import { Clock, MoreVertical, Trash2, Home, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function ReminderList({ reminders, onUpdate }: { reminders: any[], onUpdate: () => void }) {
  const t = useTranslations('Reminders');
  
  const handleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`http://localhost:3000/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus }),
        credentials: 'include',
      });
      if (res.ok) onUpdate();
    } catch (err) {
      toast.error(t('toast.updateFailed'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/reminders/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(t('toast.deleteSuccess'));
        onUpdate();
      }
    } catch (err) {
      toast.error(t('toast.deleteFailed'));
    }
  };

  const handleSnooze = async (id: string, currentDateTime: string, mode: '1h' | 'tomorrow' | 'nextWeek') => {
    let newDate = new Date(currentDateTime);
    if (mode === '1h') newDate = addHours(newDate, 1);
    if (mode === 'tomorrow') newDate = addDays(newDate, 1);
    if (mode === 'nextWeek') newDate = addWeeks(newDate, 1);

    try {
      const res = await fetch(`http://localhost:3000/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateTime: newDate.toISOString() }),
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(t('toast.snoozeSuccess'));
        onUpdate();
      }
    } catch (err) {
      toast.error(t('toast.snoozeFailed'));
    }
  };

  const renderGroup = (title: string, filterFn: (r: any) => boolean, emptyMsg?: string) => {
    const groupReminders = reminders.filter(filterFn);
    
    if (groupReminders.length === 0 && !emptyMsg) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        {groupReminders.length === 0 ? (
          <div className="text-sm text-gray-400 italic py-4 border-2 border-dashed border-gray-100 rounded-xl text-center">
            {emptyMsg}
          </div>
        ) : (
          <div className="space-y-3">
            {groupReminders.map(r => (
              <Card key={r.id} className={`border border-gray-100 shadow-sm rounded-xl overflow-hidden transition-all ${r.completed ? 'opacity-60 bg-gray-50' : 'bg-white hover:shadow-md'}`}>
                <CardContent className="p-4 flex items-start gap-4">
                  <button 
                    onClick={() => handleComplete(r.id, r.completed)}
                    className="mt-1 shrink-0 text-gray-400 hover:text-[#2d3134] transition-colors"
                  >
                    {r.completed ? <CheckCircle2 className="w-6 h-6 text-[#2d3134]" /> : <Circle className="w-6 h-6" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-bold text-base truncate ${r.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {r.title}
                      </h4>
                      <Badge variant="secondary" className="shrink-0 bg-gray-100 text-gray-600 border-0 font-medium text-xs">
                        {t(`modal.types.${r.type}`) || r.type}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                      {/* Status/Time Indicator */}
                      {r.completed ? (
                        <span className="text-[#2d3134] font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> {t('list.completedBadge')}</span>
                      ) : isPast(new Date(r.dateTime)) && !isToday(new Date(r.dateTime)) ? (
                        <span className="text-orange-500 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {t('list.needsAttention')}</span>
                      ) : (
                        <span className="text-blue-600 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {new Date(r.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      )}

                      {/* Apartment Link */}
                      {r.apartment && (
                        <span className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 max-w-[200px] truncate">
                          <Home className="w-3 h-3 shrink-0" /> <span className="truncate">{r.apartment.title}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {!r.completed && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 shrink-0 outline-none focus:ring-2 focus:ring-gray-200">
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl">
                        <DropdownMenuItem onClick={() => handleSnooze(r.id, r.dateTime, '1h')}>
                          {t('list.snooze1h')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSnooze(r.id, r.dateTime, 'tomorrow')}>
                          {t('list.snoozeTomorrow')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSnooze(r.id, r.dateTime, 'nextWeek')}>
                          {t('list.snoozeNextWeek')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(r.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> {t('list.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {r.completed && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50 shrink-0" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  return (
    <div className="space-y-2">
      {renderGroup(t('list.groups.overdue'), r => !r.completed && isPast(new Date(r.dateTime)) && !isToday(new Date(r.dateTime)))}
      {renderGroup(t('list.groups.today'), r => !r.completed && isToday(new Date(r.dateTime)), t('list.groups.todayEmpty'))}
      {renderGroup(t('list.groups.tomorrow'), r => !r.completed && isTomorrow(new Date(r.dateTime)))}
      {renderGroup(t('list.groups.thisWeek'), r => !r.completed && !isToday(new Date(r.dateTime)) && !isTomorrow(new Date(r.dateTime)) && isWithinInterval(new Date(r.dateTime), { start: weekStart, end: weekEnd }))}
      {renderGroup(t('list.groups.later'), r => !r.completed && isFuture(new Date(r.dateTime)) && !isWithinInterval(new Date(r.dateTime), { start: weekStart, end: weekEnd }))}
      {renderGroup(t('list.groups.completed'), r => r.completed)}
    </div>
  );
}
