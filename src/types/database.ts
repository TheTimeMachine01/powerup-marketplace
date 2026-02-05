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
  with_exchange: boolean;
  created_at?: string;
  updated_at?: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  payment_id?: string;
  payment_status: 'pending' | 'completed' | 'failed';
  shipping_address?: string;
  created_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent?: number;
  discount_amount?: number;
  valid_from: string;
  valid_until?: string;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  created_at?: string;
}
