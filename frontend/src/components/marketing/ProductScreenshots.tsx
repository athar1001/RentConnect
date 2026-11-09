'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Columns, FolderLock, Bell, FileText, Check, Plus, Merge, Calendar, Clock, MapPin } from 'lucide-react';

export function ProductScreenshots() {
  const t = useTranslations('HomePage');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'board' | 'vault' | 'reminders'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: t('Screenshots.dashboard'), desc: t('Screenshots.dashboardDesc'), icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'board', label: t('Screenshots.board'), desc: t('Screenshots.boardDesc'), icon: <Columns className="w-5 h-5" /> },
    { id: 'vault', label: t('Screenshots.vault'), desc: t('Screenshots.vaultDesc'), icon: <FolderLock className="w-5 h-5" /> },
    { id: 'reminders', label: t('Screenshots.reminders'), desc: t('Screenshots.remindersDesc'), icon: <Bell className="w-5 h-5" /> },
  ] as const;

  return (
    <section className="py-24 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            {t('Screenshots.title')}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Showcase Container */}
        <div className="grid lg:grid-cols-12 gap-12 items-center bg-gray-50/50 p-6 sm:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
          
          {/* Left: Tab Text Description */}
          <div className="lg:col-span-4 flex flex-col text-center lg:text-left items-center lg:items-start">
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Interactive Preview</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {tabs.find((t) => t.id === activeTab)?.desc}
            </p>
          </div>

          {/* Right: The Mockup Interface */}
          <div className="lg:col-span-8 w-full">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden min-h-[360px] flex flex-col">
              
              {/* Mockup Header/Browser Bar */}
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                </div>
                <div className="bg-white border border-gray-100 rounded-md text-[10px] text-gray-400 px-3 py-1 flex-1 max-w-md mx-auto truncate text-center select-none">
                  wohnboard.io/app/{activeTab}
                </div>
              </div>

              {/* Mockup Body Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                
                {/* 1. DASHBOARD MOCKUP */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-4 text-center">
                        <div className="text-xs font-semibold text-blue-600 mb-1">Saved</div>
                        <div className="text-2xl font-extrabold text-blue-900">12</div>
                      </div>
                      <div className="bg-amber-50/50 border border-amber-100/50 rounded-xl p-4 text-center">
                        <div className="text-xs font-semibold text-amber-600 mb-1">Applied</div>
                        <div className="text-2xl font-extrabold text-amber-900">5</div>
                      </div>
                      <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-4 text-center">
                        <div className="text-xs font-semibold text-emerald-600 mb-1">Viewings</div>
                        <div className="text-2xl font-extrabold text-emerald-900">2</div>
                      </div>
                    </div>

                    {/* Recent Inserate */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recently Saved</div>
                      <div className="border border-gray-100 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs shrink-0">IS24</div>
                          <div>
                            <div className="text-sm font-bold text-gray-800">2.5 Room Apartment</div>
                            <div className="text-xs text-gray-500">Berlin Schöneberg • 65 m²</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-gray-900">850 €</div>
                      </div>
                      <div className="border border-gray-100 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs shrink-0">WG</div>
                          <div>
                            <div className="text-sm font-bold text-gray-800">Shared Flat Room</div>
                            <div className="text-xs text-gray-500">München Maxvorstadt • 20 m²</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-gray-900">550 €</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. BOARD MOCKUP */}
                {activeTab === 'board' && (
                  <div className="grid grid-cols-3 gap-3 flex-1 items-start">
                    {/* Column 1: Saved */}
                    <div className="bg-gray-50/80 rounded-xl p-3 space-y-3 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Saved</span>
                        <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">2</span>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 space-y-2">
                        <div className="text-xs font-bold text-gray-800 truncate">Sonniges Altbau-Juwel</div>
                        <div className="text-[10px] text-gray-500">Berlin • 980 €</div>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 space-y-2">
                        <div className="text-xs font-bold text-gray-800 truncate">Modernes Studio</div>
                        <div className="text-[10px] text-gray-500">Hamburg • 720 €</div>
                      </div>
                    </div>

                    {/* Column 2: Applied */}
                    <div className="bg-gray-50/80 rounded-xl p-3 space-y-3 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Applied</span>
                        <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">1</span>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 space-y-2 border-l-4 border-l-amber-400">
                        <div className="text-xs font-bold text-gray-800 truncate">2-Zimmer Wohnung</div>
                        <div className="text-[10px] text-gray-500">Frankfurt • 1.100 €</div>
                      </div>
                    </div>

                    {/* Column 3: Viewing */}
                    <div className="bg-gray-50/80 rounded-xl p-3 space-y-3 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Viewing</span>
                        <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">1</span>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 space-y-2 border-l-4 border-l-blue-500">
                        <div className="text-xs font-bold text-gray-800 truncate">Penthouse Altstadt</div>
                        <div className="text-[10px] text-gray-500">Köln • 1.400 €</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. VAULT MOCKUP */}
                {activeTab === 'vault' && (
                  <div className="space-y-4">
                    {/* Document List */}
                    <div className="space-y-2">
                      <div className="border border-gray-100 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-red-500" />
                          <div>
                            <div className="text-sm font-bold text-gray-800">SCHUFA_Auskunft.pdf</div>
                            <div className="text-[10px] text-gray-500">2.4 MB • Updated 2 days ago</div>
                          </div>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check className="w-3.5 h-3.5" /></span>
                      </div>

                      <div className="border border-gray-100 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="text-sm font-bold text-gray-800">Gehaltsnachweis_Mai.pdf</div>
                            <div className="text-[10px] text-gray-500">1.1 MB • Updated yesterday</div>
                          </div>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check className="w-3.5 h-3.5" /></span>
                      </div>

                      <div className="border border-gray-100 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-bold text-gray-800">Mietschuldenfreiheitsbescheinigung.pdf</div>
                            <div className="text-[10px] text-gray-500">1.8 MB • Uploaded 1 week ago</div>
                          </div>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check className="w-3.5 h-3.5" /></span>
                      </div>
                    </div>

                    {/* Merge Button */}
                    <button className="w-full h-12 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/95 transition-all text-sm shadow-md shadow-primary/10">
                      <Merge className="w-4 h-4" />
                      Merge Application Folder (PDF)
                    </button>
                  </div>
                )}

                {/* 4. REMINDERS MOCKUP */}
                {activeTab === 'reminders' && (
                  <div className="space-y-4">
                    {/* Add Reminder Bar */}
                    <div className="border border-dashed border-gray-200 rounded-xl p-3.5 flex items-center justify-between text-gray-400 text-xs hover:bg-gray-50 transition-all cursor-pointer">
                      <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Set new viewing reminder</span>
                      <span>CMD + N</span>
                    </div>

                    {/* Upcoming Reminders List */}
                    <div className="space-y-3">
                      <div className="border border-gray-100 rounded-xl p-4 flex items-start justify-between bg-emerald-50/20 border-l-4 border-l-emerald-500">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Confirmed</span>
                          <h4 className="text-sm font-bold text-gray-800">Viewing: Bergmannstraße 10, Berlin</h4>
                          <div className="flex items-center gap-3 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Tomorrow, 15:30</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Schöneberg</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span>1d left</span>
                        </div>
                      </div>

                      <div className="border border-gray-100 rounded-xl p-4 flex items-start justify-between bg-blue-50/20 border-l-4 border-l-blue-500">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">Follow Up</span>
                          <h4 className="text-sm font-bold text-gray-800">Follow-up: Landlord Müller (IS24)</h4>
                          <div className="flex items-center gap-3 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> June 15, 10:00</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> In-App</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span>3d left</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
