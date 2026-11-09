'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ExternalLink, AlertCircle, Clock } from 'lucide-react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

const STATUSES = [
  'SAVED',
  'CONTACTED',
  'APPLIED',
  'VIEWING_SCHEDULED',
  'WAITING_RESPONSE',
  'REJECTED',
  'ACCEPTED',
];

const STATUS_LABELS: Record<string, string> = {
  SAVED: 'Gespeichert',
  CONTACTED: 'Kontaktiert',
  APPLIED: 'Bewerbung',
  VIEWING_SCHEDULED: 'Besichtigung',
  WAITING_RESPONSE: 'Warten',
  REJECTED: 'Abgelehnt',
  ACCEPTED: 'Zusage',
};

// Pastel column backgrounds based on the mockup
const COLUMN_COLORS: Record<string, string> = {
  SAVED: 'bg-[#F8F9FA]',
  CONTACTED: 'bg-[#F8F9FA]',
  APPLIED: 'bg-[#F0F7FF]',
  VIEWING_SCHEDULED: 'bg-[#F2FBF5]',
  WAITING_RESPONSE: 'bg-[#FFF8F2]',
  REJECTED: 'bg-[#FFF5F5]',
  ACCEPTED: 'bg-[#F2FBF5]',
};

// Text colors for column headers
const COLUMN_TEXT_COLORS: Record<string, string> = {
  SAVED: 'text-gray-700',
  CONTACTED: 'text-gray-700',
  APPLIED: 'text-[#0066CC]',
  VIEWING_SCHEDULED: 'text-[#2d3134]',
  WAITING_RESPONSE: 'text-[#8B5A2B]',
  REJECTED: 'text-[#DC2626]',
  ACCEPTED: 'text-[#2d3134]',
};

// Pill bg & text colors for headers
const STATUS_PILL_COLORS: Record<string, string> = {
  SAVED: 'bg-gray-100 text-gray-700 hover:bg-gray-200/80',
  CONTACTED: 'bg-gray-100 text-gray-700 hover:bg-gray-200/80',
  APPLIED: 'bg-blue-100 text-[#0066CC] hover:bg-blue-200/80',
  VIEWING_SCHEDULED: 'bg-gray-100 text-[#2d3134] hover:bg-gray-200/80',
  WAITING_RESPONSE: 'bg-orange-100 text-[#8B5A2B] hover:bg-orange-200/80',
  REJECTED: 'bg-red-100 text-red-700 hover:bg-red-200/80',
  ACCEPTED: 'bg-gray-100 text-[#2d3134] hover:bg-gray-200/80',
};

