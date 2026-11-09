'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { isFuture, isToday } from 'date-fns';
import { toast } from 'sonner';
import {
  Building2,
  Inbox,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  TrendingUp,
  FileText,
  ShieldCheck,
  Send,
  Sliders,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppDashboardPage() {
  const t = useTranslations('Dashboard');
  const tStatus = useTranslations('Status');
  const router = useRouter();

  const [apartments, setApartments] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [aptRes, remRes, docRes] = await Promise.all([
        fetch('http://localhost:3000/apartments', { credentials: 'include' }),
        fetch('http://localhost:3000/reminders', { credentials: 'include' }),
        fetch('http://localhost:3000/documents', { credentials: 'include' })
      ]);

      if (aptRes.ok) setApartments(await aptRes.json());
      if (remRes.ok) setReminders(await remRes.json());
      if (docRes.ok) setDocuments(await docRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pendingUrl = localStorage.getItem('pending_import_url');
    if (pendingUrl) {
      localStorage.removeItem('pending_import_url');

      const importApartment = async () => {
        toast.loading('Importing apartment listing...', { id: 'pending-import' });
        try {
          const res = await fetch('http://localhost:3000/apartments/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: pendingUrl }),
            credentials: 'include',
          });

          if (res.ok) {
            const apartment = await res.json();
            toast.success('Apartment imported successfully!', { id: 'pending-import' });
            router.push({ pathname: '/app/apartments/[id]', params: { id: apartment.id } });
          } else {
            toast.error('Failed to import listing automatically. Opening manual form...', { id: 'pending-import' });
            router.push({ pathname: '/app/apartments', query: { openAddModal: 'true', failedUrl: pendingUrl } });
          }
        } catch (error) {
          toast.error('An error occurred during import. Opening manual form...', { id: 'pending-import' });
          router.push({ pathname: '/app/apartments', query: { openAddModal: 'true', failedUrl: pendingUrl } });
        }
      };

      importApartment();
    } else {
      fetchDashboardData();
    }
  }, []);

  const stats = {
    total: apartments.length,
    saved: apartments.filter(a => a.status === 'SAVED').length,
    applied: apartments.filter(a => a.status === 'APPLIED').length,
    viewings: apartments.filter(a => a.status === 'VIEWING_SCHEDULED').length,
    pending: apartments.filter(a => a.status === 'WAITING_RESPONSE').length,
    rejected: apartments.filter(a => a.status === 'REJECTED' || a.status === 'OFFER_DECLINED').length,
  };

  const upcomingReminders = reminders
    .filter(r => {
      const d = new Date(r.dateTime);
      return isToday(d) || isFuture(d);
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 4);

  const recentDocuments = documents
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const renderKanbanCard = (
    label: string,
    count: number,
    href: { pathname: '/app/apartments'; query: { status: string } },
    badgeBg: string,
    badgeText: string
  ) => {
    const isClickable = count > 0;
    const content = (
      <div className={`p-4 rounded-2xl border transition-all ${isClickable ? 'bg-gray-50/70 border-gray-100 hover:bg-white hover:shadow-sm cursor-pointer' : 'bg-gray-50/40 border-gray-100 opacity-60'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeBg} ${badgeText} uppercase`}>
            {label}
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <div className="text-2xl font-extrabold text-gray-900">{count}</div>
      </div>
    );

    if (isClickable) {
      return (
        <Link key={label} href={href} className="block">
          {content}
        </Link>
      );
    }
    return <div key={label}>{content}</div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-6xl animate-in fade-in duration-300">
      {/* Guided First-Time Dashboard Banner (0 Saved Apartments) */}
      {apartments.length === 0 && (
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white p-8 rounded-3xl border border-emerald-800 shadow-xl space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Onboarding Milestone</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Ready to Find Your Next Apartment?</h2>
              <p className="text-xs text-slate-300 max-w-xl font-medium">
                Open your favorite apartment website (ImmoScout24, WG-Gesucht), save listings with the WohnBoard Browser Extension, and manage everything from one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href={"/app/onboarding" as any}>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 gap-2">
                  <ShieldCheck className="w-4 h-4" /> Complete Onboarding
                </Button>
              </Link>
              <Link href={"/app/apartments" as any}>
                <Button variant="outline" className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold">
                  Add Apartment Manually
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Banner (First Apartment Saved) */}
      {apartments.length === 1 && (
        <div className="bg-emerald-950/60 border border-emerald-800 p-6 rounded-3xl text-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-base font-bold flex items-center gap-2">
              🎉 Great! You saved your first apartment.
            </h3>
            <p className="text-xs text-emerald-300">What would you like to do next with this listing?</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href={{ pathname: '/app/apartments/[id]/apply', params: { id: apartments[0].id } }}>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold">
                Prepare Application
              </Button>
            </Link>
            <Link href={{ pathname: '/app/apartments/[id]', params: { id: apartments[0].id } }}>
              <Button variant="outline" className="border-emerald-800 bg-emerald-900/50 text-emerald-200 rounded-xl text-xs font-bold">
                View Workspace
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Header Banner Card (Landlord Dashboard Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Track active apartment applications, manage reusable document packages, and monitor landlord responses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={"/app/onboarding" as any}>
            <Button variant="outline" className="border-gray-200 text-xs font-semibold rounded-xl text-gray-700 hover:bg-gray-50">
              <Sparkles className="w-4 h-4 mr-1.5 text-emerald-600" />
              Onboarding
            </Button>
          </Link>
          <Link href="/app/apartments">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 text-xs font-semibold shadow-md shadow-emerald-600/20">
              <Plus className="w-4 h-4" />
              Add Apartment
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards (Landlord Dashboard Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('stats.saved')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.total}</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Target Listings Saved
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('stats.applied')}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.applied}</div>
          <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> WohnBoard Applications
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('stats.viewings')}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.viewings}</div>
          <span className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Scheduled Invitations
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('stats.pending')}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.pending}</div>
          <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            Awaiting Landlord Reply
          </span>
        </div>
      </div>

      {/* Application Status Pipeline Overview */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Application Status Overview
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {renderKanbanCard(tStatus('SAVED'), stats.saved, { pathname: '/app/apartments', query: { status: 'SAVED' } }, 'bg-emerald-100', 'text-emerald-800')}
          {renderKanbanCard(tStatus('APPLIED'), stats.applied, { pathname: '/app/apartments', query: { status: 'APPLIED' } }, 'bg-blue-100', 'text-blue-800')}
          {renderKanbanCard(tStatus('VIEWING_SCHEDULED'), stats.viewings, { pathname: '/app/apartments', query: { status: 'VIEWING_SCHEDULED' } }, 'bg-purple-100', 'text-purple-800')}
          {renderKanbanCard(tStatus('WAITING_RESPONSE'), stats.pending, { pathname: '/app/apartments', query: { status: 'WAITING_RESPONSE' } }, 'bg-amber-100', 'text-amber-800')}
          {renderKanbanCard(tStatus('REJECTED'), stats.rejected, { pathname: '/app/apartments', query: { status: 'REJECTED' } }, 'bg-rose-100', 'text-rose-800')}
        </div>
      </div>

      {/* Reminders & Document Package Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Reminders & Appointments */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              {t('reminders.title')}
            </h2>
            <Link href="/app/reminders" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              {t('reminders.all')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 border border-dashed rounded-2xl">
                {t('reminders.none')}
              </div>
            ) : (
              upcomingReminders.map((r) => (
                <Link key={r.id} href="/app/reminders" className="block">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors">
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-gray-900 block">{r.title}</span>
                      <span className="text-[11px] text-gray-500 block">{r.apartment?.title || t('reminders.general')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 block">
                        {new Date(r.dateTime).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(r.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Verified Document Vault */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              {t('documents.title')}
            </h2>
            <Link href="/app/documents" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              {t('documents.all')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentDocuments.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 border border-dashed rounded-2xl">
                {t('documents.none')}
              </div>
            ) : (
              recentDocuments.map((doc) => (
                <Link key={doc.id} href="/app/documents" className="block">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-emerald-600 font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <span className="font-bold text-xs text-gray-900 block">{doc.title}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">{doc.type}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                      <FileCheck className="w-3 h-3" /> Ready to Share
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
