'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Users,
  ArrowLeft,
  ShieldCheck,
  Check,
  Building2,
  Euro,
  FileText,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const idsString = searchParams.get('ids') || '';
  const t = useTranslations('Landlord');

  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparison = async () => {
      if (!idsString) {
        setLoading(false);
        return;
      }
      try {
        const applicationIds = idsString.split(',').filter(Boolean);
        const res = await fetch('http://localhost:3000/landlords/applications/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationIds }),
        });
        if (res.ok) {
          setCandidates(await res.json());
        }
      } catch (e) {
        console.error('Failed to load comparison data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [idsString]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Back Link */}
      <Link href="/landlord/applications" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Applications Inbox
      </Link>

      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('compare.title')}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{t('compare.subtitle')}</p>
          </div>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-4">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-500 font-medium">
            No applicants selected for side-by-side comparison. Please select candidates from the Applications Inbox.
          </p>
          <Link href="/landlord/applications">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold">
              Go to Applications Inbox
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-4 font-bold text-gray-400 uppercase tracking-wider text-[10px] w-48">Criteria</th>
                {candidates.map((cand) => (
                  <th key={cand.id} className="py-4 px-4 font-extrabold text-gray-900 text-sm min-w-[220px]">
                    <div className="space-y-1">
                      <span className="block">{cand.applicantName}</span>
                      <span className="text-[10px] font-mono text-gray-400 font-normal block">{cand.referenceNumber}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-4 px-4 font-bold text-gray-500">{t('compare.netIncome')}</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="py-4 px-4 font-bold text-emerald-600 text-sm">
                    €{cand.netIncome} / mo
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-4 font-bold text-gray-500">{t('compare.occupation')}</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="py-4 px-4 font-medium text-gray-800">
                    <span className="font-bold block">{cand.occupation}</span>
                    <span className="text-[11px] text-gray-400">{cand.employer}</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-4 font-bold text-gray-500">{t('compare.household')}</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="py-4 px-4 font-medium text-gray-800">
                    {cand.householdSize} Occupants • Pets: {cand.pets}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-4 font-bold text-gray-500">{t('compare.moveIn')}</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="py-4 px-4 font-medium text-gray-800">
                    {cand.moveInDate}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-4 font-bold text-gray-500">{t('compare.documents')}</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="py-4 px-4 font-bold text-slate-800">
                    {cand.documentsCount} Documents Verified
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-4 font-bold text-gray-500">{t('compare.verification')}</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                      <UserCheck className="w-3.5 h-3.5" />
                      {cand.verificationScore}% Score
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-4 font-bold text-gray-500">{t('compare.notes')}</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="py-4 px-4 text-gray-600 italic text-[11px]">
                    {cand.landlordNotes || 'No notes added'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-4 font-bold text-gray-500">Action</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="py-4 px-4">
                    <Link href={`/landlord/applications/${cand.id}` as any}>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold w-full">
                        Inspect Profile
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
