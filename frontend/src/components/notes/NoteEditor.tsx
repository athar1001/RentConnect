import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Trash2, Pin, PinOff, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function NoteEditor({ 
  note, 
  onClose, 
  onSave, 
  onDelete 
}: { 
  note: any | null, 
  onClose: () => void,
  onSave: (noteData: any) => Promise<void>,
  onDelete: (id: string) => Promise<void>
}) {
  const t = useTranslations('Notes');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || '');
      setIsPinned(note.isPinned || false);
    } else {
      setTitle('');
      setContent('');
      setTags('');
      setIsPinned(false);
    }
  }, [note]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    
    setIsSaving(true);
    await onSave({
      id: note?.id,
      title: title.trim() || t('editor.untitledNote'),
      content,
      tags: tags.trim(),
      isPinned
    });
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#FAF9F6]/30">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-900 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsPinned(!isPinned)}
            className={`rounded-lg ${isPinned ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-gray-400 hover:text-gray-900'}`}
          >
            {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {note?.id && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if (confirm(t('editor.confirmDelete'))) onDelete(note.id);
              }}
              className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isSaving || (!title.trim() && !content.trim())}
            className="bg-[#2d3134] hover:bg-[#1a1c1e] text-white rounded-lg gap-2"
          >
            <Save className="w-4 h-4" /> {isSaving ? t('editor.actionSaving') : t('editor.actionSave')}
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <Input 
          placeholder={t('editor.placeholderTitle')} 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 mb-4 h-auto"
        />
        
        <div className="flex items-center gap-2 mb-6 text-gray-500">
          <Tag className="w-4 h-4" />
          <Input 
            placeholder={t('editor.placeholderTags')} 
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 text-sm h-auto flex-1"
          />
        </div>

        <Textarea 
          placeholder={t('editor.placeholderContent')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 text-gray-700 leading-relaxed min-h-[400px]"
        />
      </div>

    </div>
  );
}
