'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Phone, Mail, MessageSquare, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export function LogManager({ apartmentId, initialLogs }: { apartmentId: string, initialLogs: any[] }) {
  const [logs, setLogs] = useState(initialLogs || []);
  const [content, setContent] = useState('');
  const [type, setType] = useState('Note');

  const types = [
    { id: 'Note', icon: <FileText className="w-4 h-4" /> },
    { id: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'Phone', icon: <Phone className="w-4 h-4" /> },
    { id: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const addLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await fetch(`http://localhost:3000/apartments/${apartmentId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content }),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setLogs([data, ...logs]);
        setContent('');
      }
    } catch (e) {
      // Handle error
    }
  };

  const deleteLog = async (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
    try {
      await fetch(`http://localhost:3000/logs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (e) {
      // Handle error
    }
  };

  return (
    <Card className="border-0 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg">Communication Log</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-gray-50 rounded-xl p-3 relative group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <span className="bg-white px-2 py-1 rounded shadow-sm border flex items-center gap-1">
                    {types.find(t => t.id === log.type)?.icon} {log.type}
                  </span>
                  <span>{format(new Date(log.timestamp), 'MMM d, h:mm a')}</span>
                </div>
                <button onClick={() => deleteLog(log.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.content}</p>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center text-sm text-gray-400 mt-10">
              No logs yet. Keep track of your communication here.
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50/50">
          <form onSubmit={addLog} className="space-y-3">
            <div className="flex gap-2">
              {types.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${type === t.id ? 'bg-primary text-white' : 'bg-white text-gray-600 border shadow-sm hover:bg-gray-50'}`}
                >
                  {t.icon} <span className="hidden sm:inline">{t.id}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Log a call, email, or note..."
                className="w-full h-20 resize-none rounded-xl border-gray-200 focus:border-primary focus:ring-primary shadow-sm text-sm p-3 pr-12"
              />
              <Button type="submit" size="icon" className="absolute bottom-3 right-3 h-8 w-8 rounded-lg shadow-sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