// --- Sortable Item Component ---
function SortableApartmentCard({ apartment }: { apartment: any }) {
  const router = useRouter();
  const t = useTranslations('Kanban');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: apartment.id, data: { status: apartment.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Mock Urgent Logic
  const isViewingSoon = apartment.status === 'VIEWING_SCHEDULED';
  const needsReply = apartment.status === 'WAITING_RESPONSE';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 cursor-grab active:cursor-grabbing touch-none">
      <Card 
        onClick={() => router.push({ pathname: '/app/apartments/[id]', params: { id: apartment.id } })}
        className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-gray-100 overflow-hidden group cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl"
      >
        {apartment.coverImage && (
          <div className="h-28 w-full bg-gray-100 relative overflow-hidden">
            <img src={apartment.coverImage} alt={apartment.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            
            {/* Urgent Badges */}
            {isViewingSoon && (
              <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600 border-0 flex items-center gap-1 shadow-sm">
                <Clock className="w-3 h-3" /> {t('card.soon')}
              </Badge>
            )}
            {needsReply && (
              <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600 border-0 flex items-center gap-1 shadow-sm">
                <AlertCircle className="w-3 h-3" /> {t('card.reply')}
              </Badge>
            )}
          </div>
        )}
        
        <CardContent className="p-3">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">{apartment.title}</h4>
          {apartment.rentPrice && (
            <div className="font-bold text-[#2d3134] mb-2">€{apartment.rentPrice}</div>
          )}
          <div className="flex items-center text-xs text-gray-500 gap-1 mt-3">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="truncate">{apartment.address || apartment.city || t('card.noAddress')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Droppable Column Component ---
function KanbanColumn({ id, title, items, onHeaderClick }: { id: string; title: string; items: any[]; onHeaderClick: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const t = useTranslations('Kanban');

  return (
    <div className={`flex flex-col min-w-[280px] w-[280px] ${COLUMN_COLORS[id] || 'bg-gray-50'} rounded-2xl p-4 shrink-0 h-[calc(100vh-16rem)] overflow-hidden transition-colors border border-transparent ${isOver ? 'border-[#2d3134]/20 ring-2 ring-[#2d3134]/10' : ''}`}>
      <div 
        onClick={onHeaderClick}
        className="flex items-center justify-between mb-4 px-1 cursor-pointer select-none group"
      >
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all ${STATUS_PILL_COLORS[id] || 'bg-gray-100 text-gray-700'}`}>
          {title}
        </span>
        <Badge variant="secondary" className="bg-white/60 text-gray-600 font-bold border-0 shadow-sm transition-transform group-hover:scale-105">{items.length}</Badge>
      </div>
      
      <div 
        ref={setNodeRef} 
        className="flex-1 overflow-y-auto no-scrollbar pb-10"
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableApartmentCard key={item.id} apartment={item} />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center text-sm text-gray-400 text-center p-4 border-2 border-dashed border-gray-200/50 rounded-xl mt-2">
            <span className="mb-1">{t('noApartments')}</span>
            <span className="text-xs opacity-70">{t('dragHere')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Board Component ---
export function KanbanBoard({ apartments, onStatusUpdate }: { apartments: any[]; onStatusUpdate: (id: string, status: string) => void }) {
  const t = useTranslations('Kanban');
  const [columnOrder, setColumnOrder] = useState<string[]>(STATUSES);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const apartmentId = active.id as string;
    const activeData = active.data.current as { status: string };
    
    // Check if we dropped on a column or a card
    let newStatus = over.id as string;
    if (!STATUSES.includes(newStatus)) {
       // We dropped on another card, find its column
       const overCard = apartments.find(a => a.id === over.id);
       if (overCard) newStatus = overCard.status;
    }

    if (newStatus && STATUSES.includes(newStatus) && activeData.status !== newStatus) {
      onStatusUpdate(apartmentId, newStatus);
    }
  };

  const handleHeaderClick = (status: string) => {
    setColumnOrder((prev) => {
      const filtered = prev.filter((s) => s !== status);
      return [status, ...filtered];
    });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Clickable Status Pills above the board */}
      <div className="flex gap-2 overflow-x-auto pb-2 select-none no-scrollbar items-center shrink-0">
        <span className="text-xs font-semibold text-gray-400 mr-1 shrink-0">{t('quickJump')}</span>
        {STATUSES.map((status) => {
          const count = apartments.filter((a) => a.status === status).length;
          const isActive = columnOrder[0] === status;
          return (
            <button
              key={status}
              onClick={() => handleHeaderClick(status)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 shadow-sm ${
                isActive
                  ? 'border-[#2d3134] bg-[#2d3134] text-white scale-105'
                  : `border-gray-200/80 ${STATUS_PILL_COLORS[status] || 'bg-gray-100 text-gray-700'}`
              }`}
            >
              <span>{t('columns.' + status)}</span>
              <span className={`inline-flex items-center justify-center rounded-full text-[10px] w-5 h-5 font-bold transition-colors ${
                isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-8 pt-2 items-start w-full snap-x"
        >
          {columnOrder.map((status) => {
            const columnItems = apartments.filter((a) => a.status === status);
            return (
              <div key={status} className="snap-start animate-in fade-in slide-in-from-left-4 duration-300">
                <KanbanColumn 
                  id={status} 
                  title={t('columns.' + status)} 
                  items={columnItems} 
                  onHeaderClick={() => handleHeaderClick(status)} 
                />
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
