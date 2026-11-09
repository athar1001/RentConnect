import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, MapPin, Building2, ExternalLinkIcon, Clock, MessageSquare, Trash2 } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const STATUS_COLORS: Record<string, string> = {
  SAVED: 'bg-gray-100 text-gray-700',
  CONTACTED: 'bg-gray-100 text-gray-700',
  APPLIED: 'bg-blue-100 text-[#0066CC]',
  VIEWING_SCHEDULED: 'bg-gray-100 text-[#2d3134]',
  WAITING_RESPONSE: 'bg-orange-100 text-[#8B5A2B]',
  REJECTED: 'bg-red-100 text-[#DC2626]',
  ACCEPTED: 'bg-gray-100 text-[#2d3134]',
};

export function ApartmentHeader({ apartment, onDelete, onAddReminder }: { apartment: any, onDelete: () => void, onAddReminder: () => void }) {
  const router = useRouter();
  const t = useTranslations('ApartmentDetail');
  const tStatus = useTranslations('Status');

  return (
    <div className="sticky top-0 z-20 bg-[#FAF9F6]/90 backdrop-blur-md pb-4 pt-2 -mx-8 px-8 border-b border-gray-200/50 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        
        {/* Left: Info */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full mt-1 shrink-0 bg-white shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{apartment.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <Badge variant="secondary" className={`${STATUS_COLORS[apartment.status] || 'bg-gray-100'} border-0 font-medium px-2.5 py-0.5 rounded-md`}>
                {tStatus(apartment.status)}
              </Badge>
              
              {apartment.rentPrice && (
                <span className="font-bold text-gray-900">€{apartment.rentPrice}</span>
              )}
              
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                {apartment.address || apartment.city || t('header.noAddress')}
              </span>
              
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4 text-gray-400" />
                {apartment.rooms ? t('header.rooms', { rooms: apartment.rooms }) : ''} {apartment.squareMeters ? `• ${apartment.squareMeters} m²` : ''}
              </span>

              {apartment.sourcePlatform && (
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                  <ExternalLinkIcon className="w-3 h-3" />
                  {apartment.sourcePlatform}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hidden md:flex items-center gap-2 rounded-xl h-10 shadow-sm" onClick={onAddReminder}>
            <Clock className="w-4 h-4" /> {t('header.actionReminder')}
          </Button>
          <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hidden md:flex items-center gap-2 rounded-xl h-10 shadow-sm" onClick={() => {
            document.getElementById('personal-notes-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}>
            <MessageSquare className="w-4 h-4" /> {t('header.actionNote')}
          </Button>
          
          {apartment.originalListingUrl && (
            <a href={apartment.originalListingUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="bg-white border-gray-200 text-[#2d3134] hidden md:flex items-center gap-2 rounded-xl h-10 shadow-sm hover:text-[#1e2123] hover:bg-gray-50">
                {t('header.actionOpenListing')} <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
          
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-10 w-10">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>

      </div>
    </div>
  );
}
