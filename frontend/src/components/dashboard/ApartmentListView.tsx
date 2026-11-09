'use client';

import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ExternalLink, Image as ImageIcon, Trash2 } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  SAVED: 'bg-gray-100 text-gray-700',
  CONTACTED: 'bg-blue-100 text-blue-700',
  APPLIED: 'bg-indigo-100 text-indigo-700',
  VIEWING_SCHEDULED: 'bg-amber-100 text-amber-700',
  WAITING_RESPONSE: 'bg-purple-100 text-purple-700',
  REJECTED: 'bg-red-100 text-red-700',
  ACCEPTED: 'bg-green-100 text-green-700',
};

export function ApartmentListView({ apartments, onDeleteClick }: { apartments: any[], onDeleteClick: (apt: any) => void }) {
  const router = useRouter();
  const t = useTranslations('Wohnungen');
  const tStatus = useTranslations('Status');

  if (apartments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 italic bg-white rounded-2xl shadow-sm border border-gray-100">
        {t('noApartments')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-100 bg-white">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 rounded-tl-2xl">{t('tableApartment')}</th>
            <th className="px-6 py-4">{t('tableLocation')}</th>
            <th className="px-6 py-4">{t('tableRent')}</th>
            <th className="px-6 py-4">{t('tableStatus')}</th>
            <th className="px-6 py-4 rounded-tr-2xl text-right">{t('tableActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {apartments.map((apt) => (
            <tr 
              key={apt.id} 
              onClick={() => router.push({ pathname: '/app/apartments/[id]', params: { id: apt.id } })}
              className="hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {apt.coverImage ? (
                      <img src={apt.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 line-clamp-1 max-w-[300px]">{apt.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {apt.moveInDate ? new Date(apt.moveInDate).toLocaleDateString() : t('asap')}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="line-clamp-1 max-w-[200px]">{apt.city || apt.address || t('unknownLocation')}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="font-semibold text-gray-900">
                  {apt.rentPrice || apt.warmRent ? `€${apt.rentPrice || apt.warmRent}` : '—'}
                </span>
              </td>
              <td className="px-6 py-4">
                <Badge variant="secondary" className={`${STATUS_COLORS[apt.status] || 'bg-gray-100'} border-0 font-medium px-2.5 py-1 rounded-lg whitespace-nowrap`}>
                  {tStatus(apt.status) || apt.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {apt.originalListingUrl && (
                    <a 
                      href={apt.originalListingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(apt);
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
