
'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { CommunitySection } from '@/components/landing/CommunitySection';
import { CtaSection } from '@/components/landing/CtaSection';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow">
        {/* Parte de Harry Gongora */}
        <HeroSection />

        {/* Parte de Josué Sinisterra */}
        <FeaturesSection />

        {/* Parte de Oscar Valle */}
        <HowItWorksSection />

        {/* Parte de Kevin Quintero */}
        <CommunitySection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
