'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Cookie, Shield, Activity, Settings, Info, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface CookieConfig {
  policyVersion: number;
  enabled: boolean;
  titleEn: string;
  titleDe: string;
  descriptionEn: string;
  descriptionDe: string;
  privacyPolicyUrl: string;
  cookiePolicyUrl: string;
  analyticsEnabled: boolean;
  functionalEnabled: boolean;
}

interface SavedConsent {
  version: number;
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  acceptedAt: string;
}

export default function CookieConsent() {
  const locale = useLocale();
  const [config, setConfig] = useState<CookieConfig | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  // Preference toggles
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [functionalConsent, setFunctionalConsent] = useState(false);

  const [publishedStatus, setPublishedStatus] = useState({
    PRIVACY_POLICY: false,
    TERMS_OF_SERVICE: false,
    COOKIE_POLICY: false,
    IMPRINT: false,
  });

  // Load config and check consent state
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [res, pubRes] = await Promise.all([
          fetch('http://localhost:3000/cookie-consent'),
          fetch('http://localhost:3000/legal-pages/published')
        ]);

        if (pubRes.ok) {
          const pubData = await pubRes.json();
          setPublishedStatus(pubData);
        }

        if (res.ok) {
          const data: CookieConfig = await res.json();
          setConfig(data);

          if (data.enabled) {
            // Check current saved consent
            const savedStr = localStorage.getItem('cookieConsentVersion');
            if (savedStr) {
              try {
                const saved: SavedConsent = JSON.parse(savedStr);
                // If saved version matches backend version, keep hidden
                if (saved.version === data.policyVersion) {
                  setAnalyticsConsent(saved.analytics);
                  setFunctionalConsent(saved.functional);
                  
                  // Trigger analytics load if previously accepted
                  triggerAnalytics(saved.analytics);
                  return;
                }
              } catch (_) {
                // Malformed consent data, re-trigger banner
              }
            }
            // No valid consent or version mismatch -> show banner
            setShowBanner(true);
          }
        }
      } catch (err) {
        console.error('Failed to load cookie consent settings', err);
      }
    };
    fetchConfig();
  }, []);

  // Listen to open settings event from footer or custom triggers
  useEffect(() => {
    const handleOpenSettings = () => {
      setPreferencesOpen(true);
      setShowBanner(true);
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
  }, []);

  const triggerAnalytics = (accepted: boolean) => {
    if (accepted) {
      // Mock loading analytics scripts
      (window as any).analyticsOptedIn = true;
      window.dispatchEvent(new CustomEvent('analytics-consent-granted'));
      console.log('[CookieConsent] Analytics scripts loaded/activated.');
    } else {
      (window as any).analyticsOptedIn = false;
      console.log('[CookieConsent] Analytics scripts disabled/inactive.');
    }
  };

  const saveConsent = (analytics: boolean, functional: boolean) => {
    if (!config) return;

    const consentData: SavedConsent = {
      version: config.policyVersion,
      necessary: true,
      analytics,
      functional,
      acceptedAt: new Date().toISOString(),
    };

    localStorage.setItem('cookieConsentVersion', JSON.stringify(consentData));
    setAnalyticsConsent(analytics);
    setFunctionalConsent(functional);
    setShowBanner(false);
    setPreferencesOpen(false);

    // Load or disable analytics scripts
    triggerAnalytics(analytics);

    toast.success(
      locale === 'de' 
        ? 'Cookie-Einstellungen wurden gespeichert!' 
        : 'Cookie preferences saved successfully!'
    );
  };

  const handleAcceptAll = () => {
    saveConsent(
      config ? config.analyticsEnabled : true, 
      config ? config.functionalEnabled : true
    );
  };

  const handleRejectNonEssential = () => {
    saveConsent(false, false);
  };

  if (!config || !showBanner) return null;

  const isDe = locale === 'de';
  const title = isDe ? config.titleDe : config.titleEn;
  const description = isDe ? config.descriptionDe : config.descriptionEn;

  return (
    <>
      {/* Floating Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-transparent pointer-events-none">
        <div className="container mx-auto max-w-5xl pointer-events-auto">
          <div className="bg-white rounded-[20px] border border-slate-200 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  {title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                  {description}
                </p>
                <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {isDe 
                    ? 'Wir respektieren Ihre Privatsphäre. WohnBoard ist kostenlos und verkauft keine Daten.' 
                    : 'We respect your privacy. WohnBoard is free, privacy-focused, and never sells your data.'
                  }
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => setPreferencesOpen(true)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {isDe ? 'Einstellungen' : 'Customize'}
              </button>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                {isDe ? 'Nur notwendige Cookies' : 'Reject Non-Essential'}
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4.5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
              >
                {isDe ? 'Alle akzeptieren' : 'Accept All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Customization Modal */}
      {preferencesOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isDe ? 'Cookie-Einstellungen' : 'Cookie Preferences'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {isDe ? `Policy Version ${config.policyVersion}` : `Policy Version ${config.policyVersion}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreferencesOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List of categories */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <p className="text-xs text-slate-500 leading-relaxed">
                {isDe
                  ? 'Passen Sie an, welche Arten von Cookies wir auf Ihrem Gerät speichern dürfen. Essential Cookies sind zur Bereitstellung der Kernfunktionen erforderlich.'
                  : 'Customize which types of cookies we can store on your device. Necessary cookies are required for providing the core functionalities of the platform.'
                }
              </p>

              {/* Category 1: Essential */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3.5 items-start justify-between">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    {isDe ? 'Erforderliche Cookies' : 'Essential Cookies'}
                  </h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isDe
                      ? 'Erforderlich für Anmeldung, Sicherheit und grundlegende Funktionen.'
                      : 'Required for login, security and core website functionality.'
                    }
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2.5 py-1 rounded-lg uppercase tracking-wider select-none shrink-0 mt-0.5">
                  {isDe ? 'Immer aktiv' : 'Always Active'}
                </span>
              </div>

              {/* Category 2: Analytics */}
              {config.analyticsEnabled && (
                <div className="p-4 border border-slate-150 rounded-2xl flex gap-3.5 items-start justify-between">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-500" />
                      {isDe ? 'Analytische Cookies' : 'Analytics'}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {isDe
                        ? 'Hilft uns zu verstehen, wie Besucher WohnBoard nutzen.'
                        : 'Help us understand how visitors use WohnBoard.'
                      }
                    </p>
                  </div>
                  
                  {/* Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1 select-none">
                    <input
                      type="checkbox"
                      checked={analyticsConsent}
                      onChange={(e) => setAnalyticsConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              )}

              {/* Category 3: Functional */}
              {config.functionalEnabled && (
                <div className="p-4 border border-slate-150 rounded-2xl flex gap-3.5 items-start justify-between">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-indigo-500" />
                      {isDe ? 'Funktionale Cookies' : 'Functional Cookies'}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {isDe
                        ? 'Speichert Ihre Einstellungen für eine bessere Benutzererfahrung.'
                        : 'Remember your preferences and improve your experience.'
                      }
                    </p>
                  </div>

                  {/* Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1 select-none">
                    <input
                      type="checkbox"
                      checked={functionalConsent}
                      onChange={(e) => setFunctionalConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              )}
            </div>

            {/* Footer with links and save actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-4">
              {/* Links */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-500">
                {publishedStatus.PRIVACY_POLICY && (
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    className="hover:text-indigo-600 flex items-center gap-1"
                  >
                    <span>{isDe ? 'Datenschutzerklärung' : 'Privacy Policy'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                {publishedStatus.PRIVACY_POLICY && publishedStatus.COOKIE_POLICY && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                )}
                {publishedStatus.COOKIE_POLICY && (
                  <Link
                    href="/cookie-policy"
                    target="_blank"
                    className="hover:text-indigo-600 flex items-center gap-1"
                  >
                    <span>{isDe ? 'Cookie-Richtlinie' : 'Cookie Policy'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => saveConsent(analyticsConsent, functionalConsent)}
                  className="flex-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 py-3 rounded-xl transition-all cursor-pointer text-center"
                >
                  {isDe ? 'Einstellungen speichern' : 'Save Preferences'}
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer text-center"
                >
                  {isDe ? 'Alle akzeptieren' : 'Accept All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
