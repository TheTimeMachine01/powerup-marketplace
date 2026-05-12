import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Battery, ArrowLeftRight } from 'lucide-react';
import type { Product } from '@/types/database';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';

interface ProductCardProps {
  product: Product;
  onAuthRequired: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAuthRequired }) => {
  const [withExchange, setWithExchange] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const displayPrice = withExchange 
    ? product.price - product.scrap_value 
    : product.price;

  const getStockBadge = () => {
    if (product.stock_quantity === 0) {
      return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
    }
    if (product.stock_quantity < 5) {
      return <Badge variant="destructive" className="text-xs">Low Stock ({product.stock_quantity})</Badge>;
    }
    return <Badge className="bg-success hover:bg-success/90 text-xs">In Stock</Badge>;
  };

  const handleAddToCart = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    setIsAdding(true);
    await addToCart(product, withExchange);
    setIsAdding(false);
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-hover hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-primary/20 border-border dark:border-secondary/50">
      {/* Stock Badge */}
      <div className="absolute top-3 right-3 z-10">
        {getStockBadge()}
      </div>

      {/* Product Image */}
      <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 dark:from-secondary dark:to-secondary/70 p-6 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="object-contain max-h-full transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Battery className="h-24 w-24 text-primary/30 dark:text-primary/40 transition-transform duration-300 group-hover:scale-105" />
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Brand */}
        <p className="text-xs font-medium text-primary uppercase tracking-wide">
          {product.brand}
        </p>

        {/* Name */}
        <h3 className="font-display font-semibold text-foreground line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        {/* Specs */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium">{product.ah_rating} AH</span>
          {product.warranty_months && (
            <>
              <span className="text-border">|</span>
              <span>{product.warranty_months}M Warranty</span>
            </>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-display font-bold text-foreground">
            ₹{displayPrice.toLocaleString()}
          </span>
          {withExchange && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Exchange Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-secondary/40 border border-border dark:border-secondary/40">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            <Label htmlFor={`exchange-${product.id}`} className="text-sm font-medium cursor-pointer">
              Core Exchange
            </Label>
          </div>
          <Switch
            id={`exchange-${product.id}`}
            checked={withExchange}
            onCheckedChange={setWithExchange}
          />
        </div>

        {withExchange && (
          <p className="text-xs text-success">
            Save ₹{product.scrap_value.toLocaleString()} with old battery exchange!
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button 
          variant="outline"
          className="flex-1 gap-2 dark:border-secondary/50 dark:hover:bg-primary/10"
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0 || isAdding}
        >
          <ShoppingCart className="h-4 w-4" />
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};
