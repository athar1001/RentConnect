'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, User, Building2, HelpCircle } from 'lucide-react';

export function Faq() {
  const [activeTab, setActiveTab] = useState<'applicant' | 'landlord'>('applicant');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const applicantFaqs = [
    {
      q: 'Is WohnBoard free for apartment seekers?',
      a: 'Yes, WohnBoard is 100% free for applicants. You can build your Housing Identity profile, upload documents, clip listings with our browser extension, and track unlimited applications at zero cost.',
    },
    {
      q: 'Are my uploaded documents secure and watermarked?',
      a: 'Absolutely. Every document stored in your vault (SCHUFA, salary slips, ID cards) is encrypted at rest and automatically watermarked with a recipient-specific security seal whenever shared.',
    },
    {
      q: 'Do I need a landlord account to apply for apartments?',
      a: 'No. You can apply directly through WohnBoard link shares or send standardized application PDFs to any landlord or listing agent.',
    },
    {
      q: 'Can I revoke access to my shared profile at any time?',
      a: 'Yes. Every share link can be configured with password protection, view count limits, and expiration dates. You can revoke access in one click anytime from your dashboard.',
    },
  ];

  const landlordFaqs = [
    {
      q: 'How does WohnBoard streamline applicant review for landlords?',
      a: 'Instead of receiving hundreds of random emails with missing PDF attachments, WohnBoard delivers standardized candidate profiles with verified credit scores, income summaries, and structured document requests.',
    },
    {
      q: 'Can I schedule viewing slots and track attendee RSVPs?',
      a: 'Yes. Landlords can create viewing time slots directly inside their property workspace. Applicants receive instant notifications to accept or decline, giving you a live attendance roster.',
    },
    {
      q: 'Is WohnBoard compliant with European GDPR data privacy laws?',
      a: 'Completely. WohnBoard is hosted in Frankfurt, Germany, and implements strict data minimization, automatic archiving, and audit-proof consent management for all application documents.',
    },
    {
      q: 'How do I start receiving structured applications as a landlord?',
      a: 'Simply create a free Landlord account, add your property listing details, and share your unique WohnBoard Preferred Application link on portals like ImmoScout24 or WG-Gesucht.',
    },
  ];

  const currentFaqs = activeTab === 'applicant' ? applicantFaqs : landlordFaqs;

  return (
    <section className="py-24 bg-gray-50/50 relative overflow-hidden" id="faq">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 uppercase tracking-wider">
            Got Questions?
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Everything you need to know about the WohnBoard application platform.
          </p>

          {/* Dual Audience Tab Switcher */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              onClick={() => { setActiveTab('applicant'); setOpenIndex(0); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                activeTab === 'applicant'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4" />
              Applicant Questions
            </button>

            <button
              onClick={() => { setActiveTab('landlord'); setOpenIndex(0); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                activeTab === 'landlord'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              Landlord Questions
            </button>
          </div>
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {currentFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-gray-900 text-base sm:text-lg hover:text-emerald-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-xs sm:text-sm text-gray-600 font-medium leading-relaxed border-t border-gray-50 pt-4 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
