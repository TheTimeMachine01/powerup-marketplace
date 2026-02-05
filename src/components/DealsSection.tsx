import React, { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/supabase';
import { ProductCard } from './ProductCard';
import { AuthModal } from './AuthModal';
import { Zap, Percent, Flame } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { Product } from '@/types/database';

export const DealsSection: React.FC = () => {
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await db
        .from('products')
        .select('*')
        .gt('stock_quantity', 0)
        .order('scrap_value', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching deals:', error);
        setLoading(false);
        return;
      }
      setDealProducts((data || []) as Product[]);
    } catch (err) {
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="h-10 w-64 bg-muted animate-pulse rounded-lg mb-8 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (dealProducts.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 text-orange-600 mb-6 shadow-sm">
            <Flame className="h-4 w-4 fill-orange-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Hot Deals of the Week</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 mb-6 tracking-tight">
            Premium Power, <span className="text-primary italic">Better Prices.</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            Upgrade your vehicle's heartbeat with our top-rated batteries. Save up to ₹3,000 with our exclusive core exchange program.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-7xl mx-auto px-4 md:px-12">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-8 py-10">
              {dealProducts.map((product, index) => {
                const isSelected = current === index;
                const savingPercentage = Math.round((product.scrap_value / product.price) * 100);
                
                return (
                  <CarouselItem key={product.id} className="pl-4 md:pl-8 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="h-full group p-2">
                      <div className={`relative h-full transition-all duration-700 ${
                        isSelected ? 'scale-105 z-20' : 'scale-90 opacity-40 blur-[1px]'
                      }`}>
                        {/* Savings Overlay */}
                        <div className="absolute top-6 left-6 z-20">
                          <div className="bg-orange-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-xl flex items-center gap-1.5">
                            <Zap className="h-4 w-4 fill-white" />
                            {savingPercentage}% OFF
                          </div>
                        </div>

                        {/* Product Image & Card container - Using a simpler overflow hidden wrapper */}
                        <div className={`bg-white rounded-[2rem] transition-shadow duration-500 overflow-hidden h-full ${
                          isSelected ? 'shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-primary/20' : 'shadow-none border-slate-100'
                        } border`}>
                          <ProductCard 
                            product={product} 
                            onAuthRequired={() => setAuthModalOpen(true)}
                          />
                        </div>

                        {/* Decoration */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            
            {/* Custom Navigation */}
            <CarouselPrevious className="hidden md:flex -left-12 h-12 w-12 border-2 border-slate-200 bg-white text-slate-600 hover:bg-primary hover:border-primary hover:text-white transition-all shadow-lg" />
            <CarouselNext className="hidden md:flex -right-12 h-12 w-12 border-2 border-slate-200 bg-white text-slate-600 hover:bg-primary hover:border-primary hover:text-white transition-all shadow-lg" />
          </Carousel>
          
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {dealProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  current === index ? 'bg-primary w-8' : 'bg-slate-300 w-2 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 flex flex-wrap justify-center gap-10 md:gap-20 grayscale opacity-50 px-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5" />
            <span className="font-bold uppercase tracking-widest text-sm text-slate-800">Official Warranty</span>
          </div>
          <div className="flex items-center gap-3">
            <Percent className="h-5 w-5" />
            <span className="font-bold uppercase tracking-widest text-sm text-slate-800">Guaranteed Cashback</span>
          </div>
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5" />
            <span className="font-bold uppercase tracking-widest text-sm text-slate-800">Verified Products</span>
          </div>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </section>
  );
};
