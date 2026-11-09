import { useTranslations } from 'next-intl';
import { Puzzle, Search, Bookmark, LayoutGrid } from 'lucide-react';

export function HowItWorks() {
  const t = useTranslations('HomePage');

  const steps = [
    {
      number: 1,
      icon: <Puzzle className="w-8 h-8 text-indigo-600" />,
      title: t('HowItWorks.step1Title'),
      desc: t('HowItWorks.step1Desc')
    },
    {
      number: 2,
      icon: <Search className="w-8 h-8 text-indigo-600" />,
      title: t('HowItWorks.step2Title'),
      desc: t('HowItWorks.step2Desc')
    },
    {
      number: 3,
      icon: <Bookmark className="w-8 h-8 text-indigo-600" />,
      title: t('HowItWorks.step3Title'),
      desc: t('HowItWorks.step3Desc')
    },
    {
      number: 4,
      icon: <LayoutGrid className="w-8 h-8 text-indigo-600" />,
      title: t('HowItWorks.step4Title'),
      desc: t('HowItWorks.step4Desc')
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white border-y border-gray-100/60 relative">
      <div className="container mx-auto px-4 text-center max-w-6xl">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-20">
          <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{t('HowItWorks.subtitle')}</span>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold tracking-tight text-gray-900 mt-2 mb-4 leading-tight">
            {t('HowItWorks.title')}
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="relative grid md:grid-cols-4 gap-8 justify-items-center">
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center max-w-[240px] relative z-10">
              
              {/* Icon Container */}
              <div className="w-20 h-20 rounded-full bg-indigo-50 border-4 border-white shadow-md flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
                {step.icon}
              </div>

              {/* Step Number Badge */}
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                {step.number}
              </div>

              <h3 className="text-lg font-extrabold text-gray-950 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {step.desc}
              </p>

              {/* Connecting Dotted Line (between elements) */}
              {idx < 3 && (
                <div className="hidden md:block absolute top-10 left-[65%] w-[70%] border-t-2 border-dashed border-gray-200 -z-10"></div>
              )}

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
