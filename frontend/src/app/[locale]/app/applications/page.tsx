'use client';

import { useState, useEffect, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ActionRequiredBar } from '@/components/applications/ActionRequiredBar';
import { ApplicationSummaryMetrics } from '@/components/applications/ApplicationSummaryMetrics';
import { ApplicationWorkspaceModal } from '@/components/applications/ApplicationWorkspaceModal';
import {
  FileText,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Inbox,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  Archive,
  Trash2,
  MapPin,
  Euro,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

function ApplicationsPageContent() {
  const t = useTranslations('Applications');

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('Recently Updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Bulk Actions Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/applications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // Enrich data with mock lifecycle items if needed
        setApplications(data);
      }
    } catch (e) {
      console.error('Failed to load applications data:', e);
    } fontally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-50 text-gray-600 border-gray-200',
      PREPARED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      SENT: 'bg-blue-50 text-blue-700 border-blue-200',
      DELIVERED: 'bg-sky-50 text-sky-700 border-sky-200',
      OPENED: 'bg-purple-50 text-purple-700 border-purple-200',
      DOCUMENTS_VIEWED: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      ADDITIONAL_DOCUMENTS_REQUESTED: 'bg-amber-50 text-amber-800 border-amber-300 font-bold animate-pulse',
      VIEWING_SCHEDULED: 'bg-purple-50 text-purple-700 border-purple-200 font-bold',
      VIEWING_COMPLETED: 'bg-teal-50 text-teal-700 border-teal-200',
      WAITING: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      ACCEPTED: 'bg-emerald-600 text-white border-emerald-600 font-bold',
      REJECTED: 'bg-red-50 text-red-700 border-red-200',
      WITHDRAWN: 'bg-rose-50 text-rose-600 border-rose-200 line-through',
      ARCHIVED: 'bg-stone-50 text-stone-600 border-stone-200',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${styles[status] || 'bg-gray-100'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  // Bulk actions handlers
  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkArchive = () => {
    setApplications(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, status: 'ARCHIVED' } : a));
    toast.success(`Archived ${selectedIds.length} applications.`);
    setSelectedIds([]);
  };

  // Filter & Sort Logic
  const filteredApplications = applications.filter(app => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      app.referenceNumber?.toLowerCase().includes(q) ||
      app.apartment?.title?.toLowerCase().includes(q) ||
      app.apartment?.address?.toLowerCase().includes(q) ||
      app.apartment?.city?.toLowerCase().includes(q);

    const isActionRequired =
      app.status === 'ADDITIONAL_DOCUMENTS_REQUESTED' ||
      app.status === 'VIEWING_SCHEDULED' ||
      app.documentRequests?.some((r: any) => !r.isFulfilled) ||
      app.offers?.some((o: any) => o.status === 'SENT');

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTION_REQUIRED' && isActionRequired) ||
      app.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortOrder === 'Recently Updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortOrder === 'Submission Date') return new Date(b.appliedAt || b.createdAt).getTime() - new Date(a.appliedAt || a.createdAt).getTime();
    return 0;
  });

  // Calculate Metrics
  const totalApplications = applications.length;
  const actionRequiredCount = applications.filter(a =>
    a.status === 'ADDITIONAL_DOCUMENTS_REQUESTED' ||
    a.status === 'VIEWING_SCHEDULED' ||
    a.documentRequests?.some((r: any) => !r.isFulfilled) ||
    a.offers?.some((o: any) => o.status === 'SENT')
  ).length;
  const waitingCount = applications.filter(a => a.status === 'SENT' || a.status === 'OPENED' || a.status === 'WAITING').length;
  const viewingsCount = applications.filter(a => a.status === 'VIEWING_SCHEDULED' || a.viewings?.length > 0).length;
  const offersCount = applications.filter(a => a.offers?.some((o: any) => o.status === 'SENT')).length;

  return (
    <div className="space-y-8 pb-16 max-w-[1400px] animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Application Lifecycle Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Applications Workspace</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Track submission progress, fulfill document requests, confirm viewings, and respond to lease offers from landlords.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={"/app/apartments" as any}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl gap-2 text-xs font-bold shadow-md shadow-emerald-600/20">
              <span>Browse Saved Apartments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Required Assistant Bar */}
      <ActionRequiredBar
        applications={applications}
        onOpenWorkspace={(app) => setSelectedApplication(app)}
      />

      {/* Summary Metrics Cards */}
      <ApplicationSummaryMetrics
        totalApplications={totalApplications}
        actionRequiredCount={actionRequiredCount}
        waitingCount={waitingCount}
        viewingsCount={viewingsCount}
        offersCount={offersCount}
      />

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, reference #, address, city, or landlord..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-11 border border-gray-200 text-xs rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTION_REQUIRED">⚠️ Action Required Only</option>
              <option value="DRAFT">Draft Applications</option>
              <option value="SENT">Submitted / Sent</option>
              <option value="OPENED">Under Review by Landlord</option>
              <option value="ADDITIONAL_DOCUMENTS_REQUESTED">Document Requested</option>
              <option value="VIEWING_SCHEDULED">Viewing Scheduled</option>
              <option value="ACCEPTED">Accepted Lease</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-emerald-50 text-emerald-800 font-bold focus:outline-none"
            >
              <option value="Recently Updated">Sort by: Recently Updated</option>
              <option value="Submission Date">Sort by: Submission Date</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
            <span className="text-xs font-bold text-slate-200">
              {selectedIds.length} applications selected
            </span>

            <div className="flex items-center gap-2">
              <Button onClick={handleBulkArchive} size="sm" className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl gap-1.5 border border-slate-700">
                <Archive className="w-3.5 h-3.5" /> Archive Selected
              </Button>
              <Button onClick={() => setSelectedIds([])} size="sm" variant="ghost" className="text-slate-400 hover:text-white text-xs">
                Deselect All
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Applications Stream */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          <span className="text-xs text-gray-500 font-medium">Loading application workspace...</span>
        </div>
      ) : filteredApplications.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-6 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-md">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">No applications yet</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              When you decide to apply for a saved apartment from your shortlist, your applications and landlord updates will appear here.
            </p>
          </div>
          <Link href={"/app/apartments" as any}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold gap-2 px-6 py-3">
              <span>Browse Saved Apartments</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        /* Applications Cards Display */
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredApplications.map((app) => {
            const isSelected = selectedIds.includes(app.id);
            return (
              <Card
                key={app.id}
                onClick={() => setSelectedApplication(app)}
                className={`group cursor-pointer overflow-hidden rounded-3xl border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white relative ${
                  isSelected ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
                }`}
              >
                {/* Select Checkbox */}
                <button
                  onClick={(e) => toggleSelectOne(app.id, e)}
                  className="absolute top-3 left-3 z-10 w-7 h-7 rounded-xl bg-white/90 shadow-sm flex items-center justify-center text-gray-600 hover:text-emerald-600 transition-colors backdrop-blur-md"
                >
                  {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                </button>

                <CardContent className="p-6 space-y-4">
                  {/* Top Ref & Status Row */}
                  <div className="flex items-center justify-between pl-8">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                      {app.referenceNumber}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>

                  {/* Apartment Title & Location */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {app.apartment?.title || 'Berlin Mitte Apartment'}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="line-clamp-1">{app.apartment?.address || app.apartment?.city || 'Berlin, Germany'}</span>
                    </p>
                  </div>

                  {/* Activity Summary Box */}
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                      <span>Submitted Date</span>
                      <span>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Draft'}</span>
                    </div>
                    <div className="font-semibold text-gray-800 text-[11px] line-clamp-1 pt-0.5">
                      {app.status === 'ADDITIONAL_DOCUMENTS_REQUESTED' ? (
                        <span className="text-amber-700 flex items-center gap-1 font-bold">
                          <AlertCircle className="w-3.5 h-3.5" /> Landlord requested updated SCHUFA
                        </span>
                      ) : app.status === 'VIEWING_SCHEDULED' ? (
                        <span className="text-purple-700 flex items-center gap-1 font-bold">
                          <Calendar className="w-3.5 h-3.5" /> Viewing invitation received
                        </span>
                      ) : (
                        <span className="text-gray-600">Application package received & stored</span>
                      )}
                    </div>
                  </div>

                  {/* Next Recommended Action Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-mono">
                      Updated {new Date(app.updatedAt).toLocaleDateString()}
                    </span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApplication(app);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5 px-4 h-8"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Application Workspace Drawer Modal */}
      <ApplicationWorkspaceModal
        application={selectedApplication}
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onRefresh={fetchApplications}
      />

    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>}>
      <ApplicationsPageContent />
    </Suspense>
  );
}
