'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  User,
  Sliders,
  Check,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Info,
  Lock,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ApplyPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const resolvedParams = use(params);
  const apartmentId = resolvedParams.id;
  
  const t = useTranslations('Applications');
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [apartment, setApartment] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [identityScore, setIdentityScore] = useState(0);

  // Duplicate Warning State
  const [duplicateError, setDuplicateError] = useState<any>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'personalInfo',
    'employmentInfo',
    'preferences',
    'householdInfo',
  ]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [orderedDocumentIds, setOrderedDocumentIds] = useState<string[]>([]);
  const [messageTemplate, setMessageTemplate] = useState('Professional');
  const [customMessage, setCustomMessage] = useState('');

  // Fetch Apartment and Documents
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptRes, docsRes, identityRes] = await Promise.all([
          fetch(`http://localhost:3000/apartments/${apartmentId}`, { credentials: 'include' }),
          fetch('http://localhost:3000/documents', { credentials: 'include' }),
          fetch('http://localhost:3000/housing-identity', { credentials: 'include' }),
        ]);

        if (aptRes.ok) setApartment(await aptRes.json());
        if (docsRes.ok) setDocuments(await docsRes.json());
        if (identityRes.ok) {
          const idData = await identityRes.json();
          setIdentityScore(idData.completionScore || 0);
        }
      } catch (e) {
        console.error('Failed to load data for application wizard:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apartmentId]);

  // Message Templates
  const getMessageContent = (template: string) => {
    const landlord = apartment?.landlordName || 'Sir / Madam';
    const title = apartment?.title || 'Apartment';
    const moveIn = apartment?.moveInDate ? new Date(apartment.moveInDate).toLocaleDateString() : 'soon';

    const templates: Record<string, string> = {
      Professional: `Dear ${landlord},\n\nI am writing to express my strong interest in the apartment "${title}". Having reviewed the description, I believe this home suits my preferences perfectly. Enclosed, you will find my verified WohnBoard Housing Identity profile containing my personal details and employment references.\n\nI would be delighted to arrange a viewing appointment.\n\nSincerely,\nApplicant`,
      Friendly: `Hello ${landlord},\n\nI would love to apply for your apartment "${title}". I am looking for a move-in date around ${moveIn} and your listing looks like a perfect fit for my lifestyle. My full verification records and credentials are attached via WohnBoard.\n\nLooking forward to hearing from you!\n\nBest regards,\nApplicant`,
      Student: `Dear ${landlord},\n\nI am writing to apply for the apartment "${title}". I am currently a student, and my rental and income guarantee references are attached to this WohnBoard profile. I am a tidy, responsible tenant looking to move in around ${moveIn}.\n\nThank you for your consideration!\n\nBest,\nApplicant`,
    };

    return templates[template] || '';
  };

  useEffect(() => {
    if (apartment) {
      setCustomMessage(getMessageContent(messageTemplate));
    }
  }, [messageTemplate, apartment]);

  const toggleField = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter((f) => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const toggleDocument = (docId: string) => {
    let nextDocs = [...selectedDocuments];
    if (nextDocs.includes(docId)) {
      nextDocs = nextDocs.filter((id) => id !== docId);
    } else {
      nextDocs.push(docId);
    }
    setSelectedDocuments(nextDocs);

    // Sync order index
    const nextOrder = orderedDocumentIds.filter((id) => nextDocs.includes(id));
    nextDocs.forEach((id) => {
      if (!nextOrder.includes(id)) nextOrder.push(id);
    });
    setOrderedDocumentIds(nextOrder);
  };

  const moveDocument = (index: number, direction: 'up' | 'down') => {
    const nextOrder = [...orderedDocumentIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < nextOrder.length) {
      const temp = nextOrder[index];
      nextOrder[index] = nextOrder[targetIndex];
      nextOrder[targetIndex] = temp;
      setOrderedDocumentIds(nextOrder);
    }
  };

  const handleFinish = async (status: 'SENT' | 'DRAFT') => {
    try {
      const payload = {
        apartmentId,
        sharedProfileFields: selectedFields,
        documents: orderedDocumentIds,
        templateName: messageTemplate,
        messageContent: customMessage,
      };

      const res = await fetch('http://localhost:3000/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'DUPLICATE_APPLICATION') {
          setDuplicateError(data);
        } else {
          alert(data.message || 'Failed to submit application.');
        }
        return;
      }

      // Update status to Sent if submitted
      if (status === 'SENT') {
        await fetch(`http://localhost:3000/applications/${data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: 'SENT' }),
        });
      }

      router.push('/app/applications');
    } catch (e) {
      console.error('Failed to finish application:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Duplicate Warning Render
  if (duplicateError) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">{t('duplicateWarning')}</h2>
          <p className="text-xs text-gray-500">
            {t('duplicateWarningDesc', {
              date: new Date(duplicateError.appliedAt).toLocaleDateString(),
              status: duplicateError.status,
            })}
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Link href={`/app/applications/${duplicateError.applicationId}` as any}>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              {t('openApplication')}
            </Button>
          </Link>
          <Link href="/app/apartments">
            <Button variant="outline" className="w-full border-gray-200 text-gray-700 rounded-xl">
              Back to Apartments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <Link href={`/app/apartments`} className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Apartments
      </Link>

      {/* Progress Wizard Steps */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : step > s
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs font-bold hidden md:inline ${step === s ? 'text-gray-900' : 'text-gray-400'}`}>
                {t(`wizard.step${s}`)}
              </span>
              {s < 5 && <div className="h-0.5 w-8 bg-gray-100 hidden md:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Apartment Summary */}
      {step === 1 && apartment && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('wizard.step1')}</h2>
            <p className="text-xs text-gray-500">Confirm the details of the apartment you are applying to.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">{apartment.title}</h3>
              <p className="text-xs text-gray-500">{apartment.address}</p>
              <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                <div>Warm Rent: <span className="text-emerald-600 font-bold">€{apartment.warmRent || apartment.rentPrice}</span></div>
                <div>Rooms: <span>{apartment.rooms} Rooms</span></div>
                <div>Area: <span>{apartment.squareMeters} m²</span></div>
                <div>Platform: <span className="uppercase">{apartment.sourcePlatform}</span></div>
              </div>
            </div>

            {apartment.coverImage && (
              <img
                src={apartment.coverImage}
                alt="Apartment cover"
                className="w-full h-40 object-cover rounded-xl shadow-inner border border-gray-100"
              />
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep(2)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Choose Profile Information */}
      {step === 2 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('wizard.step2')}</h2>
            <p className="text-xs text-gray-500">Select which parts of your Housing Identity Profile to share.</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              {identityScore}%
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900">Verified Housing Identity Completeness</p>
              <p className="text-[11px] text-emerald-700">Higher scores improve your chance of application approval.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'personalInfo', label: 'Personal Information' },
              { id: 'employmentInfo', label: 'Employment & Income' },
              { id: 'preferences', label: 'Rental Preferences' },
              { id: 'householdInfo', label: 'Household Composition' },
              { id: 'rentalHistory', label: 'Rental History & Landlords' },
              { id: 'guarantorInfo', label: 'Guarantor Records' },
            ].map((f) => (
              <label
                key={f.id}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedFields.includes(f.id)
                    ? 'border-emerald-500 bg-emerald-50/20 text-emerald-900'
                    : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedFields.includes(f.id)}
                  onChange={() => toggleField(f.id)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs font-semibold">{f.label}</div>
              </label>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(1)} className="border-gray-200 text-gray-700 rounded-xl">
              Back
            </Button>
            <Button onClick={() => setStep(3)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Choose Documents */}
      {step === 3 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('wizard.chooseDocuments')}</h2>
            <p className="text-xs text-gray-500">Select and arrange your documents in order of presentation.</p>
          </div>

          {documents.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-500">No documents found. Please upload documents in the Documents panel first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <label
                  key={doc.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedDocuments.includes(doc.id)
                      ? 'border-emerald-500 bg-emerald-50/20 text-emerald-900'
                      : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => toggleDocument(doc.id)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold block">{doc.title}</span>
                      <span className="text-[10px] text-gray-400 uppercase">{doc.type}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Reordering container */}
          {orderedDocumentIds.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Document Package Order</h3>
              <div className="space-y-2">
                {orderedDocumentIds.map((docId, index) => {
                  const doc = documents.find((d) => d.id === docId);
                  if (!doc) return null;
                  return (
                    <div key={docId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                      <span className="font-semibold text-gray-800">{doc.title}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => moveDocument(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-white border rounded disabled:opacity-30"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveDocument(index, 'down')}
                          disabled={index === orderedDocumentIds.length - 1}
                          className="p-1 hover:bg-white border rounded disabled:opacity-30"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(2)} className="border-gray-200 text-gray-700 rounded-xl">
              Back
            </Button>
            <Button onClick={() => setStep(4)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Cover Message */}
      {step === 4 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('wizard.messageTemplate')}</h2>
            <p className="text-xs text-gray-500">Draft a personal introduction for the landlord.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Template</label>
              <select
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Professional">Professional Template</option>
                <option value="Friendly">Friendly Template</option>
                <option value="Student">Student Template</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Message Content</label>
              <textarea
                rows={8}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-sans"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(3)} className="border-gray-200 text-gray-700 rounded-xl">
              Back
            </Button>
            <Button onClick={() => setStep(5)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: Review & Submit */}
      {step === 5 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('wizard.step5')}</h2>
            <p className="text-xs text-gray-500">{t('wizard.reviewWarning')}</p>
          </div>

          {/* Quick package review card */}
          <div className="space-y-4 rounded-2xl bg-gray-50 p-6 border border-gray-100 text-xs">
            <div>
              <span className="text-gray-400 block uppercase tracking-wider font-bold">Target Apartment</span>
              <span className="font-bold text-sm text-gray-800">{apartment?.title}</span>
            </div>
            <div>
              <span className="text-gray-400 block uppercase tracking-wider font-bold">Identity Sections Shared</span>
              <span className="font-semibold text-gray-800">{selectedFields.join(', ') || 'None'}</span>
            </div>
            <div>
              <span className="text-gray-400 block uppercase tracking-wider font-bold">Attached Documents</span>
              <span className="font-semibold text-gray-800">
                {orderedDocumentIds.map((id) => documents.find((d) => d.id === id)?.title).join(' → ') || 'None'}
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(4)} className="border-gray-200 text-gray-700 rounded-xl">
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleFinish('DRAFT')}
                className="border-gray-200 text-gray-700 rounded-xl"
              >
                Save Draft
              </Button>
              <Button
                onClick={() => handleFinish('SENT')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                Submit Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
