'use client';

import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

export function SocialProof() {
  const t = useTranslations('HomePage');

  const items = [
    t('SocialProof.card1'),
    t('SocialProof.card2'),
    t('SocialProof.card3'),
    t('SocialProof.card4'),
  ];

  return (
    <section className="py-16 bg-gray-50/30 border-b border-gray-100">
      <div className="container mx-auto px-4 text-center max-w-6xl">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
          {t('SocialProof.title')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300"
            >
              {/* Checkmark icon box */}
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold text-gray-700 text-left leading-snug">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
