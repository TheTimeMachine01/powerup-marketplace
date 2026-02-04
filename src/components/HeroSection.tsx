import React from 'react';
import { Button } from '@/components/ui/button';
import { Car, Bike, Zap, Shield, Truck, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-automotive-dark py-20 lg:py-28">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm">
              <Zap className="h-4 w-4" />
              <span>Premium Quality Batteries</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-primary-foreground leading-tight">
              Power Your
              <br />
              <span className="text-warning">Journey</span> Forward
            </h1>

            <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto lg:mx-0">
              India's trusted destination for car and bike batteries. Get the best prices with instant exchange discounts and free doorstep delivery.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                variant="secondary"
                className="gap-2 text-base font-semibold"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Car className="h-5 w-5" />
                Find Your Battery
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Truck className="h-5 w-5" />
                <span className="text-sm">Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Warranty Assured</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Zap className="h-5 w-5" />
                <span className="text-sm">Instant Exchange</span>
              </div>
            </div>
          </div>

          {/* Vehicle Icons */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              <div className="w-72 h-72 rounded-full bg-primary-foreground/5 flex items-center justify-center">
                <div className="w-56 h-56 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                    <Zap className="h-20 w-20 text-warning" />
                  </div>
                </div>
              </div>
              
              {/* Floating Icons */}
              <div className="absolute top-4 right-0 p-4 rounded-xl bg-primary-foreground/10 backdrop-blur animate-bounce">
                <Car className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="absolute bottom-8 left-0 p-4 rounded-xl bg-primary-foreground/10 backdrop-blur animate-bounce" style={{ animationDelay: '0.5s' }}>
                <Bike className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
