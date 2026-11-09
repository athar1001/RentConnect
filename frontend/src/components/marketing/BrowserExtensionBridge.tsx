'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Globe, Sparkles, Check, Home, ArrowRight, MousePointerClick, Layers } from 'lucide-react';

export function BrowserExtensionBridge() {
  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden border-y border-slate-800" id="extension">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        
        <div className="grid lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Copy */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              The Seamless Bridge
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Save apartments from <br />
              <span className="text-emerald-400">any portal with one click.</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              WohnBoard doesn't restrict you to a single listing site. Use our Browser Extension to clip apartments directly from ImmoScout24, WG-Gesucht, or housing agency websites into your WohnBoard pipeline.
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 font-medium pt-2">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>Extracts rent, size, location, and photos automatically</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>Organizes target apartments into your visual Kanban board</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>Prepares standardized applications in 30 seconds</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Button className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 gap-2">
                <Globe className="w-4 h-4" />
                Install Extension Free
              </Button>
            </div>
          </div>

          {/* Right Column: Visual Clipper Popup Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    WB
                  </div>
                  <span className="text-xs font-bold text-white">WohnBoard Extension</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  Portal Detected
                </span>
              </div>

              {/* Extracted Data Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">2.5 Room Apartment in Mitte</span>
                  <span className="font-bold text-emerald-400">950 €</span>
                </div>
                <p className="text-[11px] text-slate-400">Müllerstraße 14, 13353 Berlin</p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-slate-300">
                    Size: <strong>68 m²</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-slate-300">
                    Source: <strong>ImmoScout24</strong>
                  </div>
                </div>
              </div>

              {/* Save CTA */}
              <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2">
                <MousePointerClick className="w-4 h-4" />
                Save Apartment to WohnBoard
              </Button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
