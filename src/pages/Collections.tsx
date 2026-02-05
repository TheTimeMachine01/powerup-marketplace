import React from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductGrid } from '@/components/ProductGrid';
import { Footer } from '@/components/Footer';

const Collections = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Collections;
