import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeftRight, CreditCard } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({ open, onOpenChange }) => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
    checkout,
    loading 
  } = useCart();

  const handleCheckout = async () => {
    try {
      await checkout();
      onOpenChange(false);
    } catch (err) {
      // Error handled in context
    }
  };

  const total = getCartTotal();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-display">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart
            <Badge variant="secondary">{cartItems.length} items</Badge>
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-display font-semibold text-lg mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-sm">
              Add some batteries to get started!
            </p>
            <Button 
              className="mt-6" 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {cartItems.map((item) => {
                  if (!item.product) return null;
                  
                  const itemPrice = item.product.price;

                  return (
                    <div key={item.id} className="flex gap-4 p-4 rounded-lg bg-muted/30 border">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {item.product.image_url ? (
                          <img 
                            src={item.product.image_url} 
                            alt={item.product.name}
                            className="object-contain w-full h-full rounded-lg"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.product.brand} • {item.product.ah_rating} AH
                        </p>

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-sm">
                              ₹{(itemPrice * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 mt-auto space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-success">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-display font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleCheckout}
                disabled={loading}
              >
                <CreditCard className="h-5 w-5" />
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
