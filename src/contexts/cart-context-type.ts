import { createContext } from 'react';
import type { CartItem, Product } from '@/types/database';

export interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
