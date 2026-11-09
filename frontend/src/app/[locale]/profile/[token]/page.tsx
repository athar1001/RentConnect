'use client';

import { useState, useEffect, use } from 'react';
import { ShieldCheck, Lock, User, Briefcase, Users, Home, MapPin, Calendar, CheckCircle2, FileText, Sparkles, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function PublicProfilePage({ params }: { params: Promise<{ token: string; locale: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState<any>(null);

  const fetchPublicProfile = async (pw?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = pw
        ? `http://localhost:3000/public/profile/${token}?password=${encodeURIComponent(pw)}`
        : `http://localhost:3000/public/profile/${token}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Unable to access shared profile.');
        setLoading(false);
        return;
      }

      if (data.passwordRequired) {
        setPasswordRequired(true);
      } else {
        setPasswordRequired(false);
        setProfile(data.profile);
      }
    } catch (e) {
      setError('Failed to load profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicProfile();
  }, [token]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPublicProfile(password);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-sm font-medium text-gray-600">Loading secure Housing Identity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Access Restricted</h1>
          <p className="text-sm text-gray-600">{error}</p>
          <Logo textClassName="text-sm" />
        </div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4">
        <form onSubmit={handlePasswordSubmit} className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Protected Housing Identity</h1>
            <p className="text-xs text-gray-500">This applicant has password-protected their rental profile.</p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter profile password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-medium">
            Unlock Profile
          </Button>

          <div className="pt-2 text-center">
            <Logo textClassName="text-xs" />
          </div>
        </form>
      </div>
    );
  }

  const p = profile?.personalInfo || {};
  const h = profile?.householdInfo || {};
  const e = profile?.employmentInfo || {};
  const pref = profile?.preferences || {};

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-8 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Logo />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            Verified Housing Identity
          </span>
        </div>
      </header>

      {/* Main Profile Container */}
      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {/* Landlord Message Banner */}
        {profile?.customMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Message from Applicant</h3>
            <p className="text-sm text-emerald-950 italic">"{profile.customMessage}"</p>
          </div>
        )}

        {/* Hero Identity Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {p.firstName?.[0] || profile?.user?.fullName?.[0] || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {p.firstName ? `${p.firstName} ${p.lastName || ''}` : profile?.user?.fullName || 'Apartment Applicant'}
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">{e.position || 'Verified Applicant'} {e.employer ? `at ${e.employer}` : ''}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 font-medium">
                {p.currentCity && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {p.currentCity}</span>}
                {pref.moveInDate && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> Move-in: {new Date(pref.moveInDate).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
            <div className="text-center">
              <span className="text-2xl font-bold text-emerald-700">{profile?.completionScore || 100}%</span>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">Profile Score</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile?.biography && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3 text-emerald-700 font-bold text-sm">
              <Sparkles className="w-4 h-4" /> About the Applicant
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{profile.biography}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employment */}
          {e && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm border-b border-gray-100 pb-3">
                <Briefcase className="w-4 h-4 text-emerald-600" /> Employment & Income
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block mb-0.5">Employer</span>
                  <span className="font-semibold text-gray-900">{e.employer || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Position</span>
                  <span className="font-semibold text-gray-900">{e.position || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Status</span>
                  <span className="font-semibold text-gray-900">{e.employmentStatus || 'PERMANENT'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Net Monthly Income</span>
                  <span className="font-bold text-emerald-600 text-sm">€{e.monthlyNetIncome || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Household */}
          {h && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm border-b border-gray-100 pb-3">
                <Users className="w-4 h-4 text-purple-600" /> Household Composition
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block mb-0.5">Total Occupants</span>
                  <span className="font-semibold text-gray-900">{h.numberOfOccupants || 1} Person(s)</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Smoking Status</span>
                  <span className="font-semibold text-gray-900">{h.smokingStatus === 'NON_SMOKER' ? 'Non-Smoker' : 'Smoker'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Pets</span>
                  <span className="font-semibold text-gray-900">{h.hasPets ? `Yes (${h.petDetails || 'Owned'})` : 'No Pets'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Relationship</span>
                  <span className="font-semibold text-gray-900">{h.relationshipStatus || 'Single'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
