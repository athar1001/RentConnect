'use client';

import { useTranslations } from 'next-intl';
import {
  ShieldCheck,
  FolderCheck,
  Lock,
  Send,
  Globe,
  Clock,
  MessageSquare,
  Calendar,
  Sparkles,
  History,
  Building2,
  FileSearch,
  SlidersHorizontal,
  BarChart3
} from 'lucide-react';

export function OutcomeCapabilities() {
  const outcomes = [
    {
      category: 'Prepare',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      title: 'Housing Identity & Documents',
      description: 'Build your verified applicant profile once. Watermark income statements, SCHUFA, and ID cards with high encryption.',
      items: [
        { icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, title: 'Housing Identity Profile', desc: 'Reusable profile with completion scoring' },
        { icon: <FolderCheck className="w-4 h-4 text-emerald-600" />, title: 'Encrypted Document Vault', desc: 'Secure PDF storage with auto-watermarking' },
        { icon: <Lock className="w-4 h-4 text-emerald-600" />, title: 'SCHUFA & Verification', desc: 'Verified credit standing & income proof' },
      ]
    },
    {
      category: 'Apply',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-600 text-white',
      title: 'Submissions & Pipeline',
      description: 'Clip listings from any website, submit structured applications in 1-click, and track your application statuses in real time.',
      items: [
        { icon: <Send className="w-4 h-4 text-blue-600" />, title: '1-Click Submissions', desc: 'Submit standardized applications instantly' },
        { icon: <Globe className="w-4 h-4 text-blue-600" />, title: 'Browser Extension Saver', desc: 'Save listings from ImmoScout24 & WG-Gesucht' },
        { icon: <Clock className="w-4 h-4 text-blue-600" />, title: 'Status Tracking & Feed', desc: 'Live timeline updates for every application' },
      ]
    },
    {
      category: 'Manage',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-600 text-white',
      title: 'Coordination & Communication',
      description: 'Coordinate viewing appointments, exchange comments, accept lease offers, and maintain a complete rental history.',
      items: [
        { icon: <Calendar className="w-4 h-4 text-purple-600" />, title: 'Viewing RSVP Scheduler', desc: 'Select viewing slots & confirm attendance' },
        { icon: <MessageSquare className="w-4 h-4 text-purple-600" />, title: 'Timeline Thread Comments', desc: 'Direct two-way messaging on event items' },
        { icon: <Sparkles className="w-4 h-4 text-purple-600" />, title: 'Lease Offers & Contracts', desc: 'Formal offer issuance and digital RSVP' },
      ]
    },
    {
      category: 'Review',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      iconBg: 'bg-slate-900 text-white',
      title: 'Landlord Workspace & Analytics',
      description: 'Property management dashboard for reviewing candidate metrics, requesting documents, and managing applications efficiently.',
      items: [
        { icon: <Building2 className="w-4 h-4 text-slate-700" />, title: 'Landlord Workspace', desc: 'Centralized property & application management' },
        { icon: <FileSearch className="w-4 h-4 text-slate-700" />, title: '1-Click Document Requests', desc: 'Request verified document packages on demand' },
        { icon: <BarChart3 className="w-4 h-4 text-slate-700" />, title: 'Applicant Matrix & Analytics', desc: 'Compare candidates fairly with response analytics' },
      ]
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="features">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
            Outcome-Driven Infrastructure
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Built Around Real Outcomes
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Instead of isolated feature modules, WohnBoard powers every critical phase of the rental application process.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {outcomes.map((group) => (
            <div
              key={group.category}
              className="bg-gray-50/70 border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${group.badgeColor}`}>
                    {group.category}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${group.iconBg}`}>
                    {group.category[0]}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">{group.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{group.description}</p>
                </div>

                {/* Sub-items */}
                <div className="space-y-3 pt-2">
                  {group.items.map((item) => (
                    <div key={item.title} className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gray-50 shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{item.title}</h4>
                        <p className="text-[11px] text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
