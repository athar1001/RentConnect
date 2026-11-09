'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GripVertical, ChevronUp, ChevronDown, FileText, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MergeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDocs: any[];
  onMerge: (orderedIds: string[], filename: string) => Promise<void>;
  loading: boolean;
}

export function MergeModal({ isOpen, onOpenChange, selectedDocs, onMerge, loading }: MergeModalProps) {
  const t = useTranslations('Documents');
  const [filename, setFilename] = useState('Apartment_Application');
  const [orderedDocs, setOrderedDocs] = useState<any[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Initialize order when modal opens with selectedDocs
  useEffect(() => {
    if (isOpen) {
      setOrderedDocs([...selectedDocs]);
      setFilename('Apartment_Application');
    }
  }, [isOpen, selectedDocs]);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newDocs = [...orderedDocs];
    const temp = newDocs[index];
    newDocs[index] = newDocs[index - 1];
    newDocs[index - 1] = temp;
    setOrderedDocs(newDocs);
  };

  const handleMoveDown = (index: number) => {
    if (index === orderedDocs.length - 1) return;
    const newDocs = [...orderedDocs];
    const temp = newDocs[index];
    newDocs[index] = newDocs[index + 1];
    newDocs[index + 1] = temp;
    setOrderedDocs(newDocs);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newDocs = [...orderedDocs];
    const draggedItem = newDocs[draggedIndex];
    
    // Remove dragged item
    newDocs.splice(draggedIndex, 1);
    // Insert at new position
    newDocs.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setOrderedDocs(newDocs);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderedIds = orderedDocs.map(d => d.id);
    onMerge(orderedIds, filename);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {t('merge.modalTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Document Preview and Reordering */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              {t('merge.modalTitle')} - Order Preview
            </Label>
            
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden bg-gray-50/30">
              {orderedDocs.map((doc, index) => (
                <div
                  key={doc.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-3.5 bg-white transition-all select-none ${
                    draggedIndex === index ? 'opacity-40 bg-gray-50' : 'hover:bg-gray-50/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-0.5 transition-colors shrink-0">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    
                    {/* Badge */}
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    
                    <span className="text-sm font-medium text-gray-700 truncate" title={doc.title}>
                      {doc.title}
                    </span>
                  </div>

                  {/* Reordering Controls */}
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      disabled={index === orderedDocs.length - 1}
                      onClick={() => handleMoveDown(index)}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filename Field */}
          <div className="space-y-2">
            <Label htmlFor="filename" className="text-sm font-semibold text-gray-700">
              {t('merge.filenameLabel')}
            </Label>
            <div className="relative">
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                required
                className="pr-12 rounded-xl"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold select-none">
                .pdf
              </span>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              {t('actionCancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary hover:bg-primary/95 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('merge.actionMerge')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
