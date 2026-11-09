'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  ArrowLeft,
  User,
  Briefcase,
  Home,
  FileText,
  Calendar,
  MessageSquare,
  Lock,
  Download,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  Euro
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineCenterpiece } from '@/components/applications/TimelineCenterpiece';

export default function LandlordApplicationInspectorPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;
  const t = useTranslations('Landlord');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const [isDocReqModalOpen, setIsDocReqModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Form states
  const [viewingTitle, setViewingTitle] = useState('Apartment Viewing');
  const [viewingDate, setViewingDate] = useState('2026-08-01T14:00');
  const [viewingLocation, setViewingLocation] = useState('At Property Address');

  const [docReqType, setDocReqType] = useState('Latest Payslip');
  const [docReqDesc, setDocReqDesc] = useState('Please provide your latest 3 months payslips.');

  const [offerRentPrice, setOfferRentPrice] = useState('1250');
  const [offerMoveInDate, setOfferMoveInDate] = useState('2026-09-01');

  const [newNote, setNewNote] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const fetchApplicationDetails = async () => {
    try {
      const res = await fetch(`http://localhost:3000/landlords/applications/${applicationId}`);
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error('Failed to load application inspector data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const res = await fetch('http://localhost:3000/landlords/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, content: newNote }),
      });
      if (res.ok) {
        setNewNote('');
        fetchApplicationDetails();
      }
    } catch (e) {
      console.error('Failed to save private note:', e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await fetch('http://localhost:3000/landlords/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, content: newMessage }),
      });
      if (res.ok) {
        setNewMessage('');
        fetchApplicationDetails();
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  const handleScheduleViewing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/landlords/viewings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: data?.application?.apartmentId || 'prop-id',
          applicationId,
          title: viewingTitle,
          scheduledAt: viewingDate,
          location: viewingLocation,
        }),
      });
      if (res.ok) {
        setIsViewingModalOpen(false);
        fetchApplicationDetails();
      }
    } catch (e) {
      console.error('Failed to schedule viewing:', e);
    }
  };

  const handleRequestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/landlords/applications/${applicationId}/document-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestedType: docReqType,
          description: docReqDesc,
        }),
      });
      if (res.ok) {
        setIsDocReqModalOpen(false);
        fetchApplicationDetails();
      }
    } catch (e) {
      console.error('Failed to request document:', e);
    }
  };

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/landlords/applications/${applicationId}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentPrice: parseFloat(offerRentPrice),
          moveInDate: offerMoveInDate,
        }),
      });
      if (res.ok) {
        setIsOfferModalOpen(false);
        fetchApplicationDetails();
      }
    } catch (e) {
      console.error('Failed to send offer:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const app = data?.application;
  const profile = data?.filteredProfile;
  const notes = data?.landlordNotes || [];
  const messages = data?.messages || [];

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Back button */}
      <Link href="/landlord/applications" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Applications Inbox
      </Link>

      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{app?.user?.fullName || 'Applicant Candidate'}</h1>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              {app?.status}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Target Property: <strong className="text-gray-900">{app?.apartment?.title}</strong> • Reference: <span className="font-mono">{app?.referenceNumber}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsDocReqModalOpen(true)}
            variant="outline"
            className="border-gray-200 text-xs font-semibold rounded-xl"
          >
            {t('applications.requestDocument')}
          </Button>
          <Button
            onClick={() => setIsViewingModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/20"
          >
            <Calendar className="w-4 h-4 mr-1.5" />
            {t('applications.scheduleViewing')}
          </Button>
          <Button
            onClick={() => setIsOfferModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20"
          >
            <Euro className="w-4 h-4 mr-1.5" />
            Send Lease Offer
          </Button>
        </div>
      </div>

      {/* Centerpiece Application Timeline */}
      <TimelineCenterpiece
        applicationId={applicationId}
        mode="LANDLORD"
        actorName="Landlord Management"
        onRefresh={fetchApplicationDetails}
      />

      {/* Housing Identity & Document Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Profile & Docs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Message */}
          {app?.message && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cover Introduction</h3>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                {app.message.content}
              </p>
            </div>
          )}

          {/* Housing Identity Sections */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Housing Identity Details
              </h3>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                Identity Score: 92% Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50/70 space-y-1.5 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Employment & Income</span>
                <p className="font-bold text-gray-900">{profile?.employmentInfo?.position || 'Software Engineer'}</p>
                <p className="text-gray-500">{profile?.employmentInfo?.employer || 'Tech Solutions GmbH'}</p>
                <p className="text-emerald-600 font-extrabold pt-1">€{profile?.employmentInfo?.monthlyNetIncome || '3,800'} / month net</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/70 space-y-1.5 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Household Composition</span>
                <p className="font-bold text-gray-900">{profile?.householdInfo?.numberOfOccupants || '1'} Tenant(s)</p>
                <p className="text-gray-500">Pets: {profile?.householdInfo?.hasPets ? 'Yes' : 'No pets'}</p>
                <p className="text-gray-500">Smoking: Non-smoker</p>
              </div>
            </div>
          </div>

          {/* Attached Document Package */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-4">
              <FileText className="w-4 h-4 text-emerald-600" />
              Attached Document Package ({app?.documents?.length || 0})
            </h3>

            <div className="space-y-3">
              {app?.documents?.map((docItem: any) => (
                <div key={docItem.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-emerald-600 font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">{docItem.document?.title || 'Document'}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">{docItem.document?.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                      Watermarked & Protected
                    </span>
                    <Button variant="outline" className="border-gray-200 text-xs rounded-xl p-2 h-auto">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Private Landlord Notes & Messages */}
        <div className="space-y-6">
          {/* Private Landlord Notes */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                Private Internal Notes
              </h3>
              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                Landlord Only
              </span>
            </div>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write private team note (e.g. Excellent impression, verified payslips)..."
                className="w-full p-3 rounded-2xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20"
              />
              <Button type="submit" className="w-full bg-slate-900 text-white rounded-xl text-xs font-semibold py-2">
                Save Private Note
              </Button>
            </form>

            <div className="space-y-2 pt-2">
              {notes.map((n: any) => (
                <div key={n.id} className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 text-xs space-y-1">
                  <p className="text-gray-800 font-medium">{n.content}</p>
                  <span className="text-[10px] text-gray-400 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Messages */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-xs flex items-center gap-2 border-b border-gray-100 pb-3">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              Applicant Messaging Thread
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {messages.map((m: any) => (
                <div key={m.id} className={`p-3 rounded-xl text-xs ${m.senderType === 'LANDLORD' ? 'bg-emerald-50 text-emerald-900 ml-4' : 'bg-gray-100 text-gray-800 mr-4'}`}>
                  <span className="font-bold block text-[10px] uppercase text-gray-500">{m.senderName}</span>
                  <p>{m.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send message to candidate..."
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <Button type="submit" className="bg-emerald-600 text-white rounded-xl p-2">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Schedule Viewing Modal */}
      {isViewingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Schedule Viewing Invitation
            </h2>

            <form onSubmit={handleScheduleViewing} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-600 mb-1">Viewing Event Title</label>
                <input
                  type="text"
                  required
                  value={viewingTitle}
                  onChange={(e) => setViewingTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={viewingDate}
                  onChange={(e) => setViewingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Viewing Location</label>
                <input
                  type="text"
                  required
                  value={viewingLocation}
                  onChange={(e) => setViewingLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsViewingModalOpen(false)} className="rounded-xl border-gray-200">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 text-white rounded-xl">
                  Confirm Viewing Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Request Modal */}
      {isDocReqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Request Additional Document
            </h2>

            <form onSubmit={handleRequestDocument} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-600 mb-1">Document Type</label>
                <select
                  value={docReqType}
                  onChange={(e) => setDocReqType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="Latest Payslip">Latest Payslip</option>
                  <option value="Updated SCHUFA">Updated SCHUFA Credit Record</option>
                  <option value="Employment Guarantee">Employment Guarantee</option>
                  <option value="Guarantor Record">Guarantor Document</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Instruction Details</label>
                <textarea
                  rows={3}
                  value={docReqDesc}
                  onChange={(e) => setDocReqDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDocReqModalOpen(false)} className="rounded-xl border-gray-200">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 text-white rounded-xl">
                  Send Request to Applicant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Lease Offer Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Euro className="w-5 h-5 text-emerald-600" />
              Send Formal Lease Offer
            </h2>

            <form onSubmit={handleSendOffer} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-600 mb-1">Monthly Warm Rent (€)</label>
                <input
                  type="number"
                  required
                  value={offerRentPrice}
                  onChange={(e) => setOfferRentPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Proposed Move-In Date</label>
                <input
                  type="date"
                  required
                  value={offerMoveInDate}
                  onChange={(e) => setOfferMoveInDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOfferModalOpen(false)} className="rounded-xl border-gray-200">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 text-white rounded-xl">
                  Dispatch Formal Lease Offer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
