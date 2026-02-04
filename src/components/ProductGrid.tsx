import React, { useEffect, useState } from 'react';
import { db } from '@/lib/supabase';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal, Car, Bike, Battery } from 'lucide-react';
import type { Product } from '@/types/database';
import { AuthModal } from './AuthModal';

export const ProductGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await db
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVehicle = vehicleFilter === 'all' || product.vehicle_type === vehicleFilter;
      return matchesSearch && matchesVehicle;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'ah':
          return b.ah_rating - a.ah_rating;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <section id="products" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Our <span className="text-primary">Battery</span> Collection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the perfect battery for your vehicle. All products come with warranty and free installation support.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by brand or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={vehicleFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => setVehicleFilter('all')}
            >
              <Battery className="h-4 w-4" />
              All
            </Button>
            <Button
              variant={vehicleFilter === 'car' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => setVehicleFilter('car')}
            >
              <Car className="h-4 w-4" />
              Car
            </Button>
            <Button
              variant={vehicleFilter === 'bike' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => setVehicleFilter('bike')}
            >
              <Bike className="h-4 w-4" />
              Bike
            </Button>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="ah">AH Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Battery className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAuthRequired={() => setAuthModalOpen(true)}
              />
            ))}
          </div>
        )}
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </section>
  );
};
