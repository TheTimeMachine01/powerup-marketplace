import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import type { CartItem, Product } from '@/types/database';
import { toast } from 'sonner';

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (product: Product, withExchange: boolean) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  updateExchange: (itemId: string, withExchange: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      const { data, error } = await db
        .from('carts')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
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

  const addToCart = async (product: Product, withExchange: boolean) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const existingItem = cartItems.find(item => 
        item.product_id === product.id && item.with_exchange === withExchange
      );

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        const { error } = await db
          .from('carts')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
            with_exchange: withExchange,
          });

        if (error) throw error;
        await fetchCart();
      }
      toast.success('Added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add to cart');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await db
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
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await db
        .from('carts')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
      setCartItems(prev => 
        prev.map(item => item.id === itemId ? { ...item, quantity } : item)
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error('Failed to update quantity');
    }
  };

  const updateExchange = async (itemId: string, withExchange: boolean) => {
    try {
      const { error } = await db
        .from('carts')
        .update({ with_exchange: withExchange })
        .eq('id', itemId);

      if (error) throw error;
      setCartItems(prev => 
        prev.map(item => item.id === itemId ? { ...item, with_exchange: withExchange } : item)
      );
    } catch (err) {
      console.error('Error updating exchange:', err);
      toast.error('Failed to update exchange option');
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await db
        .from('carts')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      if (!item.product) return total;
      const price = item.with_exchange 
        ? item.product.price - item.product.scrap_value 
        : item.product.price;
      return total + (price * item.quantity);
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
      updateExchange,
      clearCart,
      getCartTotal,
      getCartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
