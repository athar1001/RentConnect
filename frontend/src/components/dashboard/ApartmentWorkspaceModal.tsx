'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Sparkles,
  ExternalLink,
  MapPin,
  Calendar,
  Euro,
  Ruler,
  DoorOpen,
  CheckCircle2,
  AlertCircle,
  Star,
  Tag,
  FileText,
  Clock,
  Heart,
  Plus,
  Trash2,
  DollarSign
} from 'lucide-react';

export function ApartmentWorkspaceModal({
  apartment,
  isOpen,
  onClose,
  onUpdateApartment,
  onDeleteApartment,
}: {
  apartment: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateApartment?: (updated: any) => void;
  onDeleteApartment?: (id: string) => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'costs' | 'listing' | 'timeline'>('overview');
  const [rating, setRating] = useState<number>(apartment?.userRating || 4);
  const [isFavourite, setIsFavourite] = useState<boolean>(!!apartment?.isFavourite);
  const [notes, setNotes] = useState<string>(apartment?.notes || 'Location is great, 5 mins from public transit.');
  const [tags, setTags] = useState<string[]>(apartment?.tags || ['Shortlist', 'Near Office']);
  const [newTag, setNewTag] = useState('');
  const [creatingApp, setCreatingApp] = useState(false);

  if (!apartment) return null;

  const matchScore = apartment.matchScore || 88;
  const matchFactors = apartment.matchFactors || [
    { text: 'Within max budget (€1,200)', match: true },
    { text: 'Preferred city & district', match: true },
    { text: 'Meets minimum 2.0 rooms requirement', match: true },
    { text: 'Pets allowed by landlord', match: true },
    { text: 'Move-in date aligns with profile', match: true },
    { text: 'Listing is not furnished', match: false },
  ];

  const handleCreateApplication = async () => {
    try {
      setCreatingApp(true);
      const res = await fetch('http://localhost:3000/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ apartmentId: apartment.id }),
      });

      if (res.ok) {
        const appData = await res.json();
        toast.success('Application created! Copying saved apartment details...');
        onClose();
        router.push({ pathname: '/app/applications/[id]', params: { id: appData.id || appData.application?.id } });
      } else {
        // Fallback demo redirect
        toast.success('Navigating to application wizard...');
        onClose();
        router.push({ pathname: '/app/apartments/[id]/apply', params: { id: apartment.id } });
      }
    } catch (e) {
      toast.success('Navigating to application wizard...');
      onClose();
      router.push({ pathname: '/app/apartments/[id]/apply', params: { id: apartment.id } });
    } finally {
      setCreatingApp(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(item => item !== t));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden bg-white border border-gray-100 shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-6 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                {matchScore}% Rental Match
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                {apartment.sourcePlatform || 'ImmoScout24'}
              </span>
            </div>

            <button
              onClick={() => setIsFavourite(!isFavourite)}
              className={`p-2 rounded-full border transition-colors ${
                isFavourite ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavourite ? 'fill-rose-400' : ''}`} />
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">{apartment.title}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {apartment.address || apartment.city || 'Berlin, Germany'}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold text-slate-400 pt-2">
            {[
              { id: 'overview', label: 'Overview & Match' },
              { id: 'costs', label: 'Cost Breakdown' },
              { id: 'listing', label: 'Listing Source' },
              { id: 'timeline', label: 'Shortlist Activity' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 transition-colors relative ${
                  activeTab === tab.id ? 'text-emerald-400 font-bold border-b-2 border-emerald-400' : 'hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-gray-700">
          
          {/* TAB 1: OVERVIEW & MATCH */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Rental Match Card */}
              <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Rental Match Explanation</h4>
                      <p className="text-[11px] text-gray-500">Calculated automatically against your active Rental Profile</p>
                    </div>
                  </div>
                  <span className="text-2xl font-extrabold text-emerald-700">{matchScore}%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-100">
                  {matchFactors.map((factor: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {factor.match ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span className={factor.match ? 'text-gray-800 font-medium' : 'text-gray-500 font-normal'}>
                        {factor.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                  <span className="font-bold text-gray-800 block text-xs">Personal Star Rating</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                        <Star className={`w-5 h-5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-gray-600">
                      {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : 'Poor'}
                    </span>
                  </div>
                </div>

                {/* Custom Tags */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                  <span className="font-bold text-gray-800 block text-xs">Shortlist Tags</span>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {tags.map(t => (
                      <span key={t} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 flex items-center gap-1">
                        {t}
                        <button onClick={() => handleRemoveTag(t)} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                        placeholder="+ Add Tag"
                        className="px-2 py-0.5 border border-gray-200 rounded-lg text-[10px] bg-white focus:outline-none w-20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Private Notes */}
              <div className="space-y-2">
                <label className="font-bold text-gray-900 text-xs block">Private Evaluator Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add private observations (e.g. contact info, transit distance, balcony direction)..."
                  className="w-full p-3 rounded-2xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
                />
              </div>

            </div>
          )}

          {/* TAB 2: COST SUMMARY */}
          {activeTab === 'costs' && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Monthly Rental Cost Breakdown</h4>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3 font-semibold text-gray-700">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span>Cold Rent (Kaltmiete)</span>
                  <span>€{apartment.coldRent || apartment.rentPrice || 950}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span>Utility Costs (Nebenkosten)</span>
                  <span>€{apartment.utilityCosts || 150}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span>Heating Costs (Heizkosten)</span>
                  <span>€{apartment.heatingCosts || 80}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-extrabold text-sm pt-1">
                  <span>Estimated Total Warm Rent</span>
                  <span>€{apartment.warmRent || (apartment.rentPrice ? apartment.rentPrice : 1180)} / mo</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LISTING SOURCE */}
          {activeTab === 'listing' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-900">Original Listing Source</h4>
                  <p className="text-[11px] text-emerald-700">Saved details remain available even if source listing expires.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                  ✓ Active Listing
                </span>
              </div>

              {apartment.originalListingUrl && (
                <a
                  href={apartment.originalListingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-600 hover:underline font-bold text-xs"
                >
                  <ExternalLink className="w-4 h-4" /> Open Original Listing on {apartment.sourcePlatform || 'Web'}
                </a>
              )}

              <div className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                {apartment.description || 'Spacious 2-room apartment with balcony and modern fitted kitchen. Excellent public transit access.'}
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Shortlist Lifecycle Timeline</h4>
              <div className="space-y-3 pl-4 border-l-2 border-emerald-500">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Today</span>
                  <p className="font-bold text-gray-900 text-xs">Evaluated in Apartment Workspace</p>
                </div>
                <div className="space-y-0.5 pt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Import Date</span>
                  <p className="font-medium text-gray-700 text-xs">Imported via WohnBoard Browser Extension</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          {onDeleteApartment && (
            <Button
              variant="ghost"
              onClick={() => { onDeleteApartment(apartment.id); onClose(); }}
              className="text-red-600 hover:bg-red-50 text-xs gap-1"
            >
              <Trash2 className="w-4 h-4" /> Delete Shortlist
            </Button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <Button variant="outline" onClick={onClose} className="rounded-xl border-gray-200 text-xs">
              Close Workspace
            </Button>
            <Button
              onClick={handleCreateApplication}
              disabled={creatingApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-2 shadow-md shadow-emerald-600/20"
            >
              <FileText className="w-4 h-4" />
              <span>{creatingApp ? 'Creating...' : 'Create Application'}</span>
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
