'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ChecklistManager({ apartmentId, initialItems }: { apartmentId: string, initialItems: any[] }) {
  const t = useTranslations('ApartmentDetail');
  const [items, setItems] = useState(initialItems || []);
  const [newItem, setNewItem] = useState('');

  const toggleItem = async (id: string, currentStatus: boolean) => {
    // Optimistic
    setItems(items.map(i => i.id === id ? { ...i, completed: !currentStatus } : i));
    try {
      await fetch(`http://localhost:3000/checklist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus }),
        credentials: 'include',
      });
    } catch (e) {
      // Handle error
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const res = await fetch(`http://localhost:3000/apartments/${apartmentId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newItem, isCustom: true }),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setItems([...items, data]);
        setNewItem('');
      }
    } catch (e) {
      // Handle error
    }
  };

  const deleteItem = async (id: string) => {
    setItems(items.filter(i => i.id !== id));
    try {
      await fetch(`http://localhost:3000/checklist/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (e) {
      // Handle error
    }
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('checklist.title')}</CardTitle>
          <span className="text-sm font-medium text-primary">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between group">
              <button 
                onClick={() => toggleItem(item.id, item.completed)}
                className="flex items-center gap-3 text-left"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                )}
                <span className={`text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {item.title}
                </span>
              </button>
              {item.isCustom && (
                <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <form onSubmit={addItem} className="flex items-center gap-2">
          <Input 
            value={newItem} 
            onChange={(e) => setNewItem(e.target.value)} 
            placeholder={t('checklist.placeholderNewItem')}
            className="h-9 text-sm"
          />
          <Button type="submit" size="icon" className="h-9 w-9 shrink-0 rounded-lg">
            <Plus className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
