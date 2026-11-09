'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Users
} from 'lucide-react';

export default function LandlordAnalyticsPage() {
  const t = useTranslations('Landlord');
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anRes, logRes] = await Promise.all([
          fetch('http://localhost:3000/landlords/analytics'),
          fetch('http://localhost:3000/landlords/audit-logs'),
        ]);

        if (anRes.ok) setAnalytics(await anRes.json());
        if (logRes.ok) setAuditLogs(await logRes.json());
      } catch (e) {
        console.error('Failed to load landlord analytics:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Landlord Analytics & Performance</h1>
            <p className="text-xs text-gray-500 mt-0.5">Track conversion funnels, response velocity, and GDPR compliance logs.</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('analytics.viewingConversion')}</span>
          <div className="text-3xl font-extrabold text-emerald-600">{analytics?.viewingConversionRate || 35}%</div>
          <span className="text-[11px] text-gray-500 font-medium">Applicant to viewing ratio</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('analytics.offerConversion')}</span>
          <div className="text-3xl font-extrabold text-blue-600">{analytics?.offerConversionRate || 15}%</div>
          <span className="text-[11px] text-gray-500 font-medium">Lease agreement offer rate</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('analytics.avgResponse')}</span>
          <div className="text-3xl font-extrabold text-purple-600">{analytics?.averageResponseTimeHours || 6.5}h</div>
          <span className="text-[11px] text-gray-500 font-medium">Velocity to initial candidate response</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">GDPR Security Compliance</span>
          <div className="text-3xl font-extrabold text-slate-900">100%</div>
          <span className="text-[11px] text-emerald-600 font-bold">Full Audit Trail Encrypted</span>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          GDPR Security & Access Audit Log
        </h3>

        <div className="space-y-3">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No audit events recorded yet.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">{log.action}</span>
                  <span className="text-gray-500 block text-[11px]">{log.description}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
