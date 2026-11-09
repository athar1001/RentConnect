'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, Lock, Server, Users, Key, FileCheck } from 'lucide-react';

export function TrustSecurity() {
  const trustPoints = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: '100% GDPR Compliant',
      desc: 'Built in accordance with strict European data privacy laws. Explicit consent required for every document request.',
    },
    {
      icon: <Server className="w-6 h-6 text-emerald-600" />,
      title: 'Hosted in Germany',
      desc: 'All profile data and document storage are hosted on secure ISO-certified servers located in Frankfurt, Germany.',
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-600" />,
      title: 'Watermarked PDF Packages',
      desc: 'Sensitive documents (income proof, SCHUFA, ID cards) are automatically watermarked to prevent identity theft or misuse.',
    },
    {
      icon: <Key className="w-6 h-6 text-emerald-600" />,
      title: 'Granular Share Controls',
      desc: 'Applicants set password protection, view counts, and expiration dates on shareable profile links at any time.',
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="security">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Enterprise Security
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Security & Privacy by Design
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Your personal data and sensitive financial documents remain strictly protected under military-grade encryption standards.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {trustPoints.map((tp) => (
            <div key={tp.title} className="bg-gray-50/60 border border-gray-100 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xs border border-gray-100">
                {tp.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900">{tp.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{tp.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
