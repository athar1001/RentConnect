'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import {
  Inbox,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Building2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandlordApplicationsPage() {
  const t = useTranslations('Landlord');
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchApplications = async () => {
    try {
      const url = `http://localhost:3000/landlords/applications?status=${selectedStatus}`;
      const res = await fetch(url);
      if (res.ok) setApplications(await res.json());
    } catch (e) {
      console.error('Failed to load applications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert('You can select up to 4 candidates for side-by-side comparison.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompare = () => {
    if (selectedIds.length === 0) return;
    router.push(`/landlord/compare?ids=${selectedIds.join(',')}` as any);
  };

  const filtered = applications.filter((app) =>
    app.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    app.apartment?.title?.toLowerCase().includes(search.toLowerCase()) ||
    app.referenceNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('applications.title')}</h1>
          <p className="text-xs text-gray-500 mt-1">{t('applications.subtitle')}</p>
        </div>

        {selectedIds.length > 0 && (
          <Button
            onClick={handleCompare}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 text-xs font-semibold shadow-md shadow-emerald-600/20"
          >
            <Users className="w-4 h-4" />
            {t('applications.compareSelected')} ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['ALL', 'SENT', 'OPENED', 'DOCUMENTS_VIEWED', 'VIEWING_SCHEDULED', 'ACCEPTED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400 ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by applicant name, apartment title, or reference number..."
            className="w-full text-xs py-1 border-none focus:outline-none"
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-500 font-medium">No application packages found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const isSelected = selectedIds.includes(app.id);
            const identity = app.user?.housingIdentity;

            return (
              <div
                key={app.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isSelected ? 'border-emerald-500 bg-emerald-50/10 shadow-md' : 'border-gray-100 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(app.id)}
                    className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-sm text-gray-900">{app.user?.fullName || 'Applicant Candidate'}</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {app.status}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">{app.referenceNumber}</span>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {app.apartment?.title}
                      </span>
                      <span>Net Income: <strong className="text-emerald-600">€{identity?.employmentInfo?.monthlyNetIncome || '3,800'}</strong></span>
                      <span>Move-in: <strong className="text-gray-700">Immediate</strong></span>
                      <span>Docs: <strong className="text-gray-700">{app.documents?.length || 0} PDFs</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end shrink-0">
                  <Link href={`/landlord/applications/${app.id}` as any}>
                    <Button variant="outline" className="border-gray-200 text-xs font-semibold rounded-xl hover:bg-gray-50 gap-1.5">
                      Inspect Profile
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
