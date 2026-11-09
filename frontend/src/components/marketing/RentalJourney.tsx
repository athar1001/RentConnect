'use client';

import { useTranslations } from 'next-intl';
import {
  Search,
  FileCheck,
  Send,
  Eye,
  Calendar,
  Sparkles,
  Home,
  User,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export function RentalJourney() {
  const steps = [
    {
      number: '01',
      title: 'Find Apartment',
      icon: <Search className="w-5 h-5" />,
      applicant: 'Saves listing from external portal via WohnBoard Extension',
      landlord: 'Listings published on ImmoScout24, WG-Gesucht, or direct site',
    },
    {
      number: '02',
      title: 'Prepare Application',
      icon: <FileCheck className="w-5 h-5" />,
      applicant: 'Assembles reusable Housing Identity & watermarked docs',
      landlord: 'Configures preferred application criteria & document requirements',
    },
    {
      number: '03',
      title: 'Submit Application',
      icon: <Send className="w-5 h-5" />,
      applicant: 'Submits 1-click standardized application package',
      landlord: 'Receives structured candidate profile into Landlord Inbox',
    },
    {
      number: '04',
      title: 'Review & Verify',
      icon: <Eye className="w-5 h-5" />,
      applicant: 'Receives document request notification and approves access',
      landlord: 'Inspects applicant score, background & requests verified files',
    },
    {
      number: '05',
      title: 'Viewing Coordination',
      icon: <Calendar className="w-5 h-5" />,
      applicant: 'Selects preferred viewing time slot and RSVPs instantly',
      landlord: 'Creates viewing slots & tracks attendee attendance live',
    },
    {
      number: '06',
      title: 'Lease Offer',
      icon: <Sparkles className="w-5 h-5" />,
      applicant: 'Reviews official lease offer terms & accepts digitally',
      landlord: 'Issues formal apartment offer to top candidate',
    },
    {
      number: '07',
      title: 'Move In & Archive',
      icon: <Home className="w-5 h-5" />,
      applicant: 'Moves in smoothly with organized rental history log',
      landlord: 'Archives application package automatically for GDPR compliance',
    },
  ];

  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Connected Lifecycle
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            The Complete Rental Journey
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-normal">
            Applicant on the left. Landlord on the right. WohnBoard as the central bridge guiding every milestone seamlessly.
          </p>
        </div>

        {/* Roles Banner */}
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 mb-12 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 py-3 rounded-2xl">
            <User className="w-4 h-4" />
            <span>Applicant Side</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-white bg-slate-800 border border-slate-700 py-3 rounded-2xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>WohnBoard Platform</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-blue-400 bg-blue-950/40 border border-blue-900/50 py-3 rounded-2xl">
            <Building2 className="w-4 h-4" />
            <span>Landlord Side</span>
          </div>
        </div>

        {/* Steps List */}
        <div className="max-w-5xl mx-auto space-y-4">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition-all duration-300 grid md:grid-cols-12 gap-4 items-center group shadow-md"
            >
              {/* Applicant side text */}
              <div className="md:col-span-4 text-left space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">APPLICANT</span>
                <p className="text-xs text-slate-300 font-medium leading-snug">{step.applicant}</p>
              </div>

              {/* Center Step Badge */}
              <div className="md:col-span-4 flex items-center justify-center py-2 md:py-0 border-y md:border-y-0 md:border-x border-slate-800/80 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                    {step.icon}
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">STEP {step.number}</span>
                    <h4 className="text-sm font-bold text-white tracking-tight">{step.title}</h4>
                  </div>
                </div>
              </div>

              {/* Landlord side text */}
              <div className="md:col-span-4 text-left md:text-right space-y-1">
                <span className="text-[10px] font-mono text-blue-400 font-bold block">LANDLORD</span>
                <p className="text-xs text-slate-300 font-medium leading-snug">{step.landlord}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
