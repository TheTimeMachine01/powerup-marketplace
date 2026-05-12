export interface Product {
  id: string;
  name: string;
  brand: string;
  ah_rating: number;
  price: number;
  scrap_value: number;
  stock_quantity: number;
  image_url?: string;
  category?: string;
  vehicle_type?: string;
  warranty_months?: number;
  created_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  shipping_address?: string;
  avatar_url?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'office_staff' | 'delivery_handler' | 'customer';
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at?: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  coupon_id?: string;
  delivery_address?: string;
  payment_intent_id?: string;
  created_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent?: number;
  active: boolean;
  valid_until?: string;
  min_cart_value?: number;
  max_discount?: number;
  created_at?: string;
}
