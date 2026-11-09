'use client';

import { useTranslations } from 'next-intl';
import { Building2, Home, UserCheck, Briefcase, CheckCircle2, ShieldCheck } from 'lucide-react';

export function B2BSolutions() {
  const stakeholders = [
    {
      icon: <Home className="w-6 h-6 text-emerald-600" />,
      title: 'Private Landlords',
      desc: 'Eliminate email clutter. Review standardized applicant profiles, request verified document packages in 1-click, and issue lease offers with zero hassle.',
    },
    {
      icon: <Building2 className="w-6 h-6 text-blue-600" />,
      title: 'Housing Companies',
      desc: 'Process high-volume application inflows effortlessly. Maintain 100% GDPR compliance with automatic document watermarking and audit logs.',
    },
    {
      icon: <UserCheck className="w-6 h-6 text-purple-600" />,
      title: 'Property Managers',
      desc: 'Unified multi-property workspace. Schedule viewing slots, collect attendee RSVPs, and collaborate across team members seamlessly.',
    },
    {
      icon: <Briefcase className="w-6 h-6 text-slate-700" />,
      title: 'Real Estate Agencies',
      desc: 'Present pre-screened, verified candidate shortlists to property owners via secure, password-protected presentation links.',
    },
  ];

  return (
    <section className="py-24 bg-gray-50/70 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 uppercase tracking-wider">
            Ecosystem Scale
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Built for All Housing Stakeholders
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Whether you manage one apartment or several thousand units, WohnBoard scales to power your entire application workflow.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {stakeholders.map((s) => (
            <div
              key={s.title}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  {s.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Enterprise Ready</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
