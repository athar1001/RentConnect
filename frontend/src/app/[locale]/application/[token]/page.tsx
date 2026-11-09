'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import {
  FileText,
  Lock,
  Download,
  AlertCircle,
  Eye,
  CheckCircle2,
  Calendar,
  Euro,
  MapPin,
  Clock,
  User,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandlordPortalPage({ params }: { params: Promise<{ token: string; locale: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [data, setData] = useState<any>(null);

  // Fetch Public Profile Package
  const fetchPackage = async (pwd?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = pwd ? `?password=${encodeURIComponent(pwd)}` : '';
      const res = await fetch(`http://localhost:3000/public/application/${token}${query}`);
      const result = await res.json();

      if (!res.ok) {
        setError(result.message || 'Failed to load application package.');
        return;
      }

      setData(result);
    } catch (e) {
      setError('A network error occurred while fetching the application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [token]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPackage(password);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Password Protection Gate
  if (data?.passwordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Password Required</h2>
            <p className="text-xs text-gray-500">This applicant package is protected with high-level access security.</p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 font-bold">
              Access Application
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Access Denied</h2>
          <p className="text-xs text-gray-500">{error || 'This application share link has expired or was revoked.'}</p>
        </div>
      </div>
    );
  }

  const { apartment, applicantName, message, profile, documents: docPackage, sharingConfig } = data;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Banner Indicator */}
      <div className="bg-emerald-950 text-emerald-100 py-3.5 px-6 flex items-center justify-center gap-2 text-xs font-semibold">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Verified WohnBoard Digital Application Package. Reference: {sharingConfig.referenceNumber}</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10 space-y-8">
        
        {/* Main Header card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{applicantName}</h1>
            <p className="text-xs text-gray-400">Applied on {new Date(sharingConfig.appliedAt).toLocaleDateString()}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              Verified Candidate
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Intro message & docs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Intro letter */}
            {message && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Candidate Message</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                  {message.content}
                </p>
              </div>
            )}

            {/* Document package list */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Application Documents</h3>
                <p className="text-xs text-gray-500 mt-1">Verified candidate credentials package</p>
              </div>

              {sharingConfig.watermarkDocs && (
                <div className="bg-amber-50 text-amber-800 text-[11px] font-semibold p-3.5 rounded-xl border border-amber-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Security Watermark Enabled: All documents are stamped for landlord screening purposes only.</span>
                </div>
              )}

              {docPackage.length === 0 ? (
                <p className="text-xs text-gray-400">No documents attached.</p>
              ) : (
                <div className="space-y-3">
                  {docPackage.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-800 block">{doc.title}</span>
                          <span className="text-[10px] text-gray-400 uppercase">{doc.type}</span>
                        </div>
                      </div>

                      <div>
                        {sharingConfig.allowDownloads ? (
                          <a href={doc.fileUrl} download target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" className="border-gray-200 rounded-xl text-xs gap-1.5 hover:bg-gray-100">
                              <Download className="w-3.5 h-3.5" />
                              Download PDF
                            </Button>
                          </a>
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-400 italic bg-gray-100 px-3 py-1.5 rounded-xl">
                            Downloads Disabled
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column: Identity credentials info */}
          <div className="space-y-8">
            
            {/* Target Apartment summary */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Applied Apartment</h3>
              <div className="text-xs space-y-2 text-gray-700">
                <p className="font-bold text-gray-950 text-sm">{apartment.title}</p>
                <p className="text-gray-500">{apartment.address}</p>
                <div className="pt-2 grid grid-cols-2 gap-2 font-semibold">
                  <div>Warm Rent: €{apartment.warmRent || apartment.rentPrice}</div>
                  <div>Rooms: {apartment.rooms} Rooms</div>
                </div>
              </div>
            </div>

            {/* Housing Identity credentials checklist */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Housing Identity Credentials</h3>

              <div className="space-y-4 text-xs">
                {/* Personal Info */}
                {profile.personalInfo && (
                  <div className="space-y-2 border-b border-gray-50 pb-3">
                    <span className="font-bold text-gray-900 block text-[11px] uppercase tracking-wider">Personal Details</span>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <div>Name: <span className="font-semibold text-gray-800">{profile.personalInfo.firstName} {profile.personalInfo.lastName}</span></div>
                      <div>Phone: <span className="font-semibold text-gray-800">{profile.personalInfo.phone || 'N/A'}</span></div>
                      <div className="col-span-2">Current Address: <span className="font-semibold text-gray-800">{profile.personalInfo.currentAddress || 'N/A'}</span></div>
                    </div>
                  </div>
                )}

                {/* Employment & Income */}
                {profile.employmentInfo && (
                  <div className="space-y-2 border-b border-gray-50 pb-3">
                    <span className="font-bold text-gray-900 block text-[11px] uppercase tracking-wider">Employment & Income</span>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <div>Position: <span className="font-semibold text-gray-800">{profile.employmentInfo.position || 'N/A'}</span></div>
                      <div>Employer: <span className="font-semibold text-gray-800">{profile.employmentInfo.employer || 'N/A'}</span></div>
                      <div className="col-span-2">Net Income: <span className="font-bold text-emerald-600">€{profile.employmentInfo.monthlyNetIncome || 'N/A'}</span></div>
                    </div>
                  </div>
                )}

                {/* Rental History */}
                {profile.rentalHistory && (
                  <div className="space-y-2 border-b border-gray-50 pb-3">
                    <span className="font-bold text-gray-900 block text-[11px] uppercase tracking-wider">Rental History</span>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <div>Prev landlord: <span className="font-semibold text-gray-800">{profile.rentalHistory.previousLandlord || 'N/A'}</span></div>
                      <div>Contact: <span className="font-semibold text-gray-800">{profile.rentalHistory.previousLandlordContact || 'N/A'}</span></div>
                    </div>
                  </div>
                )}

                {/* Guarantor Info */}
                {profile.guarantorInfo && (
                  <div className="space-y-2">
                    <span className="font-bold text-gray-900 block text-[11px] uppercase tracking-wider">Guarantor Records</span>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <div>Guarantor Name: <span className="font-semibold text-gray-800">{profile.guarantorInfo.fullName || 'N/A'}</span></div>
                      <div>Income: <span className="font-bold text-emerald-600">€{profile.guarantorInfo.monthlyNetIncome || 'N/A'}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
