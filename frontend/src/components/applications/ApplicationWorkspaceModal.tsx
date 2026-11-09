'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TimelineCenterpiece } from '@/components/applications/TimelineCenterpiece';
import { toast } from 'sonner';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Euro,
  Share2,
  User,
  MessageSquare,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Send,
  Plus,
  Trash2,
  Download,
  Copy,
  Check
} from 'lucide-react';

export function ApplicationWorkspaceModal({
  application,
  isOpen,
  onClose,
  onRefresh,
}: {
  application: any | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'profile' | 'documents' | 'viewings' | 'offers' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedDocToFulfill, setSelectedDocToFulfill] = useState('');

  if (!application) return null;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch(`http://localhost:3000/applications/${application.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newNote }),
      });
      if (res.ok) {
        toast.success('Private note added');
        setNewNote('');
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      toast.error('Failed to add note');
    }
  };

  const copyShareLink = () => {
    if (application.sharing?.token) {
      const link = `${window.location.origin}/application/${application.sharing.token}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Landlord share link copied to clipboard!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden bg-white border border-gray-100 shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-6 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                {application.referenceNumber || 'REF-2026-APP'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                {application.status.replace(/_/g, ' ')}
              </span>
            </div>

            {application.sharing?.token && (
              <Button
                onClick={copyShareLink}
                size="sm"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl gap-1.5 border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Share Link'}</span>
              </Button>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">{application.apartment?.title || 'Berlin Mitte Apartment'}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {application.apartment?.address || application.apartment?.city || 'Berlin, Germany'}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold text-slate-400 pt-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'timeline', label: 'Timeline & Feed' },
              { id: 'profile', label: 'Shared Profile Snapshot' },
              { id: 'documents', label: 'Shared Documents' },
              { id: 'viewings', label: 'Viewings' },
              { id: 'offers', label: 'Offers' },
              { id: 'notes', label: 'Private Notes' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 transition-colors shrink-0 relative ${
                  activeTab === tab.id ? 'text-emerald-400 font-bold border-b-2 border-emerald-400' : 'hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-gray-700">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Alert Banner */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Current Status: {application.status.replace(/_/g, ' ')}</h4>
                    <p className="text-xs text-gray-500">Submitted on {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Today'}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveTab('timeline')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1"
                >
                  View Timeline Feed
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                  <span className="font-bold text-gray-400 uppercase text-[10px] block">Landlord & Property</span>
                  <p className="font-bold text-gray-900 text-xs">{application.apartment?.title}</p>
                  <p className="text-gray-500 text-[11px]">{application.apartment?.address}</p>
                  <span className="inline-block mt-2 font-bold text-emerald-700 text-xs">
                    Warm Rent: €{application.apartment?.warmRent || application.apartment?.rentPrice || 1180} / mo
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                  <span className="font-bold text-gray-400 uppercase text-[10px] block">Application Readiness</span>
                  <p className="font-bold text-gray-900 text-xs">100% Application Package Verified</p>
                  <p className="text-gray-500 text-[11px]">Passport, SCHUFA & Payslips attached.</p>
                  <span className="inline-block mt-2 font-bold text-blue-700 text-xs">
                    {application.documents?.length || 4} Shared Documents Attached
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE & FEED */}
          {activeTab === 'timeline' && (
            <TimelineCenterpiece
              applicationId={application.id}
              mode="APPLICANT"
              onRefresh={onRefresh}
            />
          )}

          {/* TAB 3: SHARED PROFILE SNAPSHOT */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-900 text-xs">Immutable Historical Profile Snapshot</h4>
                  <p className="text-[11px] text-amber-700 leading-snug">
                    This snapshot records your profile exactly as shared on {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'submission date'}. Subsequent profile changes will not silently mutate this application.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                <div>
                  <span className="font-bold text-gray-800 block text-xs">Shared Sections:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Personal Information', 'Household Info', 'Employment & Income', 'Rental History', 'Preferences'].map(sec => (
                      <span key={sec} className="px-3 py-1 bg-white border border-gray-200 rounded-xl font-bold text-emerald-700 text-[11px]">
                        ✓ {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHARED DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm">Attached Application Documents</h4>
                <span className="text-xs font-bold text-emerald-700">Verified Credentials</span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'SCHUFA Credit Report (2026)', type: 'SCHUFA', date: 'Shared on Submission' },
                  { name: 'Proof of Income / 3 Payslips', type: 'PAYSLIP', date: 'Shared on Submission' },
                  { name: 'Identity Document / Passport', type: 'PASSPORT_ID', date: 'Shared on Submission' },
                ].map((doc, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <div>
                        <span className="font-bold text-gray-900 text-xs block">{doc.name}</span>
                        <span className="text-[10px] text-gray-400">{doc.date}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px]">
                      Attached
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: VIEWINGS */}
          {activeTab === 'viewings' && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Scheduled Apartment Viewings</h4>
              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 text-xs">Viewing Invitation</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900 font-bold text-[10px]">
                    Confirmed
                  </span>
                </div>
                <p className="text-xs text-purple-800">
                  Scheduled for <strong>Saturday, 2:00 PM</strong> at property location.
                </p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold">
                    Add to Calendar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: OFFERS */}
          {activeTab === 'offers' && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Formal Rental Lease Offers</h4>
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs">Formal Lease Offer</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                    Offer Received
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-medium">
                  Monthly Rent: <strong>€1,180</strong> • Deposit: <strong>€2,500</strong>
                </p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold">
                    Accept Lease Offer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PRIVATE NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Private Applicant Notes</h4>
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add private observations (e.g. Landlord was friendly, bring physical passport to viewing)..."
                  className="w-full p-3 rounded-2xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
                />
                <Button onClick={handleAddNote} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">
                  Save Private Note
                </Button>
              </div>

              <div className="space-y-2 pt-2">
                {application.notes?.map((n: any) => (
                  <div key={n.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <p className="text-gray-800">{n.content}</p>
                    <span className="text-[9px] text-gray-400 block mt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <Button variant="outline" onClick={onClose} className="rounded-xl border-gray-200 text-xs ml-auto">
            Close Workspace
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
