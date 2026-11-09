'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Download,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandlordCalendarPage() {
  const t = useTranslations('Landlord');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/landlords/applications?status=VIEWING_SCHEDULED');
        if (res.ok) setApplications(await res.json());
      } catch (e) {
        console.error('Failed to load viewing calendar data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Viewing Management Calendar</h1>
            <p className="text-xs text-gray-500 mt-0.5">Track upcoming viewing appointments and export .ics invitations.</p>
          </div>
        </div>
      </div>

      {/* Viewing Events List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-500 font-medium">No viewing appointments currently scheduled.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-gray-900">{app.user?.fullName || 'Applicant Candidate'}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                    VIEWING SCHEDULED
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    {app.apartment?.title}
                  </p>
                  <p className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {app.viewingAt ? new Date(app.viewingAt).toLocaleString() : 'Date Pending'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a href={`http://localhost:3000/landlords/viewings/${app.id}/ics`} download>
                  <Button variant="outline" className="border-gray-200 text-xs font-semibold rounded-xl gap-2 hover:bg-gray-50">
                    <Download className="w-3.5 h-3.5" />
                    Export .ICS Calendar Event
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
