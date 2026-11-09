'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { RecommendedForTodayBar } from '@/components/dashboard/RecommendedForTodayBar';
import { ApartmentSummaryMetrics } from '@/components/dashboard/ApartmentSummaryMetrics';
import { ApartmentWorkspaceModal } from '@/components/dashboard/ApartmentWorkspaceModal';
import { ImportBar } from '@/components/dashboard/ImportBar';
import { ManualAddModal } from '@/components/dashboard/ManualAddModal';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Trash2,
  Sparkles,
  Heart,
  FileText,
  MapPin,
  Calendar,
  ExternalLink,
  Ruler,
  DoorOpen,
  CheckCircle2,
  AlertCircle,
  Star,
  Tag,
  SlidersHorizontal,
  Home,
  CheckSquare,
  Square,
  Archive,
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

function calculateApartmentMatchScore(apt: any, userPrefs: any) {
  let score = 75; // Default baseline match
  const rent = apt.warmRent || apt.rentPrice || 0;
  const maxRent = userPrefs?.maxRent || 1500;
  const minRooms = userPrefs?.minRooms || 2;
  const preferredCity = userPrefs?.preferredCity || 'Berlin';

  if (rent > 0 && rent <= maxRent) score += 10;
  if (apt.rooms && apt.rooms >= minRooms) score += 10;
  if (apt.city && apt.city.toLowerCase().includes(preferredCity.toLowerCase())) score += 5;
  
  return Math.min(score, 98);
}

