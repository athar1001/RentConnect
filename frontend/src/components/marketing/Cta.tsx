'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { User, Building2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export function Cta() {
  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        
        <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-10 lg:p-14 text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready to transform your rental experience?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Join the modern application <br />
            <span className="text-emerald-400">infrastructure for rental markets.</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
            Whether you are applying for your next home or managing tenant inflow, WohnBoard brings speed, structure, and security to your workflow.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={{ pathname: '/register', query: { role: 'USER' } }} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-3">
                <User className="w-5 h-5 text-emerald-200" />
                <span>Start as an Applicant</span>
                <ArrowRight className="w-4 h-4 text-emerald-200" />
              </Button>
            </Link>

            <Link href={{ pathname: '/register', query: { role: 'LANDLORD' } }} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700 font-bold text-base shadow-lg transition-all flex items-center justify-center gap-3">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Start as a Landlord</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-slate-400 font-medium pt-4">
            Free for applicants • Instant landlord setup • 100% GDPR compliant
          </p>
        </div>

      </div>
    </section>
  );
}
