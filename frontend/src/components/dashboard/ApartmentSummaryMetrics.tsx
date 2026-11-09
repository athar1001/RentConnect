'use client';

import { Home, Heart, FileText, Archive, Sparkles } from 'lucide-react';

export function ApartmentSummaryMetrics({
  totalSaved,
  favouritesCount,
  applicationsCount,
  archivedCount,
  newThisWeekCount,
}: {
  totalSaved: number;
  favouritesCount: number;
  applicationsCount: number;
  archivedCount: number;
  newThisWeekCount: number;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Shortlist</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Home className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{totalSaved}</div>
        <span className="text-[10px] text-emerald-600 font-semibold block">Saved Apartments</span>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Favourites</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-4 h-4 fill-rose-600" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{favouritesCount}</div>
        <span className="text-[10px] text-rose-600 font-semibold block">Top Priority</span>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Applications</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{applicationsCount}</div>
        <span className="text-[10px] text-blue-600 font-semibold block">Submitted / Drafts</span>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Archived</span>
          <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
            <Archive className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{archivedCount}</div>
        <span className="text-[10px] text-gray-500 font-semibold block">Passed / Closed</span>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2 col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">New This Week</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{newThisWeekCount}</div>
        <span className="text-[10px] text-purple-600 font-semibold block">Recently Imported</span>
      </div>
    </div>
  );
}
