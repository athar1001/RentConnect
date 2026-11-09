'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FolderCheck,
  Search,
  SlidersHorizontal,
  Calendar,
  Layers,
  Inbox,
  Users,
  Lock
} from 'lucide-react';

export function TwoExperiences() {
  const t = useTranslations('HomePage');

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
            Tailored Experiences
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            One platform. <span className="text-emerald-600">Two experiences.</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Whether you are searching for your dream home or looking for the ideal applicant, WohnBoard provides specialized tools tailored to your exact workflow.
          </p>
        </div>

        {/* Split Screen Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* LEFT: FOR APPLICANTS */}
          <div className="bg-gradient-to-b from-emerald-50/40 via-white to-emerald-50/20 border border-emerald-100 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full uppercase tracking-wider">
                  For Applicants
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Stop resending the same PDFs 50 times.
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Build your reusable Housing Identity once, watermarking your documents for complete protection, and apply to apartments in seconds.
                </p>
              </div>

              {/* Bullet points */}
              <ul className="space-y-3.5 text-xs sm:text-sm text-gray-700 font-medium pt-2">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span><strong>Create one Rental Profile</strong> — Reuse across all listings without typing your details repeatedly.</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span><strong>Upload documents once</strong> — Automatically watermarked and encrypted for high privacy.</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span><strong>Save apartments from any website</strong> — Clip listings with our Browser Extension.</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span><strong>Track applications in real-time</strong> — Stay updated on viewings, document requests & offers.</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span><strong>Never lose an application again</strong> — Keep notes, contact details, and dates organized.</span>
                </li>
              </ul>

            </div>

            <div className="pt-8 mt-6 border-t border-emerald-100/60">
              <Link href={{ pathname: '/register', query: { role: 'USER' } }} className="w-full block">
                <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 gap-2">
                  <span>Start as an Applicant</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT: FOR LANDLORDS */}
          <div className="bg-gradient-to-b from-slate-900/5 via-white to-slate-900/10 border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/30">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-slate-800 bg-slate-200/80 px-3 py-1 rounded-full uppercase tracking-wider">
                  For Landlords
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Stop wading through 700 unorganized emails.
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Replace inbox clutter with standardized profiles, 1-click document packages, and automated viewing coordination.
                </p>
              </div>

              {/* Bullet points */}
              <ul className="space-y-3.5 text-xs sm:text-sm text-gray-700 font-medium pt-2">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span><strong>Receive structured applications</strong> — Standardized applicant profiles instead of chaotic email text.</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span><strong>Request documents in 1-click</strong> — Instantly receive watermarked SCHUFA & income verifications.</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span><strong>Schedule viewings effortlessly</strong> — Send viewing slots and collect applicant RSVPs in real time.</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span><strong>Review & compare applicants objectively</strong> — Side-by-side comparison matrix with privacy controls.</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span><strong>Manage everything in one workspace</strong> — Total GDPR compliance with automated document archiving.</span>
                </li>
              </ul>

            </div>

            <div className="pt-8 mt-6 border-t border-slate-200">
              <Link href={{ pathname: '/register', query: { role: 'LANDLORD' } }} className="w-full block">
                <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md shadow-slate-900/20 gap-2">
                  <span>Start as a Landlord</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
