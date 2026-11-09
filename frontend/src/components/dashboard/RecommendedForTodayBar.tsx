'use client';

import { Sparkles, AlertTriangle, FileText, Heart, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

export function RecommendedForTodayBar({
  apartments,
  onSelectApartment,
}: {
  apartments: any[];
  onSelectApartment: (apt: any) => void;
}) {
  if (apartments.length === 0) return null;

  // Generate 3-4 intelligent recommendations based on apartment data
  const topMatchApartment = [...apartments]
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))[0];

  const favouriteNoApp = apartments.find(a => a.isFavourite && a.status !== 'APPLIED');
  const missingDocApartment = apartments.find(a => a.matchScore >= 80 && a.status === 'SAVED');

  const recommendations = [
    topMatchApartment && topMatchApartment.matchScore >= 85 ? {
      id: 'top-match',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      badge: `${topMatchApartment.matchScore}% Match`,
      badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      title: topMatchApartment.title || 'Top Match Apartment',
      subtitle: 'No application created yet. Excellent profile compatibility!',
      actionLabel: 'Evaluate & Apply',
      apartment: topMatchApartment,
    } : null,
    favouriteNoApp ? {
      id: 'favourite-no-app',
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      badge: 'Favourite Shortlist',
      badgeStyle: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      title: favouriteNoApp.title,
      subtitle: 'Marked as favourite. Ready to prepare your application package.',
      actionLabel: 'View Shortlist Item',
      apartment: favouriteNoApp,
    } : null,
    missingDocApartment ? {
      id: 'missing-doc',
      icon: <FileText className="w-4 h-4 text-amber-400" />,
      badge: 'Ready for Application',
      badgeStyle: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      title: missingDocApartment.title,
      subtitle: 'High match score. Click to launch application wizard.',
      actionLabel: 'Create Application',
      apartment: missingDocApartment,
    } : null,
    {
      id: 'browser-extension',
      icon: <Clock className="w-4 h-4 text-blue-400" />,
      badge: '1-Click Saver',
      badgeStyle: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      title: 'Import Listings directly from ImmoScout24 & WG-Gesucht',
      subtitle: 'Use the WohnBoard Browser Clipper to keep your shortlist updated.',
      actionLabel: 'Extension Guide',
      link: '/app/onboarding',
    }
  ].filter(Boolean);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold tracking-tight text-white">Recommended for Today</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            Intelligent Search Assistant
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Updated live</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map((rec: any) => (
          <div
            key={rec.id}
            className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl flex flex-col justify-between space-y-3 transition-all hover:bg-slate-950"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${rec.badgeStyle}`}>
                  {rec.badge}
                </span>
                {rec.icon}
              </div>
              <h3 className="text-xs font-bold text-white line-clamp-1">{rec.title}</h3>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{rec.subtitle}</p>
            </div>

            {rec.apartment ? (
              <Button
                onClick={() => onSelectApartment(rec.apartment)}
                className="w-full h-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold gap-1 shadow-sm"
              >
                <span>{rec.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            ) : (
              <Link href={rec.link as any} className="w-full">
                <Button className="w-full h-8 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-bold gap-1 border border-slate-700">
                  <span>{rec.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
