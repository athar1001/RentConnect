'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  User,
  Building2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileText,
  Calendar,
  Sparkles,
  Lock,
  RefreshCw,
  FolderCheck,
  Check,
  Send,
  Home,
  Sliders,
  ChevronRight
} from 'lucide-react';

export function Hero() {
  const t = useTranslations('HomePage');

  return (
    <section className="relative w-full pt-16 pb-24 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Dynamic Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
          
          {/* Ecosystem Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-6 backdrop-blur-md animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Where rental applications become simple, secure and organized</span>
          </div>

          {/* Core Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            The smarter way to <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              manage rental applications.
            </span>
          </h1>

          {/* Supporting Narrative */}
          <p className="text-base sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed font-normal">
            Whether you're looking for an apartment or reviewing applicants, WohnBoard brings the entire rental application process into one secure, organized platform.
          </p>

          {/* Dual CTAs (B2B2C Standard) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link href={{ pathname: '/register', query: { role: 'USER' } }} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-3 group border border-emerald-500/30">
                <User className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                <span>I'm Looking for an Apartment</span>
                <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href={{ pathname: '/register', query: { role: 'LANDLORD' } }} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-100 border-slate-700 font-bold text-base shadow-lg transition-all flex items-center justify-center gap-3 group hover:border-slate-600">
                <Building2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>I'm a Landlord</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-8 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% GDPR Compliant
            </span>
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Watermarked Encrypted Packages
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Free for Applicants
            </span>
          </div>

        </div>

        {/* Hero Visual: "Two Sides Connected" Platform Graphic */}
        <div className="max-w-6xl mx-auto relative mt-8">
          
          {/* Main Connected Canvas Card */}
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

            <div className="grid lg:grid-cols-11 gap-6 items-center relative z-10">
              
              {/* Left Panel: APPLICANT PORTAL */}
              <div className="lg:col-span-5 bg-slate-950/70 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Applicant Portal</h4>
                      <p className="text-[10px] text-slate-400">Housing Identity & Tracker</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-500/20">
                    Profile Ready
                  </span>
                </div>

                {/* Applicant Profile Items */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-slate-200">Housing Identity</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Verified • 100%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <FolderCheck className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-slate-200">Document Vault</span>
                    </div>
                    <span className="text-[10px] text-slate-400">SCHUFA + Salary Slips</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Home className="w-4 h-4 text-purple-400" />
                      <span className="font-semibold text-slate-200">Saved Apartment</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Berlin • 2.5 Rooms</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-900/50 bg-emerald-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-emerald-300">Viewing RSVP</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Panel: WOHNBOARD BRIDGE HUB */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center my-4 lg:my-0">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse" />
                  <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-emerald-500/40 flex flex-col items-center justify-center text-white font-extrabold shadow-xl">
                    <span className="text-xs text-emerald-400 font-bold">WB</span>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400 mt-0.5 animate-spin duration-3000" />
                  </div>
                </div>
                <div className="mt-3 flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">WohnBoard</span>
                  <span className="text-[9px] text-slate-400 font-mono">2-Way Sync</span>
                </div>
              </div>

              {/* Right Panel: LANDLORD PORTAL */}
              <div className="lg:col-span-5 bg-slate-950/70 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Landlord Workspace</h4>
                      <p className="text-[10px] text-slate-400">Properties & Applications</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-mono font-semibold border border-blue-500/20">
                    Live Inbox
                  </span>
                </div>

                {/* Landlord Workflow Items */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-200">Listing</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Torstraße 42 • Active</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Send className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-slate-200">Standardized App</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">Structured PDF</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-slate-200">Doc Request</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Watermarked Download</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-blue-900/50 bg-blue-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-blue-300">Lease Offer Issued</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
                      Accepted
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
