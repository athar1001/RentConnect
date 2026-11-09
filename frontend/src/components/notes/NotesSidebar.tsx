import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pin, Hash, PlusCircle, Search, Lightbulb, FileText, Building, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function NotesSidebar({ 
  notes, 
  activeTag, 
  onSelectTag, 
  onApplyTemplate, 
  onSelectNote 
}: { 
  notes: any[], 
  activeTag: string | null, 
  onSelectTag: (tag: string | null) => void,
  onApplyTemplate: (title: string, content: string) => void,
  onSelectNote: (note: any) => void
  }) {
  const t = useTranslations('Notes');
  
  const templates = [
    { id: 't1', title: t('editor.templates.tips.title'), icon: <Lightbulb className="w-4 h-4 text-amber-500" />, content: t('editor.templates.tips.content') },
    { id: 't2', title: t('editor.templates.questions.title'), icon: <HelpCircle className="w-4 h-4 text-blue-500" />, content: t('editor.templates.questions.content') },
    { id: 't3', title: t('editor.templates.documents.title'), icon: <FileText className="w-4 h-4 text-emerald-500" />, content: t('editor.templates.documents.content') },
    { id: 't4', title: t('editor.templates.district.title'), icon: <Building className="w-4 h-4 text-purple-500" />, content: t('editor.templates.district.content') },
  ];

  const pinnedNotes = notes.filter(n => n.isPinned);
  
  // Extract unique tags
  const allTags = new Set<string>();
  notes.forEach(note => {
    if (note.tags) {
      const tagsList = note.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      tagsList.forEach((t: string) => allTags.add(t));
    }
  });
  const tagsArray = Array.from(allTags);

  return (
    <div className="w-64 shrink-0 h-full border-r border-gray-100 bg-[#FAF9F6]/50 flex flex-col p-4 space-y-8 overflow-y-auto hidden md:flex">
      
      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5" /> {t('sidebar.pinned')}
          </h3>
          <div className="space-y-1">
            {pinnedNotes.map(note => (
              <Button 
                key={note.id} 
                variant="ghost" 
                className="w-full justify-start font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 px-2 h-8"
                onClick={() => onSelectNote(note)}
              >
                <span className="truncate">{note.title}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Templates */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('sidebar.templates')}</h3>
        <div className="space-y-1">
          {templates.map(template => (
            <Button 
              key={template.id} 
              variant="ghost" 
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-white px-2 h-9 border border-transparent hover:border-gray-200 hover:shadow-sm transition-all"
              onClick={() => onApplyTemplate(template.title, template.content)}
            >
              <span className="mr-2">{template.icon}</span>
              <span className="truncate text-sm">{template.title}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5" /> {t('sidebar.tags')}
        </h3>
        
        <div className="flex flex-wrap gap-1.5">
          <Badge 
            variant={activeTag === null ? "default" : "secondary"}
            className={`cursor-pointer border-0 ${activeTag === null ? 'bg-[#2d3134] text-white hover:bg-[#1a1c1e]' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => onSelectTag(null)}
          >
            {t('sidebar.all')}
          </Badge>
          {tagsArray.map(tag => (
            <Badge 
              key={tag}
              variant={activeTag === tag ? "default" : "secondary"}
              className={`cursor-pointer border-0 ${activeTag === tag ? 'bg-[#2d3134] text-white hover:bg-[#1a1c1e]' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => onSelectTag(tag)}
            >
              {tag}
            </Badge>
          ))}
          {tagsArray.length === 0 && (
            <span className="text-sm text-gray-400 italic px-1">{t('sidebar.noTags')}</span>
          )}
        </div>
      </div>
      
    </div>
  );
}
