'use client';

import { FileText, AlertCircle, Clock, Calendar, Euro, CheckCircle2 } from 'lucide-react';

export function ApplicationSummaryMetrics({
  totalApplications,
  actionRequiredCount,
  waitingCount,
  viewingsCount,
  offersCount,
}: {
  totalApplications: number;
  actionRequiredCount: number;
  waitingCount: number;
  viewingsCount: number;
  offersCount: number;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Applications</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{totalApplications}</div>
        <span className="text-[10px] text-blue-600 font-semibold block">Total Lifecycle Tracked</span>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Action Required</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{actionRequiredCount}</div>
        <span className="text-[10px] text-amber-600 font-semibold block">Requires Attention</span>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Waiting Response</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{waitingCount}</div>
        <span className="text-[10px] text-purple-600 font-semibold block">Under Landlord Review</span>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Viewings</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{viewingsCount}</div>
        <span className="text-[10px] text-emerald-600 font-semibold block">Scheduled Visits</span>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2 col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Offers</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Euro className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{offersCount}</div>
        <span className="text-[10px] text-amber-600 font-semibold block">Lease Offers Received</span>
      </div>
    </div>
  );
}
