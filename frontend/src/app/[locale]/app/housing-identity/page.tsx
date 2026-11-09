'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  User,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Lock,
  Copy,
  Check,
  Eye,
  Trash2,
  Sparkles,
  Briefcase,
  Users,
  Home,
  Sliders,
  History,
  ShieldAlert,
  FileText,
  Clock,
  QrCode,
  Calendar,
  DollarSign,
  MapPin,
  CheckSquare,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HousingIdentityPage() {
  const t = useTranslations('HousingIdentity');

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'failed' | null>(null);

  // Form states
  const [personal, setPersonal] = useState<any>({});
  const [household, setHousehold] = useState<any>({});
  const [employment, setEmployment] = useState<any>({});
  const [preferences, setPreferences] = useState<any>({});
  const [rentalHistory, setRentalHistory] = useState<any>({});
  const [guarantor, setGuarantor] = useState<any>({});
  const [bio, setBio] = useState<any>({});

  // Share Link Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareConfig, setShareConfig] = useState({
    password: '',
    maxViews: '',
    expiresInDays: 14,
    customMessage: '',
    permissions: {
      personalInfo: true,
      householdInfo: true,
      employmentInfo: true,
      preferences: true,
      rentalHistory: true,
      guarantorInfo: true,
    },
  });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeShareLinks, setActiveShareLinks] = useState<any[]>([]);

  // Fetch Housing Identity Data
  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:3000/housing-identity', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        setPersonal(data.personalInfo || {});
        setHousehold(data.householdInfo || {});
        setEmployment(data.employmentInfo || {});
        setPreferences(data.preferences || {});
        setRentalHistory(data.rentalHistory || {});
        setGuarantor(data.guarantorInfo || {});
        setBio({ biography: data.biography || '', occupationSummary: data.occupationSummary || '' });
      }
    } catch (e) {
      console.error('Failed to fetch Housing Identity profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchShareLinks = async () => {
    try {
      const res = await fetch('http://localhost:3000/housing-identity/share', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setActiveShareLinks(data);
      }
    } catch (e) {
      console.error('Failed to fetch share links:', e);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchShareLinks();
  }, []);

  // Generic Auto-Save function
  const autoSaveSection = async (sectionPath: string, payload: any) => {
    setSaveStatus('saving');
    try {
      const res = await fetch(`http://localhost:3000/housing-identity/${sectionPath}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfileData(updated);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('failed');
      }
    } catch (e) {
      console.error(`Failed to auto-save ${sectionPath}:`, e);
      setSaveStatus('failed');
    }
  };

  // Share Link Handler
  const handleGenerateShareLink = async () => {
    try {
      const payload = {
        password: shareConfig.password,
        maxViews: shareConfig.maxViews ? parseInt(shareConfig.maxViews, 10) : undefined,
        expiresInDays: shareConfig.expiresInDays,
        customMessage: shareConfig.customMessage,
        permissionsJson: JSON.stringify(shareConfig.permissions),
      };

      const res = await fetch('http://localhost:3000/housing-identity/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const fullUrl = `${window.location.origin}/profile/${data.token}`;
        setGeneratedLink(fullUrl);
        fetchShareLinks();
      }
    } catch (e) {
      console.error('Failed to generate share link:', e);
    }
  };

  const handleRevokeShareLink = async (linkId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/housing-identity/share/${linkId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchShareLinks();
      }
    } catch (e) {
      console.error('Failed to revoke link:', e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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

  const score = profileData?.completionScore || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Auto Save Banner Indicator */}
      <div className="fixed bottom-6 right-6 z-50">
        {saveStatus === 'saving' && (
          <div className="bg-white/90 backdrop-blur border border-emerald-100 shadow-lg px-4 py-2 rounded-full flex items-center gap-2 text-sm text-emerald-700 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            {t('saving')}
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="bg-emerald-600 text-white shadow-lg px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium animate-in fade-in duration-300">
            <Check className="w-4 h-4" />
            {t('saved')}
          </div>
        )}
        {saveStatus === 'failed' && (
          <div className="bg-red-600 text-white shadow-lg px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium animate-in fade-in duration-300">
            <AlertCircle className="w-4 h-4" />
            {t('failed')}
          </div>
        )}
      </div>

      {/* Main Header Card */}
      <div className="bg-gradient-to-br from-white via-[#FAF9F6] to-emerald-50/30 border border-gray-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {personal.firstName?.[0] || 'U'}
                {personal.lastName?.[0] || ''}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {personal.firstName ? `${personal.firstName} ${personal.lastName || ''}` : t('title')}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('verificationBadge')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 max-w-xl">
                {t('subtitle')}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                {personal.currentCity && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {personal.currentCity}
                  </span>
                )}
                {preferences.moveInDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Move-in: {new Date(preferences.moveInDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Score Ring */}
            <div className="flex items-center gap-3 bg-white/80 border border-gray-100 px-4 py-2.5 rounded-2xl shadow-sm">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-600 transition-all duration-1000 ease-out"
                    strokeDasharray={`${score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-gray-900">{score}%</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{t('profileScore')}</p>
                <p className="text-[11px] text-gray-500">Completeness</p>
              </div>
            </div>

            <Button
              onClick={() => setIsShareModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium px-5 py-6 shadow-sm gap-2"
            >
              <Share2 className="w-4 h-4" />
              {t('shareProfile')}
            </Button>
          </div>
        </div>
      </div>

      {/* Grid of Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 1. Personal Information Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{t('sections.personal')}</h2>
              <p className="text-xs text-gray-500">Contact details and address</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.firstName')}</label>
                <input
                  type="text"
                  value={personal.firstName || ''}
                  onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
                  onBlur={() => autoSaveSection('personal', personal)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.lastName')}</label>
                <input
                  type="text"
                  value={personal.lastName || ''}
                  onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
                  onBlur={() => autoSaveSection('personal', personal)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.phone')}</label>
                <input
                  type="text"
                  value={personal.phone || ''}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  onBlur={() => autoSaveSection('personal', personal)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.email')}</label>
                <input
                  type="email"
                  value={personal.email || ''}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  onBlur={() => autoSaveSection('personal', personal)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.currentAddress')}</label>
                <input
                  type="text"
                  value={personal.currentAddress || ''}
                  onChange={(e) => setPersonal({ ...personal, currentAddress: e.target.value })}
                  onBlur={() => autoSaveSection('personal', personal)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.currentCity')}</label>
                <input
                  type="text"
                  value={personal.currentCity || ''}
                  onChange={(e) => setPersonal({ ...personal, currentCity: e.target.value })}
                  onBlur={() => autoSaveSection('personal', personal)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Employment & Income Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{t('sections.employment')}</h2>
              <p className="text-xs text-gray-500">Job position & net monthly earnings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.employer')}</label>
                <input
                  type="text"
                  value={employment.employer || ''}
                  onChange={(e) => setEmployment({ ...employment, employer: e.target.value })}
                  onBlur={() => autoSaveSection('employment', employment)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.position')}</label>
                <input
                  type="text"
                  value={employment.position || ''}
                  onChange={(e) => setEmployment({ ...employment, position: e.target.value })}
                  onBlur={() => autoSaveSection('employment', employment)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.employmentStatus')}</label>
                <select
                  value={employment.employmentStatus || 'PERMANENT'}
                  onChange={(e) => {
                    const updated = { ...employment, employmentStatus: e.target.value };
                    setEmployment(updated);
                    autoSaveSection('employment', updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                >
                  <option value="PERMANENT">{t('fields.permanent')}</option>
                  <option value="TEMPORARY">{t('fields.temporary')}</option>
                  <option value="STUDENT">{t('fields.student')}</option>
                  <option value="SELF_EMPLOYED">{t('fields.selfEmployed')}</option>
                  <option value="UNEMPLOYED">{t('fields.unemployed')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.netIncome')}</label>
                <input
                  type="number"
                  value={employment.monthlyNetIncome || ''}
                  onChange={(e) => setEmployment({ ...employment, monthlyNetIncome: parseFloat(e.target.value) || 0 })}
                  onBlur={() => autoSaveSection('employment', employment)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Household Information Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{t('sections.household')}</h2>
              <p className="text-xs text-gray-500">Occupants, pets, and lifestyle</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.occupants')}</label>
                <input
                  type="number"
                  value={household.numberOfOccupants || 1}
                  onChange={(e) => {
                    const updated = { ...household, numberOfOccupants: parseInt(e.target.value, 10) || 1 };
                    setHousehold(updated);
                    autoSaveSection('household', updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.adults')}</label>
                <input
                  type="number"
                  value={household.adults || 1}
                  onChange={(e) => {
                    const updated = { ...household, adults: parseInt(e.target.value, 10) || 1 };
                    setHousehold(updated);
                    autoSaveSection('household', updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.children')}</label>
                <input
                  type="number"
                  value={household.children || 0}
                  onChange={(e) => {
                    const updated = { ...household, children: parseInt(e.target.value, 10) || 0 };
                    setHousehold(updated);
                    autoSaveSection('household', updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.smokingStatus')}</label>
                <select
                  value={household.smokingStatus || 'NON_SMOKER'}
                  onChange={(e) => {
                    const updated = { ...household, smokingStatus: e.target.value };
                    setHousehold(updated);
                    autoSaveSection('household', updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                >
                  <option value="NON_SMOKER">{t('fields.nonSmoker')}</option>
                  <option value="SMOKER">{t('fields.smoker')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.relationshipStatus')}</label>
                <select
                  value={household.relationshipStatus || 'SINGLE'}
                  onChange={(e) => {
                    const updated = { ...household, relationshipStatus: e.target.value };
                    setHousehold(updated);
                    autoSaveSection('household', updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                >
                  <option value="SINGLE">{t('fields.single')}</option>
                  <option value="COUPLE">{t('fields.couple')}</option>
                  <option value="FAMILY">{t('fields.family')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Rental Preferences Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{t('sections.preferences')}</h2>
              <p className="text-xs text-gray-500">Target city, budget, and features</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.preferredCity')}</label>
                <input
                  type="text"
                  value={preferences.preferredCity || ''}
                  onChange={(e) => setPreferences({ ...preferences, preferredCity: e.target.value })}
                  onBlur={() => autoSaveSection('preferences', preferences)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.maxRent')}</label>
                <input
                  type="number"
                  value={preferences.maxRent || ''}
                  onChange={(e) => setPreferences({ ...preferences, maxRent: parseFloat(e.target.value) || 0 })}
                  onBlur={() => autoSaveSection('preferences', preferences)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.balcony || false}
                  onChange={(e) => {
                    const updated = { ...preferences, balcony: e.target.checked };
                    setPreferences(updated);
                    autoSaveSection('preferences', updated);
                  }}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                {t('fields.balcony')}
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.elevator || false}
                  onChange={(e) => {
                    const updated = { ...preferences, elevator: e.target.checked };
                    setPreferences(updated);
                    autoSaveSection('preferences', updated);
                  }}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                {t('fields.elevator')}
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.furnished || false}
                  onChange={(e) => {
                    const updated = { ...preferences, furnished: e.target.checked };
                    setPreferences(updated);
                    autoSaveSection('preferences', updated);
                  }}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                {t('fields.furnished')}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Personal Introduction & Bio Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">{t('sections.bio')}</h2>
            <p className="text-xs text-gray-500">Personal cover introduction to stand out to landlords</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">{t('fields.biography')}</label>
          <textarea
            rows={4}
            value={bio.biography || ''}
            onChange={(e) => setBio({ ...bio, biography: e.target.value })}
            onBlur={() => autoSaveSection('bio', bio)}
            placeholder="Introduce yourself, your daily routine, hobbies, and why you are looking for a new home..."
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Share Profile Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('sharing.title')}</h2>
              <p className="text-xs text-gray-500 mt-1">{t('sharing.subtitle')}</p>
            </div>

            {/* Checkbox Matrix */}
            <div>
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block mb-3">
                {t('sharing.selectSections')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(shareConfig.permissions).map((key) => (
                  <label key={key} className="flex items-center gap-2.5 text-xs text-gray-700 font-medium cursor-pointer p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={(shareConfig.permissions as any)[key]}
                      onChange={(e) =>
                        setShareConfig({
                          ...shareConfig,
                          permissions: { ...shareConfig.permissions, [key]: e.target.checked },
                        })
                      }
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    {key}
                  </label>
                ))}
              </div>
            </div>

            {/* Expiration & Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('sharing.expirationDays')}</label>
                <select
                  value={shareConfig.expiresInDays}
                  onChange={(e) => setShareConfig({ ...shareConfig, expiresInDays: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                >
                  <option value={7}>{t('sharing.days7')}</option>
                  <option value={14}>{t('sharing.days14')}</option>
                  <option value={30}>{t('sharing.days30')}</option>
                  <option value={0}>{t('sharing.noExpiration')}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('sharing.passwordProtect')}</label>
                <input
                  type="password"
                  placeholder={t('sharing.passwordPlaceholder')}
                  value={shareConfig.password}
                  onChange={(e) => setShareConfig({ ...shareConfig, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Generate CTA */}
            <Button
              onClick={handleGenerateShareLink}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 font-medium shadow-sm"
            >
              {t('sharing.generateLink')}
            </Button>

            {/* Output Link & QR Code */}
            {generatedLink && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Generated Shareable Link</span>
                  <button
                    onClick={() => copyToClipboard(generatedLink)}
                    className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? t('sharing.linkCopied') : t('sharing.copyLink')}
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full px-3 py-2 text-xs font-mono bg-white rounded-lg border border-emerald-200 text-emerald-900"
                />
              </div>
            )}

            {/* Active Links Table */}
            {activeShareLinks.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  {t('sharing.activeLinks')}
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeShareLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-xs">
                      <div>
                        <p className="font-mono text-gray-800 font-semibold">{link.token}</p>
                        <p className="text-[11px] text-gray-500">
                          {link.viewCount} views {link.expiresAt ? `• Expires ${new Date(link.expiresAt).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeShareLink(link.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-lg text-xs"
                      >
                        {t('sharing.revoke')}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
