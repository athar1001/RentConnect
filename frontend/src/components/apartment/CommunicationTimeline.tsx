import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare, Phone, Mail, Trash2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

const LOG_TYPES = ['Email', 'Phone', 'WhatsApp', 'SMS', 'In-Person', 'Other'];

const TYPE_ICONS: Record<string, any> = {
  Email: <Mail className="w-4 h-4 text-blue-500" />,
  Phone: <Phone className="w-4 h-4 text-green-500" />,
  WhatsApp: <MessageSquare className="w-4 h-4 text-green-500" />,
  SMS: <MessageSquare className="w-4 h-4 text-blue-500" />,
};

export function CommunicationTimeline({ apartmentId, initialLogs, onUpdate }: { apartmentId: string, initialLogs: any[], onUpdate: () => void }) {
  const t = useTranslations('ApartmentDetail');
  const [isAdding, setIsAdding] = useState(false);
  const [newLog, setNewLog] = useState({ type: 'Email', content: '' });
  const [loading, setLoading] = useState(false);

  // Filter out 'Note' types if they are handled by PersonalNotesWorkspace, or keep them to show a full timeline.
  // The plan said "PersonalNotes" is separate, so we'll hide purely "Note" types from the communication timeline.
  const timelineLogs = initialLogs.filter((log) => log.type !== 'Note').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleAddLog = async () => {
    if (!newLog.content.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/apartments/${apartmentId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newLog.type,
          content: newLog.content.trim(),
          timestamp: new Date().toISOString(),
        }),
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(t('toast.logSuccess'));
        setNewLog({ type: 'Email', content: '' });
        setIsAdding(false);
        onUpdate();
      } else {
        toast.error(t('toast.logFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/logs/${logId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(t('toast.logDeleteSuccess'));
        onUpdate();
      } else {
        toast.error(t('toast.logDeleteFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    }
  };

  return (
    <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-100 py-4 px-5 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-gray-800">{t('timeline.title')}</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsAdding(!isAdding)} className="h-8 text-[#2d3134] hover:text-[#1e2123] hover:bg-gray-50 rounded-lg">
          <Plus className="w-4 h-4 mr-1.5" /> {t('timeline.actionAddLog')}
        </Button>
      </CardHeader>
      
      <CardContent className="p-5">
        
        {isAdding && (
          <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
            <Select value={newLog.type} onValueChange={(val) => setNewLog({ ...newLog, type: val || 'NOTE' })}>
              <SelectTrigger className="w-full bg-white border-gray-200">
                <SelectValue placeholder={t('timeline.placeholderType')} />
              </SelectTrigger>
              <SelectContent>
                {LOG_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea 
              placeholder={t('timeline.placeholderContent')} 
              value={newLog.content}
              onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
              className="resize-none border-gray-200 bg-white"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>{t('timeline.actionCancel')}</Button>
              <Button size="sm" onClick={handleAddLog} disabled={loading || !newLog.content.trim()} className="bg-[#2d3134] hover:bg-[#1a1c1e] text-white">{t('timeline.actionSave')}</Button>
            </div>
          </div>
        )}

        <div className="relative border-l-2 border-gray-100 ml-3 pl-6 space-y-8 mt-2">
          {timelineLogs.length === 0 && !isAdding && (
            <div className="text-sm text-gray-400 italic">{t('timeline.empty')}</div>
          )}
          
          {timelineLogs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[33px] top-1 w-6 h-6 rounded-full bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center">
                {TYPE_ICONS[log.type] || <MessageSquare className="w-3 h-3 text-gray-400" />}
              </div>
              
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">{log.type}</span>
                    <span className="text-xs font-medium text-gray-400">• {new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteLog(log.id)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{log.content}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
