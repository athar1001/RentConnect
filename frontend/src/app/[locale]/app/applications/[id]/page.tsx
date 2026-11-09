'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Lock,
  Copy,
  Check,
  Eye,
  Trash2,
  Share2,
  Trash,
  Plus,
  Send,
  AlertCircle,
  FileCheck,
  User,
  Sliders,
  CheckCircle2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineCenterpiece } from '@/components/applications/TimelineCenterpiece';

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;
  
  const t = useTranslations('Applications');
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  // Action states
  const [copied, setCopied] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newReminder, setNewReminder] = useState({ title: '', description: '', dateTime: '' });
  
  // Sharing config state
  const [shareConfig, setShareConfig] = useState({
    password: '',
    maxViews: '',
    expiresInDays: 14,
    allowDownloads: true,
    watermarkDocs: false,
  });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Simulation state
  const [simulationDocType, setSimulationDocType] = useState('Updated SCHUFA');

  const fetchDetails = async () => {
    try {
      const [appRes, docsRes] = await Promise.all([
        fetch(`http://localhost:3000/applications/${applicationId}`, { credentials: 'include' }),
        fetch('http://localhost:3000/documents', { credentials: 'include' }),
        ]);

      if (appRes.ok) {
        const data = await appRes.json();
        setApp(data);
        if (data.sharing && !data.sharing.revoked) {
          setGeneratedLink(`${window.location.origin}/application/${data.sharing.token}`);
        } else {
          setGeneratedLink(null);
        }
      }
      if (docsRes.ok) setDocuments(await docsRes.json());
    } catch (e) {
      console.error('Failed to load application details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [applicationId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const res = await fetch(`http://localhost:3000/applications/${applicationId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newNote }),
      });

      if (res.ok) {
        setNewNote('');
        fetchDetails();
      }
    } catch (e) {
      console.error('Failed to add note:', e);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.title.trim() || !newReminder.dateTime) return;

    try {
      const res = await fetch(`http://localhost:3000/applications/${applicationId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newReminder),
      });

      if (res.ok) {
        setNewReminder({ title: '', description: '', dateTime: '' });
        fetchDetails();
      }
    } catch (e) {
      console.error('Failed to add reminder:', e);
    }
  };

  const handleCreateSharing = async () => {
    try {
      const payload = {
        password: shareConfig.password,
        maxViews: shareConfig.maxViews ? parseInt(shareConfig.maxViews, 10) : undefined,
        expiresInDays: shareConfig.expiresInDays,
        allowDownloads: shareConfig.allowDownloads,
        watermarkDocs: shareConfig.watermarkDocs,
      };

      const res = await fetch(`http://localhost:3000/applications/${applicationId}/sharing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchDetails();
      }
    } catch (e) {
      console.error('Failed to generate sharing credentials:', e);
    }
  };

  const handleRevokeSharing = async () => {
    try {
      const res = await fetch(`http://localhost:3000/applications/${applicationId}/sharing`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchDetails();
      }
    } catch (e) {
      console.error('Failed to revoke sharing:', e);
    }
  };

  const handleFulfillRequest = async (requestId: string, docId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/applications/${applicationId}/document-requests/${requestId}/fulfill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ documentId: docId }),
      });

      if (res.ok) {
        fetchDetails();
      }
    } catch (e) {
      console.error('Failed to fulfill request:', e);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm(t('withdrawConfirm'))) return;

    try {
      const res = await fetch(`http://localhost:3000/applications/${applicationId}/withdraw`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        fetchDetails();
      }
    } catch (e) {
      console.error('Failed to withdraw application:', e);
    }
  };

  // Simulation: Trigger landlord requesting a document
  const triggerSimulationRequest = async () => {
    try {
      const res = await fetch(`http://localhost:3000/applications/${applicationId}/document-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          requestedType: simulationDocType,
          description: `Please upload/attach your latest ${simulationDocType} for landlord verification.`,
        }),
      });

      if (res.ok) {
        fetchDetails();
      }
    } catch (e) {
      console.error('Simulation error:', e);
    }
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Back button */}
      <Link href="/app/applications" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Applications
      </Link>

      {/* Header Info */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold tracking-wider text-gray-400 bg-gray-50 px-2.5 py-1 rounded">
              {app.referenceNumber}
            </span>
            <span className="text-xs font-bold text-gray-400">
              Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Not Sent'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-2">{app.apartment.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{app.apartment.address}</p>
        </div>

        <div className="flex items-center gap-3">
          {app.status !== 'WITHDRAWN' && (
            <Button
              variant="outline"
              onClick={handleWithdraw}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl px-5"
            >
              Withdraw Application
            </Button>
          )}
          <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {app.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle: Sharing & Timeline details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Share Links configuration */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <Share2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Secure Sharing Credentials</h3>
                <p className="text-xs text-gray-500">Configure access policies for your landlord package</p>
              </div>
            </div>

            {/* Generated share link banner */}
            {generatedLink ? (
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-900">Secure Landlord Link</span>
                  <div className="flex items-center gap-3">
                    <button onClick={copyToClipboard} className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900">
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button onClick={handleRevokeSharing} className="text-red-600 hover:text-red-800">
                      Revoke
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full px-3 py-2 text-xs font-mono bg-white rounded-lg border border-emerald-200 text-emerald-900"
                />
                <div className="flex items-center gap-4 text-[10px] text-emerald-700">
                  <span>Views: {app.sharing?.viewCount || 0}</span>
                  {app.sharing?.expiresAt && <span>Expires: {new Date(app.sharing.expiresAt).toLocaleDateString()}</span>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Expires in (Days)</label>
                  <select
                    value={shareConfig.expiresInDays}
                    onChange={(e) => setShareConfig({ ...shareConfig, expiresInDays: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"
                  >
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Password Protection</label>
                  <input
                    type="password"
                    placeholder="Optional password..."
                    value={shareConfig.password}
                    onChange={(e) => setShareConfig({ ...shareConfig, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                  />
                </div>
                <div className="col-span-2 flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareConfig.allowDownloads}
                      onChange={(e) => setShareConfig({ ...shareConfig, allowDownloads: e.target.checked })}
                      className="rounded border-gray-300 text-emerald-600"
                    />
                    Allow landords to download PDFs
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareConfig.watermarkDocs}
                      onChange={(e) => setShareConfig({ ...shareConfig, watermarkDocs: e.target.checked })}
                      className="rounded border-gray-300 text-emerald-600"
                    />
                    Watermark documents
                  </label>
                </div>
                <Button onClick={handleCreateSharing} className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5">
                  Generate Shareable Landlord Link
                </Button>
              </div>
            )}
          </div>

          {/* Timeline Centerpiece - Central Hero Workspace */}
          <TimelineCenterpiece
            applicationId={applicationId}
            mode="APPLICANT"
            actorName="Applicant"
            onRefresh={fetchDetails}
          />

          {/* Landlord Document Requests Fulfillments */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Landlord Document Requests</h3>
                <p className="text-xs text-gray-500">Provide any additional documents requested by the landlord</p>
              </div>
            </div>

            {/* List requests */}
            {app.documentRequests?.length === 0 ? (
              <p className="text-xs text-gray-400">No pending document requests.</p>
            ) : (
              <div className="space-y-4">
                {app.documentRequests.map((req: any) => (
                  <div key={req.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">{req.requestedType}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.isFulfilled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {req.isFulfilled ? 'Fulfilled' : 'Pending Upload'}
                      </span>
                    </div>
                    {req.description && <p className="text-xs text-gray-500">{req.description}</p>}
                    
                    {!req.isFulfilled && (
                      <div className="flex gap-2">
                        <select
                          id={`fulfill-select-${req.id}`}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none"
                        >
                          {documents.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.title}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          onClick={() => {
                            const sel = document.getElementById(`fulfill-select-${req.id}`) as HTMLSelectElement;
                            if (sel) handleFulfillRequest(req.id, sel.value);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs"
                        >
                          Fulfill Request
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Simulated Landlord Action Tool */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">Simulate Landlord request</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Requested document name..."
                  value={simulationDocType}
                  onChange={(e) => setSimulationDocType(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none w-full"
                />
                <Button onClick={triggerSimulationRequest} variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 text-xs shrink-0 rounded-xl">
                  Simulate Landlord Request
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Private notes & Reminders */}
        <div className="space-y-8">
          
          {/* Notes Log */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-4">Private Application Notes</h3>
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                placeholder="Write a private log (e.g. friendly landlord, apartment looked tidy...)"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs py-2">
                Save Note
              </Button>
            </form>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {app.notes?.map((n: any) => (
                <div key={n.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <p className="text-gray-700">{n.content}</p>
                  <span className="text-[9px] text-gray-400 block mt-1">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reminders scheduler */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-4">Application Reminders</h3>
            <form onSubmit={handleAddReminder} className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-500">Reminder Title</label>
                <input
                  type="text"
                  placeholder="e.g. Call landlord to follow up..."
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  value={newReminder.dateTime}
                  onChange={(e) => setNewReminder({ ...newReminder, dateTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none"
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs py-2">
                Set Reminder
              </Button>
            </form>

            <div className="space-y-2">
              {app.reminders?.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="font-semibold text-gray-800 block">{r.title}</span>
                    <span className="text-[9px] text-gray-400">
                      {new Date(r.dateTime).toLocaleString()}
                    </span>
                  </div>
                  {r.completed && <span className="text-emerald-600 font-bold">Done</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
