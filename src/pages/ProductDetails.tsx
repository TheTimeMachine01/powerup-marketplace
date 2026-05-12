import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ShoppingCart, Plus, Minus, Heart, Share2, 
  Loader2, AlertCircle, ChevronLeft, Truck, Shield, Zap 
} from 'lucide-react';
import type { Product } from '@/types/database';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/collections');
      return;
    }

    const loadProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data as Product);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Product not found');
        navigate('/collections');
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    if (!product) return;

    setAddingToCart(true);
    try {
      // Call addToCart multiple times for the requested quantity
      for (let i = 0; i < quantity; i++) {
        await addToCart(product);
      }
      toast.success(`Added ${quantity} item(s) to cart!`);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(quantity + delta, product?.stock_quantity || 1));
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Image Skeleton */}
            <div className="space-y-4">
              <Skeleton className="w-full aspect-square rounded-lg" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded" />
                ))}
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mr-4" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Product Not Found</h2>
              <p className="text-muted-foreground mt-2">The product you're looking for doesn't exist.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discountPercent = product.scrap_value ? Math.round(((product.price - product.scrap_value) / product.price) * 100) : 0;
  const isLowStock = product.stock_quantity < 5;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <button 
          onClick={() => navigate('/collections')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Collections
        </button>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Image Gallery */}
          <div className="space-y-4">
            <AspectRatio ratio={1}>
              <div className="bg-muted rounded-lg overflow-hidden flex items-center justify-center h-full dark:bg-muted/50">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground text-center">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No image available</p>
                  </div>
                )}
              </div>
            </AspectRatio>

            {/* Additional Images (if any) */}
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <button
                  key={i}
                  className="aspect-square rounded-md bg-muted hover:bg-muted/80 transition-colors dark:bg-muted/50 dark:hover:bg-muted/70"
                >
                  <ShoppingCart className="h-6 w-6 mx-auto text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                    {product.name}
                  </h1>
                </div>
                <button className="p-2 hover:bg-muted rounded-full transition-colors dark:hover:bg-muted/50">
                  <Heart className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary dark:bg-primary/20">
                  {product.ah_rating} AH Rating
                </Badge>
                {isOutOfStock && (
                  <Badge variant="destructive" className="dark:bg-destructive/20">
                    Out of Stock
                  </Badge>
                )}
                {isLowStock && !isOutOfStock && (
                  <Badge variant="secondary" className="bg-warning/10 text-warning dark:bg-warning/20">
                    Low Stock ({product.stock_quantity} left)
                  </Badge>
                )}
                {product.warranty_months && (
                  <Badge variant="secondary" className="bg-success/10 text-success dark:bg-success/20">
                    {product.warranty_months} Month Warranty
                  </Badge>
                )}
              </div>
            </div>

            {/* Pricing */}
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-foreground">₹{product.price?.toLocaleString()}</span>
                  {product.scrap_value && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground line-through">₹{(product.price * 1.2)?.toLocaleString()}</p>
                      <p className="text-sm font-semibold text-success">Exchange value: ₹{product.scrap_value?.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Product Details</h3>
              <p className="text-muted-foreground dark:text-muted-foreground/90">
                Premium quality battery engineered for optimal performance and reliability. Perfect for {product.vehicle_type?.toLowerCase() || 'automotive'} applications.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted dark:bg-muted/50">
                <Truck className="h-5 w-5 text-primary mb-2" />
                <p className="text-xs text-center text-muted-foreground font-medium">Free Delivery</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted dark:bg-muted/50">
                <Shield className="h-5 w-5 text-primary mb-2" />
                <p className="text-xs text-center text-muted-foreground font-medium">Warranty</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted dark:bg-muted/50">
                <Zap className="h-5 w-5 text-primary mb-2" />
                <p className="text-xs text-center text-muted-foreground font-medium">Instant Exchange</p>
              </div>
            </div>

            {/* Add to Cart Section */}
            <Card className="border-border/50">
              <CardContent className="pt-6 space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Quantity:</span>
                  <div className="flex items-center border border-border rounded-lg dark:border-border">
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:hover:bg-muted/50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-semibold w-12 text-center">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock_quantity || isOutOfStock}
                      className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:hover:bg-muted/50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button 
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addingToCart || !user}
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {addingToCart ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-5 w-5" />
                  )}
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>

                {!user && (
                  <p className="text-xs text-muted-foreground text-center">
                    Please log in to add items to cart
                  </p>
                )}

                {/* Share Button */}
                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 border-border dark:border-border"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: `Check out ${product.name} on PowerUp Marketplace!`,
                        url: window.location.href,
                      });
                    } else {
                      toast.success('Link copied to clipboard');
                    }
                  }}
                >
                  <Share2 className="h-5 w-5" />
                  Share Product
                </Button>
              </CardContent>
            </Card>

            {/* Stock Info */}
            {isLowStock && !isOutOfStock && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 dark:bg-warning/20 dark:border-warning/30">
                <p className="text-sm font-medium text-warning dark:text-warning/90">
                  ⚡ Only {product.stock_quantity} items left in stock - order soon!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section (Placeholder) */}
        <div className="mt-16 pt-16 border-t border-border">
          <h2 className="text-2xl font-display font-bold text-foreground mb-8">Related Products</h2>
          <p className="text-muted-foreground">Check out our collections for more products like this.</p>
          <Button 
            variant="outline" 
            className="mt-4 dark:border-border"
            onClick={() => navigate('/collections')}
          >
            Browse All Products
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
