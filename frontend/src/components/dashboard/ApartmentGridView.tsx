'use client';

import { useRouter } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ExternalLink, Image as ImageIcon, Ruler, DoorOpen, Home, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

const STATUS_COLORS: Record<string, string> = {
  SAVED: 'bg-gray-100 text-gray-700',
  CONTACTED: 'bg-blue-100 text-blue-700',
  APPLIED: 'bg-indigo-100 text-indigo-700',
  VIEWING_SCHEDULED: 'bg-amber-100 text-amber-700',
  WAITING_RESPONSE: 'bg-purple-100 text-purple-700',
  REJECTED: 'bg-red-100 text-red-700',
  ACCEPTED: 'bg-green-100 text-green-700',
};

export function ApartmentGridView({ apartments, onDeleteClick }: { apartments: any[], onDeleteClick: (apt: any) => void }) {
  const router = useRouter();
  const t = useTranslations('Wohnungen');
  const tStatus = useTranslations('Status');

  if (apartments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 italic bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        {t('noApartmentsMatching')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {apartments.map((apt) => (
        <Card 
          key={apt.id}
          onClick={() => router.push({ pathname: '/app/apartments/[id]', params: { id: apt.id } })}
          className="group cursor-pointer overflow-hidden rounded-2xl border-gray-100/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 bg-white"
        >
          {/* Cover Image */}
          <div className="h-40 w-full bg-gray-100 relative overflow-hidden flex items-center justify-center">
            {apt.coverImage ? (
              <img 
                src={apt.coverImage} 
                alt={apt.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            ) : (
              <Home className="w-10 h-10 text-gray-300" />
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="secondary" className={`${STATUS_COLORS[apt.status] || 'bg-white text-gray-700'} border-0 font-medium px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-md`}>
                {tStatus(apt.status) || apt.status}
              </Badge>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {apt.originalListingUrl && (
                <a 
                  href={apt.originalListingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-600 hover:text-primary transition-colors backdrop-blur-md"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(apt);
                }}
                className="w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors backdrop-blur-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <CardContent className="p-5">
            {/* Price & Size Row */}
            <div className="flex justify-between items-end mb-3">
              <div className="font-extrabold text-[#2d3134] text-xl">
                {apt.rentPrice || apt.warmRent ? `€${apt.rentPrice || apt.warmRent}` : t('priceUnknown')}
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                {(apt.squareMeters || apt.sizeSqm) && (
                  <div className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> {apt.squareMeters || apt.sizeSqm} m²</div>
                )}
                {(apt.rooms || apt.roomCount) && (
                  <div className="flex items-center gap-1"><DoorOpen className="w-3.5 h-3.5" /> {apt.rooms || apt.roomCount} {t('roomsSuffix')}</div>
                )}
              </div>
            </div>

            {/* Title */}
            <h4 className="font-semibold text-gray-900 leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">
              {apt.title}
            </h4>

            {/* Location & Date */}
            <div className="space-y-2 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="line-clamp-1">{apt.address || apt.city || t('noLocationSpecified')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{t('moveIn')}: {apt.moveInDate ? new Date(apt.moveInDate).toLocaleDateString() : t('asap')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
