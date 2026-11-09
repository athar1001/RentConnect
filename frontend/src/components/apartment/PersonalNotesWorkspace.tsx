import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PenLine, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function PersonalNotesWorkspace({ apartmentId, initialLogs, onUpdate }: { apartmentId: string, initialLogs: any[], onUpdate: () => void }) {
  const t = useTranslations('ApartmentDetail');
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter logs to only show "Note" types
  const notes = initialLogs.filter((log) => log.type === 'Note').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/apartments/${apartmentId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Note',
          content: noteContent.trim(),
          timestamp: new Date().toISOString(),
        }),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('toast.noteSaveSuccess'));
        setNoteContent('');
        onUpdate();
      } else {
        toast.error(t('toast.noteSaveFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (logId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/logs/${logId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('toast.noteDeleteSuccess'));
        onUpdate();
      } else {
        toast.error(t('toast.noteDeleteFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    }
  };

  return (
    <Card id="personal-notes-workspace" className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden bg-gradient-to-b from-[#FFFDF9] to-white">
      <CardHeader className="border-b border-orange-50/50 py-4 px-5">
        <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
          <PenLine className="w-5 h-5 text-orange-400" /> {t('personalNotes.title')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-5 space-y-6">
        
        {/* Note Composer */}
        <div className="space-y-3">
          <Textarea 
            placeholder={t('personalNotes.placeholder')}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="min-h-[120px] rounded-xl border-gray-200 bg-white shadow-sm resize-none focus-visible:ring-1 focus-visible:ring-orange-200"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveNote} 
              disabled={loading || !noteContent.trim()} 
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm"
            >
              {t('personalNotes.actionSave')}
            </Button>
          </div>
        </div>

        {/* Notes List */}
        {notes.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {notes.map((note) => (
              <div key={note.id} className="group relative bg-[#FFF9F2] border border-orange-100/50 rounded-xl p-4">
                <div className="text-xs font-semibold text-orange-400 mb-2 uppercase tracking-wide">
                  {new Date(note.timestamp).toLocaleString()}
                </div>
                <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteNote(note.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg h-8 w-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
