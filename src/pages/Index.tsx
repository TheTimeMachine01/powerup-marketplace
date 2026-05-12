import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { DealsSection } from '@/components/DealsSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <DealsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
