import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/marketing/Hero';
import { TwoExperiences } from '@/components/marketing/TwoExperiences';
import { RentalJourney } from '@/components/marketing/RentalJourney';
import { BeforeAfterChaos } from '@/components/marketing/BeforeAfterChaos';
import { OutcomeCapabilities } from '@/components/marketing/OutcomeCapabilities';
import { BrowserExtensionBridge } from '@/components/marketing/BrowserExtensionBridge';
import { B2BSolutions } from '@/components/marketing/B2BSolutions';
import { TrustSecurity } from '@/components/marketing/TrustSecurity';
import { Faq } from '@/components/marketing/Faq';
import { Cta } from '@/components/marketing/Cta';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans antialiased">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TwoExperiences />
        <RentalJourney />
        <BeforeAfterChaos />
        <OutcomeCapabilities />
        <BrowserExtensionBridge />
        <B2BSolutions />
        <TrustSecurity />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
