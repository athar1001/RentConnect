'use client';

import { AlertCircle, FileText, Calendar, Euro, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

export function ActionRequiredBar({
  applications,
  onOpenWorkspace,
}: {
  applications: any[];
  onOpenWorkspace: (app: any) => void;
}) {
  if (applications.length === 0) return null;

  // Filter applications requiring urgent action
  const actionItems = applications.map(app => {
    if (app.status === 'ADDITIONAL_DOCUMENTS_REQUESTED' || app.documentRequests?.some((r: any) => !r.isFulfilled)) {
      return {
        id: app.id,
        app,
        type: 'DOC_REQUEST',
        icon: <FileText className="w-4 h-4 text-amber-400" />,
        badge: 'Document Requested',
        badgeStyle: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        title: app.apartment?.title || 'Landlord Document Request',
        subtitle: 'Landlord requested updated SCHUFA or payslip for verification.',
        actionLabel: 'Upload Document',
      };
    }
    if (app.status === 'VIEWING_SCHEDULED' || app.viewings?.some((v: any) => v.status === 'SCHEDULED')) {
      return {
        id: app.id,
        app,
        type: 'VIEWING',
        icon: <Calendar className="w-4 h-4 text-purple-400" />,
        badge: 'Viewing Invitation',
        badgeStyle: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        title: app.apartment?.title || 'Viewing Invitation',
        subtitle: 'Viewing scheduled with property manager. Please confirm attendance.',
        actionLabel: 'Accept / Manage Viewing',
      };
    }
    if (app.offers?.some((o: any) => o.status === 'SENT')) {
      return {
        id: app.id,
        app,
        type: 'OFFER',
        icon: <Euro className="w-4 h-4 text-emerald-400" />,
        badge: 'Lease Offer Received',
        badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        title: app.apartment?.title || 'Lease Offer',
        subtitle: 'Congratulations! Formal lease offer received from landlord.',
        actionLabel: 'Review & Accept Offer',
      };
    }
    if (app.status === 'DRAFT') {
      return {
        id: app.id,
        app,
        type: 'DRAFT',
        icon: <Clock className="w-4 h-4 text-blue-400" />,
        badge: 'Draft Application',
        badgeStyle: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        title: app.apartment?.title || 'Draft Application',
        subtitle: 'Ready to submit application package to landlord.',
        actionLabel: 'Submit Application',
      };
    }
    return null;
  }).filter(Boolean);

  if (actionItems.length === 0) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">All Applications Up To Date!</h2>
            <p className="text-xs text-slate-400">No pending document requests or unconfirmed viewings require your action today.</p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">Live monitoring active</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold tracking-tight text-white">What do I need to do today?</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
            {actionItems.length} Action{actionItems.length > 1 ? 's' : ''} Required
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Priority Queue</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actionItems.slice(0, 3).map((item: any) => (
          <div
            key={item.id}
            className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl flex flex-col justify-between space-y-3 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeStyle}`}>
                  {item.badge}
                </span>
                {item.icon}
              </div>
              <h3 className="text-xs font-bold text-white line-clamp-1">{item.title}</h3>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{item.subtitle}</p>
            </div>

            <Button
              onClick={() => onOpenWorkspace(item.app)}
              className="w-full h-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold gap-1 shadow-sm"
            >
              <span>{item.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
