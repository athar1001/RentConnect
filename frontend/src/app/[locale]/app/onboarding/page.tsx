'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  FolderCheck,
  Clock,
  Check,
  Upload,
  Globe,
  Lock,
  Home,
  SlidersHorizontal,
  FileText,
  DollarSign,
  AlertCircle,
  X,
  FileCheck
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations('Dashboard');

  // Step state: 0 = Welcome, 1 = Profile, 2 = Employment, 3 = Household, 4 = Documents, 5 = Preferences, 6 = Extension, 7 = Complete
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile data state
  const [personal, setPersonal] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    preferredCity: '',
    desiredMoveInDate: '',
  });

  const [employment, setEmployment] = useState({
    employmentStatus: 'EMPLOYED',
    employer: '',
    jobTitle: '',
    monthlyNetIncome: '',
  });

  const [household, setHousehold] = useState({
    adults: 1,
    children: 0,
    pets: 'NONE',
    smoking: 'NON_SMOKER',
    additionalNotes: '',
  });

  const [preferences, setPreferences] = useState({
    city: '',
    maxRent: '',
    minRooms: '',
    minSize: '',
    furnished: false,
    balcony: false,
    parking: false,
    petsAllowed: false,
  });

  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  // Fetch initial profile data on mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3000/housing-identity', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.personalInfo) {
            setPersonal({
              firstName: data.personalInfo.firstName || '',
              lastName: data.personalInfo.lastName || '',
              phone: data.personalInfo.phone || '',
              preferredCity: data.personalInfo.preferredCity || '',
              desiredMoveInDate: data.personalInfo.desiredMoveInDate || '',
            });
          }
          if (data.employmentInfo) {
            setEmployment({
              employmentStatus: data.employmentInfo.employmentStatus || 'EMPLOYED',
              employer: data.employmentInfo.employer || '',
              jobTitle: data.employmentInfo.jobTitle || '',
              monthlyNetIncome: data.employmentInfo.monthlyNetIncome ? String(data.employmentInfo.monthlyNetIncome) : '',
            });
          }
          if (data.householdInfo) {
            setHousehold({
              adults: data.householdInfo.adults || 1,
              children: data.householdInfo.children || 0,
              pets: data.householdInfo.pets || 'NONE',
              smoking: data.householdInfo.smoking || 'NON_SMOKER',
              additionalNotes: data.householdInfo.additionalNotes || '',
            });
          }
          if (data.preferences) {
            setPreferences({
              city: data.preferences.city || '',
              maxRent: data.preferences.maxRent ? String(data.preferences.maxRent) : '',
              minRooms: data.preferences.minRooms ? String(data.preferences.minRooms) : '',
              minSize: data.preferences.minSize ? String(data.preferences.minSize) : '',
              furnished: !!data.preferences.furnished,
              balcony: !!data.preferences.balcony,
              parking: !!data.preferences.parking,
              petsAllowed: !!data.preferences.petsAllowed,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load onboarding profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  // Compute Application Readiness Score
  const calculateReadinessScore = () => {
    let score = 0;
    if (personal.firstName && personal.lastName) score += 15;
    if (personal.preferredCity) score += 10;
    if (personal.desiredMoveInDate) score += 5;
    if (employment.employmentStatus) score += 15;
    if (employment.monthlyNetIncome) score += 10;
    if (household.adults) score += 5;
    if (uploadedDocs.length > 0) score += Math.min(uploadedDocs.length * 10, 30);
    if (preferences.maxRent || preferences.minRooms) score += 10;
    return Math.min(score, 100);
  };

  const score = calculateReadinessScore();

  // Auto-save changes to API
  const saveProgress = async () => {
    setSaving(true);
    try {
      await fetch('http://localhost:3000/housing-identity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          personalInfo: personal,
          employmentInfo: {
            ...employment,
            monthlyNetIncome: employment.monthlyNetIncome ? parseFloat(employment.monthlyNetIncome) : undefined,
          },
          householdInfo: household,
          preferences: {
            ...preferences,
            maxRent: preferences.maxRent ? parseFloat(preferences.maxRent) : undefined,
            minRooms: preferences.minRooms ? parseFloat(preferences.minRooms) : undefined,
            minSize: preferences.minSize ? parseFloat(preferences.minSize) : undefined,
          },
        }),
      });
    } catch (e) {
      console.error('Failed to auto-save:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleNextStep = async () => {
    await saveProgress();
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkipToDashboard = () => {
    toast.success('Onboarding progress saved! You can complete your profile anytime.');
    router.push('/app/dashboard');
  };

  const handleSimulateDocUpload = (docType: string) => {
    if (!uploadedDocs.includes(docType)) {
      setUploadedDocs(prev => [...prev, docType]);
      toast.success(`${docType} attached to your Application Vault! (+10% Readiness Score)`);
    } else {
      setUploadedDocs(prev => prev.filter(d => d !== docType));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        <p className="text-xs text-gray-500 font-medium">Preparing your onboarding workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Top Bar Header & Progress Gauge */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-emerald-600/20">
            WB
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Applicant Onboarding</h1>
            <p className="text-xs text-gray-500 font-medium">Become Apartment Ready in a few simple steps</p>
          </div>
        </div>

        {/* Dynamic Application Readiness Score Gauge */}
        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Readiness Score</span>
            <span className="text-sm font-extrabold text-emerald-600">{score}% — {score >= 80 ? 'Apartment Ready' : 'In Progress'}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center text-xs font-black text-emerald-600 shadow-inner">
            {score}%
          </div>
          <button onClick={handleSkipToDashboard} className="text-xs font-semibold text-gray-400 hover:text-gray-600 ml-2">
            Skip
          </button>
        </div>
      </div>

      {/* Step Indicator Progress Bar */}
      {currentStep > 0 && currentStep < 7 && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-gray-600">
            <span>Step {currentStep} of 6</span>
            <span className="text-emerald-600 font-semibold">{saving ? 'Saving...' : 'Auto-saved'}</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 0: WELCOME SCREEN */}
      {currentStep === 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-8 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Welcome to WohnBoard 👋
            </h2>
            <p className="text-base text-gray-600 font-medium leading-relaxed">
              Let's get you ready to apply for apartments in just a few minutes. We'll help you create your Rental Profile, prepare your application documents, and organize your apartment search.
            </p>
          </div>

          {/* Time & Benefits Card */}
          <div className="max-w-md mx-auto bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between text-xs text-gray-700 font-semibold">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Estimated Completion Time:
            </span>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">5–7 minutes</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => setCurrentStep(1)}
              className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 gap-2"
            >
              <span>Let's Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleSkipToDashboard}
              variant="outline"
              className="w-full sm:w-auto h-13 px-8 rounded-2xl border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      )}

      {/* STEP 1: RENTAL PROFILE */}
      {currentStep === 1 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Step 1 — Basic Identity</span>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your Basic Rental Profile</h2>
            <p className="text-xs text-gray-500">Provide essential details to identify yourself to property managers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            <div>
              <label className="block mb-1">First Name *</label>
              <input
                type="text"
                value={personal.firstName}
                onChange={e => setPersonal({ ...personal, firstName: e.target.value })}
                placeholder="e.g. Alex"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-1">Last Name *</label>
              <input
                type="text"
                value={personal.lastName}
                onChange={e => setPersonal({ ...personal, lastName: e.target.value })}
                placeholder="e.g. Schmidt"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-1">Preferred City *</label>
              <input
                type="text"
                value={personal.preferredCity}
                onChange={e => setPersonal({ ...personal, preferredCity: e.target.value })}
                placeholder="e.g. Berlin, Munich, Hamburg"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-1">Desired Move-in Date *</label>
              <input
                type="date"
                value={personal.desiredMoveInDate}
                onChange={e => setPersonal({ ...personal, desiredMoveInDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-1">Phone Number (Optional)</label>
              <input
                type="text"
                value={personal.phone}
                onChange={e => setPersonal({ ...personal, phone: e.target.value })}
                placeholder="e.g. +49 170 1234567"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <Button onClick={handlePrevStep} variant="ghost" className="text-xs text-gray-500">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <Button onClick={() => setCurrentStep(2)} variant="outline" className="text-xs border-gray-200">
                Skip Section
              </Button>
              <Button onClick={handleNextStep} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: EMPLOYMENT INFORMATION */}
      {currentStep === 2 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Step 2 — Financial Background</span>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Employment & Income</h2>
            <p className="text-xs text-gray-500">Only Employment Status is required. Remaining fields can be filled later.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            <div className="sm:col-span-2">
              <label className="block mb-1">Employment Status *</label>
              <select
                value={employment.employmentStatus}
                onChange={e => setEmployment({ ...employment, employmentStatus: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="EMPLOYED">Employed (Full-Time / Part-Time)</option>
                <option value="SELF_EMPLOYED">Self-Employed / Freelancer</option>
                <option value="CIVIL_SERVANT">Civil Servant (Beamter)</option>
                <option value="STUDENT">Student / Trainee</option>
                <option value="JOB_SEEKER">Job Seeker</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">Employer / Organization (Optional)</label>
              <input
                type="text"
                value={employment.employer}
                onChange={e => setEmployment({ ...employment, employer: e.target.value })}
                placeholder="e.g. Acme Tech GmbH"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-1">Job Title / Role (Optional)</label>
              <input
                type="text"
                value={employment.jobTitle}
                onChange={e => setEmployment({ ...employment, jobTitle: e.target.value })}
                placeholder="e.g. Product Designer"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-1">Monthly Net Income (€) (Optional)</label>
              <input
                type="number"
                value={employment.monthlyNetIncome}
                onChange={e => setEmployment({ ...employment, monthlyNetIncome: e.target.value })}
                placeholder="e.g. 2850"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <Button onClick={handlePrevStep} variant="ghost" className="text-xs text-gray-500">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <Button onClick={() => setCurrentStep(3)} variant="outline" className="text-xs border-gray-200">
                Skip Section
              </Button>
              <Button onClick={handleNextStep} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: HOUSEHOLD INFORMATION */}
      {currentStep === 3 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Step 3 — Household</span>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Household & Living Details</h2>
            <p className="text-xs text-gray-500">Provide occupant details for landlord application forms.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            <div>
              <label className="block mb-1">Adults</label>
              <input
                type="number"
                min="1"
                value={household.adults}
                onChange={e => setHousehold({ ...household, adults: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-1">Children</label>
              <input
                type="number"
                min="0"
                value={household.children}
                onChange={e => setHousehold({ ...household, children: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-1">Pets Status</label>
              <select
                value={household.pets}
                onChange={e => setHousehold({ ...household, pets: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="NONE">No Pets</option>
                <option value="DOG">Dog</option>
                <option value="CAT">Cat</option>
                <option value="SMALL_PETS">Small Pets (Fish / Hamster)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">Smoking Status</label>
              <select
                value={household.smoking}
                onChange={e => setHousehold({ ...household, smoking: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="NON_SMOKER">Non-Smoker</option>
                <option value="SMOKER">Smoker</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <Button onClick={handlePrevStep} variant="ghost" className="text-xs text-gray-500">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <Button onClick={() => setCurrentStep(4)} variant="outline" className="text-xs border-gray-200">
                Skip Section
              </Button>
              <Button onClick={handleNextStep} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: APPLICATION DOCUMENTS */}
      {currentStep === 4 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Step 4 — Document Vault</span>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Prepare Your Application Documents</h2>
            <p className="text-xs text-gray-500">
              Landlords request these files to confirm financial stability. Attaching documents boosts your <strong>Application Readiness Score</strong>!
            </p>
          </div>

          {/* Interactive Document Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'SCHUFA Credit Report', icon: '📄', desc: 'Creditworthiness certificate' },
              { id: '3 Months Payslips', icon: '💶', desc: 'Income verification' },
              { id: 'Employment Contract', icon: '💼', desc: 'Employer confirmation' },
              { id: 'Passport / ID Card', icon: '🪪', desc: 'Identity verification' },
              { id: 'Rental Reference', icon: '🏠', desc: 'Previous landlord confirmation' },
              { id: 'Cover Letter', icon: '✍️', desc: 'Personal applicant introduction' },
            ].map(doc => {
              const isAttached = uploadedDocs.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => handleSimulateDocUpload(doc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isAttached
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-xs'
                      : 'bg-gray-50/70 border-gray-100 hover:border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{doc.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold">{doc.id}</h4>
                      <p className="text-[10px] text-gray-500">{doc.desc}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isAttached ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {isAttached ? '✓ Attached' : '+ Attach'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3 text-xs text-amber-800 font-medium">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>All uploaded documents are automatically watermarked and encrypted with ISO-certified German hosting.</span>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <Button onClick={handlePrevStep} variant="ghost" className="text-xs text-gray-500">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <Button onClick={() => setCurrentStep(5)} variant="outline" className="text-xs border-gray-200">
                Skip Uploads
              </Button>
              <Button onClick={handleNextStep} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: RENTAL PREFERENCES */}
      {currentStep === 5 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Step 5 — Search Criteria</span>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your Rental Preferences</h2>
            <p className="text-xs text-gray-500">Used to filter apartments and compare listing features.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            <div>
              <label className="block mb-1">Maximum Warm Rent (€)</label>
              <input
                type="number"
                value={preferences.maxRent}
                onChange={e => setPreferences({ ...preferences, maxRent: e.target.value })}
                placeholder="e.g. 1200"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-1">Minimum Rooms</label>
              <input
                type="number"
                step="0.5"
                value={preferences.minRooms}
                onChange={e => setPreferences({ ...preferences, minRooms: e.target.value })}
                placeholder="e.g. 2"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <Button onClick={handlePrevStep} variant="ghost" className="text-xs text-gray-500">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <Button onClick={() => setCurrentStep(6)} variant="outline" className="text-xs border-gray-200">
                Skip Preferences
              </Button>
              <Button onClick={handleNextStep} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: BROWSER EXTENSION */}
      {currentStep === 6 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-md">
            <Globe className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Install the WohnBoard Extension
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Save apartments directly from ImmoScout24, WG-Gesucht, or housing agency websites with one click and manage them inside WohnBoard.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 max-w-md mx-auto text-xs text-gray-600 text-left space-y-2 font-medium">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <Check className="w-4 h-4" /> 1-Click Apartment Saver
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <Check className="w-4 h-4" /> Auto-extract rent, size, and address
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => {
                setExtensionInstalled(true);
                toast.success('Extension marked ready!');
                handleNextStep();
              }}
              className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 gap-2"
            >
              <Globe className="w-4 h-4" /> Install Extension
            </Button>

            <Button
              onClick={() => setCurrentStep(7)}
              variant="outline"
              className="w-full sm:w-auto h-12 px-8 rounded-2xl border-gray-200 text-gray-700 font-bold text-xs"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      )}

      {/* STEP 7: APARTMENT READY CELEBRATION SCREEN */}
      {currentStep === 7 && (
        <div className="bg-slate-900 text-white border border-emerald-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-8 animate-in fade-in duration-300 relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center text-3xl shadow-xl">
            🎉
          </div>

          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              You're Apartment Ready 🎉
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Your Rental Profile and application documents are ready. You're now prepared to start saving apartments and managing your applications.
            </p>
          </div>

          {/* Readiness Score Card */}
          <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="text-left">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Application Readiness</span>
                <span className="text-xl font-extrabold text-white">{score}% Complete</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                ✓ Ready to Apply
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 text-left font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Rental Profile Configured ({personal.firstName} {personal.lastName})</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Financial Background Verified ({employment.employmentStatus})</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{uploadedDocs.length} Documents Attached to Vault</span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => router.push('/app/apartments')}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 gap-2"
            >
              <span>Start Apartment Search</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => router.push('/app/dashboard')}
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 font-bold text-sm"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