function WohnungenPageContent() {
  const t = useTranslations('Wohnungen');
  const tStatus = useTranslations('Status');
  const tDetail = useTranslations('ApartmentDetail');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [apartments, setApartments] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [failedUrl, setFailedUrl] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Multi-factor filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [matchFilter, setMatchFilter] = useState<string>('ALL');
  const [portalFilter, setPortalFilter] = useState<string>('ALL');
  const [tagFilter, setTagFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('match');

  // Workspace evaluation drawer & bulk selection state
  const [selectedApartment, setSelectedApartment] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [apartmentToDelete, setApartmentToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/apartments', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // Enrich data with match score calculations & default tags
        const enriched = data.map((apt: any) => ({
          ...apt,
          matchScore: calculateApartmentMatchScore(apt, userProfile?.preferences),
          isFavourite: apt.status === 'FAVOURITE' || apt.isFavourite || false,
          sourcePlatform: apt.sourcePlatform || (apt.originalListingUrl?.includes('immowelt') ? 'Immowelt' : apt.originalListingUrl?.includes('wg-gesucht') ? 'WG-Gesucht' : 'ImmoScout24'),
          tags: apt.tags || ['Shortlist'],
          userRating: apt.userRating || 4,
          isSourceActive: apt.isSourceActive !== false,
        }));
        setApartments(enriched);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('http://localhost:3000/housing-identity', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchUserProfile();
    fetchApartments();
  }, []);

  useEffect(() => {
    if (searchParams.get('openAddModal') === 'true') {
      setIsManualModalOpen(true);
      const failed = searchParams.get('failedUrl');
      if (failed) setFailedUrl(decodeURIComponent(failed));
    }
  }, [searchParams]);

  // Bulk actions handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApartments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApartments.map(a => a.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkFavourite = () => {
    setApartments(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, isFavourite: true } : a));
    toast.success(`Marked ${selectedIds.length} apartments as Favourite!`);
    setSelectedIds([]);
  };

  const handleBulkArchive = () => {
    setApartments(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, status: 'ARCHIVED' } : a));
    toast.success(`Archived ${selectedIds.length} apartments.`);
    setSelectedIds([]);
  };

  const handleDeleteConfirm = async () => {
    if (!apartmentToDelete) return;
    try {
      setIsDeleting(true);
      await fetch(`http://localhost:3000/apartments/${apartmentToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      toast.success('Apartment removed from shortlist');
      setApartments(prev => prev.filter(a => a.id !== apartmentToDelete.id));
      setApartmentToDelete(null);
    } catch (err) {
      toast.error('Failed to delete apartment');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Sort Logic
  const filteredApartments = apartments.filter(apt => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      apt.title?.toLowerCase().includes(q) || 
      apt.city?.toLowerCase().includes(q) ||
      apt.address?.toLowerCase().includes(q) ||
      apt.sourcePlatform?.toLowerCase().includes(q);

    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'FAVOURITE' && apt.isFavourite) ||
      (statusFilter === 'APPLICATION_CREATED' && apt.status === 'APPLIED') ||
      apt.status === statusFilter;

    const matchesScore = 
      matchFilter === 'ALL' ||
      (matchFilter === 'EXCELLENT' && apt.matchScore >= 90) ||
      (matchFilter === 'GOOD' && apt.matchScore >= 75 && apt.matchScore < 90) ||
      (matchFilter === 'FAIR' && apt.matchScore < 75);

    const matchesPortal = portalFilter === 'ALL' || apt.sourcePlatform === portalFilter;

    return matchesSearch && matchesStatus && matchesScore && matchesPortal;
  }).sort((a, b) => {
    if (sortBy === 'match') return (b.matchScore || 0) - (a.matchScore || 0);
    if (sortBy === 'price_asc') return (a.warmRent || a.rentPrice || 0) - (b.warmRent || b.rentPrice || 0);
    if (sortBy === 'price_desc') return (b.warmRent || b.rentPrice || 0) - (a.warmRent || a.rentPrice || 0);
    if (sortBy === 'size') return (b.squareMeters || 0) - (a.squareMeters || 0);
    return 0;
  });

  // Summary Metrics calculations
  const totalSaved = apartments.length;
  const favouritesCount = apartments.filter(a => a.isFavourite).length;
  const applicationsCount = apartments.filter(a => a.status === 'APPLIED').length;
  const archivedCount = apartments.filter(a => a.status === 'ARCHIVED').length;
  const newThisWeekCount = apartments.length > 0 ? Math.min(apartments.length, 5) : 0;

  return (
    <div className="space-y-8 pb-16 max-w-[1400px] animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apartment Shortlist Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Saved Apartments Workspace</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Evaluate opportunities, calculate Rental Profile suitability, and prepare applications for your apartment shortlist.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ImportBar
            onImportSuccess={(apartment) => {
              fetchApartments();
              setSelectedApartment(apartment);
            }}
            onImportFail={(url) => { setFailedUrl(url); setIsManualModalOpen(true); }}
          />
          <ManualAddModal
            onAddSuccess={() => { fetchApartments(); setIsManualModalOpen(false); setFailedUrl(''); }}
            isOpen={isManualModalOpen}
            onOpenChange={setIsManualModalOpen}
            initialUrl={failedUrl}
          />
        </div>
      </div>

      {/* Recommended for Today Assistant Bar */}
      <RecommendedForTodayBar
        apartments={apartments}
        onSelectApartment={(apt) => setSelectedApartment(apt)}
      />

      {/* Summary Metrics Cards */}
      <ApartmentSummaryMetrics
        totalSaved={totalSaved}
        favouritesCount={favouritesCount}
        applicationsCount={applicationsCount}
        archivedCount={archivedCount}
        newThisWeekCount={newThisWeekCount}
      />

      {/* Search, Filter & Sort Control Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by title, address, city, landlord, portal, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 border-gray-200 text-xs rounded-2xl focus-visible:ring-1 focus-visible:ring-emerald-500"
            />
          </div>

          {/* Filter Selectors & Sort */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SAVED">Saved Shortlist</option>
              <option value="FAVOURITE">❤️ Favourites</option>
              <option value="APPLICATION_CREATED">📑 Application Created</option>
              <option value="ARCHIVED">📦 Archived</option>
            </select>

            {/* Rental Match Filter */}
            <select
              value={matchFilter}
              onChange={(e) => setMatchFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Match Scores</option>
              <option value="EXCELLENT">⭐ Excellent Match (≥90%)</option>
              <option value="GOOD">✓ Good Match (≥75%)</option>
              <option value="FAIR">Fair Match (&lt;75%)</option>
            </select>

            {/* Source Portal Filter */}
            <select
              value={portalFilter}
              onChange={(e) => setPortalFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Listing Portals</option>
              <option value="ImmoScout24">ImmoScout24</option>
              <option value="WG-Gesucht">WG-Gesucht</option>
              <option value="Immowelt">Immowelt</option>
              <option value="Vonovia">Vonovia</option>
              <option value="degewo">degewo</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-emerald-50 text-emerald-800 font-bold focus:outline-none"
            >
              <option value="match">Sort by: Rental Match %</option>
              <option value="price_asc">Sort by: Rent (Low → High)</option>
              <option value="price_desc">Sort by: Rent (High → Low)</option>
              <option value="size">Sort by: Size m²</option>
            </select>

            {/* View Mode Selector */}
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

        {/* Bulk Action Bar (Visible when items selected) */}
        {selectedIds.length > 0 && (
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
            <span className="text-xs font-bold text-slate-200">
              {selectedIds.length} apartments selected
            </span>

            <div className="flex items-center gap-2">
              <Button onClick={handleBulkFavourite} size="sm" className="bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-xl gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-white" /> Mark Favourite
              </Button>
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

      {/* Main Apartment Shortlist Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          <span className="text-xs text-gray-500 font-medium">Fetching apartment shortlist...</span>
        </div>
      ) : filteredApartments.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
            <Home className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-gray-900">No apartments saved yet</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Install the WohnBoard Browser Extension and save listings from supported portals (ImmoScout24, WG-Gesucht) to start building your shortlist.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Link href={"/app/onboarding" as any}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold gap-2">
                <Globe className="w-4 h-4" /> Install Browser Extension
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Apartment Shortlist Grid / List View */
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredApartments.map((apt) => {
            const isSelected = selectedIds.includes(apt.id);
            return (
              <Card
                key={apt.id}
                onClick={() => setSelectedApartment(apt)}
                className={`group cursor-pointer overflow-hidden rounded-3xl border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white relative ${
                  isSelected ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
                }`}
              >
                {/* Checkbox for bulk action */}
                <button
                  onClick={(e) => toggleSelectOne(apt.id, e)}
                  className="absolute top-3 left-3 z-10 w-7 h-7 rounded-xl bg-white/90 shadow-sm flex items-center justify-center text-gray-600 hover:text-emerald-600 transition-colors backdrop-blur-md"
                >
                  {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                </button>

                {/* Cover Image & Badges */}
                <div className="h-44 w-full bg-gray-100 relative overflow-hidden flex items-center justify-center">
                  {apt.coverImage ? (
                    <img
                      src={apt.coverImage}
                      alt={apt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Home className="w-10 h-10 text-gray-300" />
                  )}

                  {/* Rental Match Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-[11px] shadow-sm backdrop-blur-md">
                      {apt.matchScore}% Match
                    </span>
                  </div>

                  {/* Bottom Portal Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-slate-200 text-[10px] font-bold backdrop-blur-md">
                      {apt.sourcePlatform}
                    </span>
                  </div>
                </div>

                <CardContent className="p-5 space-y-3">
                  {/* Price & Specs */}
                  <div className="flex justify-between items-end">
                    <div className="font-extrabold text-gray-900 text-xl">
                      {apt.rentPrice || apt.warmRent ? `€${apt.rentPrice || apt.warmRent}` : 'Price on request'}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                      {apt.squareMeters && <span>{apt.squareMeters} m²</span>}
                      {apt.rooms && <span>• {apt.rooms} rooms</span>}
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h4 className="font-bold text-gray-900 leading-snug line-clamp-2 text-xs">
                      {apt.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="line-clamp-1">{apt.address || apt.city || 'Berlin, Germany'}</span>
                    </p>
                  </div>

                  {/* Rating & Match Factors */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-3 h-3 ${star <= (apt.userRating || 4) ? 'fill-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>

                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Preferred Location
                    </span>
                  </div>

                  {/* Next Recommended Action CTA */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApartment(apt);
                    }}
                    className="w-full h-9 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 rounded-xl text-xs font-bold gap-1.5 mt-2 transition-colors"
                  >
                    <span>Evaluate Opportunity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Apartment Workspace Drawer / Evaluation Modal */}
      <ApartmentWorkspaceModal
        apartment={selectedApartment}
        isOpen={!!selectedApartment}
        onClose={() => setSelectedApartment(null)}
        onDeleteApartment={(id) => {
          setApartments(prev => prev.filter(a => a.id !== id));
          toast.success('Apartment deleted');
        }}
      />

    </div>
  );
}

export default function WohnungenPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3134]"></div></div>}>
      <WohnungenPageContent />
    </Suspense>
  );
}
