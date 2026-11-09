'use client';

import { useState, useEffect } from 'react';
import { Save, Cookie, ShieldAlert, CheckCircle, Info } from 'lucide-react';
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

export default function AdminCookieSettingsPage() {
  const [formData, setFormData] = useState<CookieConfig>({
    policyVersion: 1,
    enabled: true,
    titleEn: '',
    titleDe: '',
    descriptionEn: '',
    descriptionDe: '',
    privacyPolicyUrl: '',
    cookiePolicyUrl: '',
    analyticsEnabled: true,
    functionalEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('http://localhost:3000/cookie-consent');
        if (res.ok) {
          const data = await res.json();
          setFormData(data);
        } else {
          toast.error('Failed to load cookie settings configuration');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to connect to backend server');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleCheckboxChange = (name: keyof CookieConfig) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('http://localhost:3000/cookie-consent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(data);
        toast.success('Cookie settings updated successfully! All active users will see the updated banner.');
      } else {
        toast.error('Failed to update cookie settings');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to send configuration updates to backend');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
        <span className="text-sm text-slate-500 font-semibold">Loading settings config...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
              <Cookie className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">GDPR Cookie Consent Settings</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Configure client preferences banner & policy versions</p>
            </div>
          </div>
        </div>

        {/* Warning notification banner */}
        <div className="bg-amber-50 border border-amber-250 rounded-2xl p-4 flex gap-3 text-amber-800">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Versioning Warning</p>
            <p className="leading-relaxed">Incrementing the **Cookie Policy Version** field will instantly reset all existing cookie consents stored on users\' browsers. All users visiting WohnBoard will be prompted to re-configure their consent when they next load the page.</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-6 space-y-6">
            
            {/* General Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 pb-6">
              
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Policy Version</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    name="policyVersion"
                    required
                    min={1}
                    value={formData.policyVersion}
                    onChange={handleNumberChange}
                    className="w-32 px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                  />
                  <div className="text-xs text-slate-400 leading-normal">
                    Increment to re-force consent popup on next load.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Banner Status</label>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={() => handleCheckboxChange('enabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                  <span className="text-sm font-semibold text-slate-700">
                    {formData.enabled ? 'Enabled (Shows floating banner)' : 'Disabled (Will not show banner)'}
                  </span>
                </div>
              </div>

            </div>

            {/* Customization Details: English */}
            <div className="space-y-4 border-b border-slate-100 pb-6">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold">EN</span>
                English Text Customization
              </h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Banner Title (English)</label>
                <input
                  type="text"
                  name="titleEn"
                  required
                  value={formData.titleEn}
                  onChange={handleChange}
                  placeholder="Your Privacy Matters"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Banner Description (English)</label>
                <textarea
                  name="descriptionEn"
                  required
                  rows={3}
                  value={formData.descriptionEn}
                  onChange={handleChange}
                  placeholder="We use cookies to improve your experience..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
                />
              </div>
            </div>

            {/* Customization Details: German */}
            <div className="space-y-4 border-b border-slate-100 pb-6">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold">DE</span>
                German Text Customization
              </h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Banner Title (German)</label>
                <input
                  type="text"
                  name="titleDe"
                  required
                  value={formData.titleDe}
                  onChange={handleChange}
                  placeholder="Ihre Privatsphäre ist uns wichtig"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Banner Description (German)</label>
                <textarea
                  name="descriptionDe"
                  required
                  rows={3}
                  value={formData.descriptionDe}
                  onChange={handleChange}
                  placeholder="Wir verwenden Cookies..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
                />
              </div>
            </div>

            {/* Legal Documents URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 pb-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Privacy Policy URL</label>
                <input
                  type="text"
                  name="privacyPolicyUrl"
                  required
                  value={formData.privacyPolicyUrl}
                  onChange={handleChange}
                  placeholder="/privacy"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Cookie Policy URL</label>
                <input
                  type="text"
                  name="cookiePolicyUrl"
                  required
                  value={formData.cookiePolicyUrl}
                  onChange={handleChange}
                  placeholder="/cookies"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

            </div>

            {/* Cookie Categories Toggles */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-500" />
                Optional Cookie Classifications
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Analytics option */}
                <div className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">Analytics Category</p>
                    <p className="text-[10px] text-slate-400 leading-normal">Allows visitors to opt-in to track traffic usage & analytics services.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.analyticsEnabled}
                      onChange={() => handleCheckboxChange('analyticsEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Functional option */}
                <div className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">Functional Category</p>
                    <p className="text-[10px] text-slate-400 leading-normal">Allows preferences mapping and user-experience configurations storage.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.functionalEnabled}
                      onChange={() => handleCheckboxChange('functionalEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

              </div>
            </div>

          </div>

          {/* Footer Action buttons */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating config...' : 'Save Configuration'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
