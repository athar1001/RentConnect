'use client';

import { useTranslations } from 'next-intl';
import { X, Check, ArrowRight, ShieldCheck, Mail, FileText, AlertTriangle, Sparkles } from 'lucide-react';

export function BeforeAfterChaos() {
  return (
    <section className="py-24 bg-gray-50/50 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-xs font-bold text-red-600 uppercase tracking-wider">
            The Industry Problem
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Traditional Chaos vs. <span className="text-emerald-600">The WohnBoard Paradigm</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Traditional rental application workflows waste hundreds of hours for both applicants and landlords. WohnBoard replaces chaos with structure.
          </p>
        </div>

        {/* 3-Column Matrix */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          
          {/* 1. Applicant Chaos Card */}
          <div className="bg-white border border-red-100 rounded-3xl p-8 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Applicant Chaos</h3>
                  <p className="text-xs text-gray-500">Old way of hunting</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 text-xs text-gray-700 flex items-center gap-3 font-medium">
                  <span className="font-mono font-bold text-red-600">50</span>
                  <span>Scattered application attempts across 10 portals</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 text-xs text-gray-700 flex items-center gap-3 font-medium">
                  <span className="font-mono font-bold text-red-600">50</span>
                  <span>Repetitive manual emails sent one by one</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 text-xs text-gray-700 flex items-center gap-3 font-medium">
                  <span className="font-mono font-bold text-red-600">500</span>
                  <span>PDF attachments uploaded without watermark protection</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 text-xs text-gray-700 flex items-center gap-3 font-medium">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Lost apartment links, forgotten viewings, zero feedback</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-red-50 text-center text-xs font-bold text-red-600">
              Result: High stress, lost privacy, missed opportunities
            </div>
          </div>

          {/* 2. Landlord Chaos Card */}
          <div className="bg-white border border-red-100 rounded-3xl p-8 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Landlord Chaos</h3>
                  <p className="text-xs text-gray-500">Old property management</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 text-xs text-gray-700 flex items-center gap-3 font-medium">
                  <span className="font-mono font-bold text-red-600">700</span>
                  <span>Unstructured emails overwhelming personal inbox</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 text-xs text-gray-700 flex items-center gap-3 font-medium">
                  <span className="font-mono font-bold text-red-600">700</span>
                  <span>Unorganized PDF attachments requiring manual downloading</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 text-xs text-gray-700 flex items-center gap-3 font-medium">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Missing salary slips, unverified documents, manual review</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 text-xs text-gray-700 flex items-center gap-3 font-medium">
                  <Mail className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Scheduling chaos & replying to hundreds of applicants</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-red-50 text-center text-xs font-bold text-red-600">
              Result: Endless paperwork, compliance risks, forgotten candidates
            </div>
          </div>

          {/* 3. WOHNBOARD PARADIGM HERO CARD */}
          <div className="bg-slate-900 text-white border border-emerald-500/40 rounded-3xl p-8 shadow-2xl space-y-6 flex flex-col justify-between relative overflow-hidden ring-4 ring-emerald-500/10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">WohnBoard</h3>
                    <p className="text-xs text-emerald-400 font-semibold">The Infrastructure Platform</p>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/30 text-xs text-slate-200 space-y-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[10px]">One Platform</span>
                  <p className="text-slate-300 font-medium">A single shared ecosystem connecting applicants & property managers seamlessly.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/30 text-xs text-slate-200 space-y-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[10px]">One Workflow</span>
                  <p className="text-slate-300 font-medium">Verified Housing Identity profiles & encrypted watermarked document packages.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/30 text-xs text-slate-200 space-y-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[10px]">One Timeline</span>
                  <p className="text-slate-300 font-medium">Real-time event feed for document requests, viewing RSVPs, comments & lease offers.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center text-xs font-bold text-emerald-400 relative z-10">
              Result: 10x faster applications, zero paperwork, 100% GDPR compliant
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
