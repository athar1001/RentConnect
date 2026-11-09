'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileText, Pin, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { NotesSidebar } from '@/components/notes/NotesSidebar';
import { NoteEditor } from '@/components/notes/NoteEditor';

export default function NotesPage() {
  const t = useTranslations('Notes');
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  // State for Editor
  const [activeNote, setActiveNote] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // State for View
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/notes', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      } else {
        toast.error(t('toast.loadFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSaveNote = async (noteData: any) => {
    try {
      const url = noteData.id ? `http://localhost:3000/notes/${noteData.id}` : 'http://localhost:3000/notes';
      const method = noteData.id ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
        credentials: 'include',
      });

      if (res.ok) {
        await fetchNotes();
        const savedNote = await res.json();
        // Keep editor open with the saved note
        setActiveNote(savedNote);
        toast.success(t('toast.saveSuccess'));
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      toast.error(t('toast.saveFailed'));
      throw err;
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/notes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('toast.deleteSuccess'));
        await fetchNotes();
        setIsEditorOpen(false);
        setActiveNote(null);
      } else {
        toast.error(t('toast.deleteFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    }
  };

  const handleApplyTemplate = (title: string, content: string) => {
    setActiveNote({ title, content, tags: '', isPinned: false });
    setIsEditorOpen(true);
  };

  const handleCreateNew = () => {
    setActiveNote(null);
    setIsEditorOpen(true);
  };

  const handleOpenNote = (note: any) => {
    setActiveNote(note);
    setIsEditorOpen(true);
  };

  // Filtering
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = activeTag 
      ? note.tags?.split(',').map((t: string) => t.trim()).includes(activeTag)
      : true;
      
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex flex-col h-full space-y-6 max-w-[1400px]">
      
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 mb-1">{t('title')}</h1>
          <p className="text-gray-500 font-medium">{t('subtitle')}</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-[#2d3134] hover:bg-[#1a1c1e] text-white rounded-xl h-10 px-5 gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> {t('actionNew')}
        </Button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-[600px] h-[calc(100vh-200px)]">
        
        {/* Left Sidebar */}
        <NotesSidebar 
          notes={notes} 
          activeTag={activeTag} 
          onSelectTag={setActiveTag} 
          onApplyTemplate={handleApplyTemplate}
          onSelectNote={handleOpenNote}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {isEditorOpen ? (
            <NoteEditor 
              note={activeNote} 
              onClose={() => setIsEditorOpen(false)} 
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
            />
          ) : (
            <div className="flex flex-col h-full">
              
              {/* Toolbar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-2 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-4">
                <div className="relative flex-1 max-w-md px-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder={t('toolbar.searchPlaceholder')} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 border-0 bg-gray-50/50 rounded-xl focus-visible:ring-1 focus-visible:ring-gray-200"
                  />
                </div>
                <div className="flex bg-gray-100/50 p-1 rounded-xl w-fit shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#2d3134] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <LayoutGrid className="w-4 h-4" /> {t('toolbar.grid')}
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#2d3134] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <List className="w-4 h-4" /> {t('toolbar.list')}
                  </button>
                </div>
              </div>

              {/* Notes Grid/List */}
              <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3134]"></div>
                  </div>
                ) : filteredNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 mb-2">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{t('empty.title')}</h2>
                    <p className="text-gray-500">{t('empty.subtitle')}</p>
                    <Button onClick={handleCreateNew} className="bg-[#2d3134] hover:bg-[#1a1c1e] text-white mt-2">
                      {t('empty.actionCreate')}
                    </Button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-4'}>
                    {filteredNotes.map(note => (
                      <Card 
                        key={note.id} 
                        onClick={() => handleOpenNote(note)}
                        className="cursor-pointer group hover:shadow-md transition-all border-gray-100 hover:border-gray-200 bg-white"
                      >
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-[#2d3134] transition-colors">{note.title}</h3>
                            {note.isPinned && <Pin className="w-4 h-4 text-amber-500 shrink-0" />}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                            {note.content}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span className="truncate max-w-[150px]">{note.tags}</span>
                            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
