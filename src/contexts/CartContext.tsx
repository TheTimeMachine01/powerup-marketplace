import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { CartItem, Product } from '@/types/database';
import { toast } from 'sonner';
import { CartContext } from './cart-context-type';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('carts')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart:', error);
        return;
      }
      setCartItems((data || []) as CartItem[]);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    setLoading(true);
    try {
      const existingItem = cartItems.find(item => 
        item.product_id === product.id
      );

      if (existingItem) {
        if (existingItem.quantity + 1 > product.stock_quantity) {
          toast.error(`Only ${product.stock_quantity} units available in stock`);
          return;
        }

        // Optimistic update
        setCartItems(prev => prev.map(item => 
          item.id === existingItem.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
        
        const { error } = await supabase
          .from('carts')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
          
        if (error) {
          // Rollback
          setCartItems(prev => prev.map(item => 
            item.id === existingItem.id ? { ...item, quantity: item.quantity } : item
          ));
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from('carts')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          })
          .select(`
            *,
            product:products(*)
          `)
          .single();

        if (error) throw error;
        setCartItems(prev => [...prev, data as CartItem]);
      }
      toast.success('Added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Removed from cart');
    } catch (err) {
      console.error('Error removing from cart:', err);
      toast.error('Failed to remove from cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    if (item.product && quantity > item.product.stock_quantity) {
      toast.error(`Only ${item.product.stock_quantity} units available in stock`);
      return;
    }

    try {
      // Optimistic update
      setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));

      const { error } = await supabase
        .from('carts')
        .update({ quantity })
        .eq('id', itemId);

      if (error) {
        // Rollback
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: item.quantity } : i));
        throw error;
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      toast.error('Failed to clear cart');
    }
  };

  const checkout = async () => {
    if (!user || cartItems.length === 0) return;

    setLoading(true);
    try {
      const total = getCartTotal();
      
      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Clear Cart
      await clearCart();
      
      toast.success('Order placed successfully!');
    } catch (err) {
      console.error('Error during checkout:', err);
      toast.error('Checkout failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      if (!item.product) return total;
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      checkout,
      getCartTotal,
      getCartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}
