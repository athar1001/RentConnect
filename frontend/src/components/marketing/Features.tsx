import { useTranslations } from 'next-intl';
import { Bookmark, LayoutGrid, FileText, Share2, Bell, ShieldCheck } from 'lucide-react';

export function Features() {
  const t = useTranslations('HomePage');

  const features = [
    {
      icon: <Bookmark className="w-5 h-5 text-indigo-600" />,
      iconBg: "bg-indigo-50",
      title: t('Features.feat1Title'),
      desc: t('Features.feat1Desc')
    },
    {
      icon: <LayoutGrid className="w-5 h-5 text-emerald-600" />,
      iconBg: "bg-emerald-50",
      title: t('Features.feat2Title'),
      desc: t('Features.feat2Desc')
    },
    {
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      iconBg: "bg-blue-50",
      title: t('Features.feat3Title'),
      desc: t('Features.feat3Desc')
    },
    {
      icon: <Share2 className="w-5 h-5 text-amber-600" />,
      iconBg: "bg-amber-50",
      title: t('Features.feat4Title'),
      desc: t('Features.feat4Desc')
    },
    {
      icon: <Bell className="w-5 h-5 text-rose-600" />,
      iconBg: "bg-rose-50",
      title: t('Features.feat5Title'),
      desc: t('Features.feat5Desc')
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-violet-600" />,
      iconBg: "bg-violet-50",
      title: t('Features.feat6Title'),
      desc: t('Features.feat6Desc')
    }
  ];

  return (
    <section id="features" className="py-24 bg-[#FAF9F6]/20 relative overflow-hidden">
      {/* Background Dots */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{t('Features.subtitle')}</span>
          <h2 className="text-3xl md:text-[40px] font-extrabold tracking-tight text-gray-900 mt-2 mb-4 leading-tight">
            {t('Features.title')}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-gray-100/60 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-start gap-4"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${feat.iconBg} flex items-center justify-center shrink-0`}>
                {feat.icon}
              </div>

              {/* Text */}
              <div>
                <h3 className="text-lg font-bold text-gray-950 mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
