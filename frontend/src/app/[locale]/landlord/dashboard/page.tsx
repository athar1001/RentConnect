'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Building2,
  Inbox,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Users,
  CheckCircle2,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandlordDashboardPage() {
  const t = useTranslations('Landlord');
  const [analytics, setAnalytics] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anRes, propRes, appRes] = await Promise.all([
          fetch('http://localhost:3000/landlords/analytics'),
          fetch('http://localhost:3000/landlords/properties'),
          fetch('http://localhost:3000/landlords/applications'),
        ]);

        if (anRes.ok) setAnalytics(await anRes.json());
        if (propRes.ok) setProperties(await propRes.json());
        if (appRes.ok) setApplications(await appRes.json());
      } catch (e) {
        console.error('Failed to load landlord dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/landlord/properties" className="inline-flex">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 text-xs font-semibold shadow-md shadow-emerald-600/20">
              <Plus className="w-4 h-4" />
              {t('properties.addProperty')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('analytics.activeListings')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{analytics?.activeListings || properties.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active for tenant applications
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('analytics.applicationsReceived')}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{analytics?.applicationsReceived || applications.length}</div>
          <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Structured Housing Identities
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('analytics.upcomingViewings')}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{analytics?.upcomingViewings || 2}</div>
          <span className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Scheduled this week
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('analytics.avgResponse')}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{analytics?.averageResponseTimeHours || 6.5}h</div>
          <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            Fast Response Landlord Rate
          </span>
        </div>
      </div>

      {/* Properties & Recent Applications Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Properties Portfolio */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Active Property Portfolio
            </h2>
            <Link href="/landlord/properties" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {properties.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 border border-dashed rounded-2xl">
                No active properties listed yet.
              </div>
            ) : (
              properties.slice(0, 3).map((prop) => (
                <div key={prop.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-gray-900 block">{prop.title}</span>
                    <span className="text-[11px] text-gray-500 block">{prop.address}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 text-xs block">€{prop.rentPrice}</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase">{prop.rooms} Rooms • {prop.squareMeters} m²</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Incoming Applications */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Inbox className="w-4 h-4 text-emerald-600" />
              Recent Applicant Packages
            </h2>
            <Link href="/landlord/applications" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Open Inbox
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {applications.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 border border-dashed rounded-2xl">
                No application packages in inbox.
              </div>
            ) : (
              applications.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-gray-900 block">{app.user?.fullName || 'Applicant'}</span>
                    <span className="text-[11px] text-gray-500 block">{app.apartment?.title}</span>
                  </div>
                  <Link href={`/landlord/applications/${app.id}` as any}>
                    <Button variant="outline" className="border-gray-200 text-xs font-semibold rounded-xl text-gray-700 hover:bg-white">
                      Inspect Profile
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
