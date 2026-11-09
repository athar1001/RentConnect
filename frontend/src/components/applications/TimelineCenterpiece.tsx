'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Building2,
  MessageSquare,
  Send,
  Upload,
  UserCheck,
  Check,
  X,
  Euro,
  HelpCircle,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineCenterpieceProps {
  applicationId: string;
  mode: 'APPLICANT' | 'LANDLORD';
  actorName?: string;
  onRefresh?: () => void;
}

export function TimelineCenterpiece({
  applicationId,
  mode,
  actorName = 'User',
  onRefresh,
}: TimelineCenterpieceProps) {
  const t = useTranslations('Workflow');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Active commenting timeline ID
  const [activeCommentTimelineId, setActiveCommentTimelineId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Fulfill modal / state
  const [fulfillingReqId, setFulfillingReqId] = useState<string | null>(null);

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`http://localhost:3000/applications/${applicationId}/timeline`);
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error('Failed to load timeline centerpiece feed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [applicationId]);

  const handleAddComment = async (timelineId: string) => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`http://localhost:3000/applications/timeline/${timelineId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderType: mode,
          senderName: actorName,
          content: commentText,
        }),
      });

      if (res.ok) {
        setCommentText('');
        fetchTimeline();
      }
    } catch (e) {
      console.error('Failed to add comment:', e);
    }
  };

  const handleViewingRSVP = async (viewingId: string, action: 'ACCEPT' | 'DECLINE' | 'RESCHEDULE') => {
    try {
      const res = await fetch(`http://localhost:3000/applications/${applicationId}/viewings/${viewingId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchTimeline();
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      console.error('Failed to update viewing RSVP:', e);
    }
  };

  const handleOfferResponse = async (offerId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      const res = await fetch(`http://localhost:3000/applications/${applicationId}/offers/${offerId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchTimeline();
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      console.error('Failed to respond to lease offer:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const timelineItems = data?.timeline || [];

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
      {/* Centerpiece Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            {t('timelineTitle')}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{t('timelineSubtitle')}</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
          Status: {data?.status}
        </span>
      </div>

      {/* Timeline Stream */}
      {timelineItems.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-400 border border-dashed rounded-2xl">
          No activity timeline events recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
          {timelineItems.map((item: any) => {
            const isSystem = item.eventType === 'SYSTEM';
            const isDocReq = item.eventType === 'DOCUMENT_REQUEST';
            const isViewing = item.eventType === 'VIEWING_INVITATION';
            const isOffer = item.eventType === 'OFFER';

            let eventIcon = <Clock className="w-3.5 h-3.5 text-emerald-600" />;
            if (isDocReq) eventIcon = <FileText className="w-3.5 h-3.5 text-blue-600" />;
            if (isViewing) eventIcon = <Calendar className="w-3.5 h-3.5 text-purple-600" />;
            if (isOffer) eventIcon = <Euro className="w-3.5 h-3.5 text-amber-600" />;

            return (
              <div key={item.id} className="relative group">
                {/* Bullet node */}
                <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center shadow-sm">
                  {eventIcon}
                </div>

                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 space-y-4 hover:bg-white hover:border-gray-200 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900">{item.notes || item.status}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-700 uppercase">
                        {item.actor || 'SYSTEM'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Contextual Interactive Payload Cards */}

                  {/* 1. Viewing Invitation Card */}
                  {isViewing && data?.viewings?.[0] && (
                    <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-purple-900">Viewing Invitation</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          {data.viewings[0].status}
                        </span>
                      </div>
                      <p className="text-xs text-purple-800">
                        Scheduled for <strong>{new Date(data.viewings[0].scheduledAt).toLocaleString()}</strong> at {data.viewings[0].location || 'Property Address'}
                      </p>

                      {mode === 'APPLICANT' && data.viewings[0].status === 'SCHEDULED' && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            onClick={() => handleViewingRSVP(data.viewings[0].id, 'ACCEPT')}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs py-1 px-3 h-auto"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            {t('acceptViewing')}
                          </Button>
                          <Button
                            onClick={() => handleViewingRSVP(data.viewings[0].id, 'DECLINE')}
                            variant="outline"
                            className="border-purple-200 text-purple-900 rounded-xl text-xs py-1 px-3 h-auto"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            {t('declineViewing')}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Formal Lease Offer Card */}
                  {isOffer && data?.offers?.[0] && (
                    <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-900">Formal Lease Offer</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {data.offers[0].status}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 font-medium">
                        Monthly Rent: <strong className="text-emerald-700">€{data.offers[0].rentPrice}</strong> • Move-in: {new Date(data.offers[0].moveInDate).toLocaleDateString()}
                      </p>

                      {mode === 'APPLICANT' && data.offers[0].status === 'SENT' && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            onClick={() => handleOfferResponse(data.offers[0].id, 'ACCEPT')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs py-1 px-3 h-auto"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            {t('acceptOffer')}
                          </Button>
                          <Button
                            onClick={() => handleOfferResponse(data.offers[0].id, 'DECLINE')}
                            variant="outline"
                            className="border-amber-200 text-amber-900 rounded-xl text-xs py-1 px-3 h-auto"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            {t('declineOffer')}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeline Event Thread Comments */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    {item.comments?.map((c: any) => (
                      <div key={c.id} className="text-xs bg-white p-3 rounded-xl border border-gray-100 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-gray-800">{c.senderName} ({c.senderType})</span>
                          <span className="text-gray-400">{new Date(c.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-gray-700">{c.content}</p>
                      </div>
                    ))}

                    {/* Comment Input */}
                    {activeCommentTimelineId === item.id ? (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write contextual comment under this event..."
                          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <Button
                          onClick={() => handleAddComment(item.id)}
                          className="bg-emerald-600 text-white rounded-xl text-xs px-3 py-1.5 h-auto"
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveCommentTimelineId(item.id)}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 pt-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {t('addComment')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
