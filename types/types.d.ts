declare module 'vue-chartjs'
declare module '@iconify/vue'

// Tipos globales de Nuxt
declare module '#app' {
  interface NuxtApp {
    $supabase: any
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $supabase: any
  }
}

// Tipos de usuario y autenticación
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'customer' | 'manager';
  name?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id_user: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user' | 'customer' | 'manager';
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Tipos de productos
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  category_id: string;
  category: Category;
  stock: number;
  sku: string;
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  slug: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos de carrito
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
}

// Tipos de órdenes
export interface Order {
  id: string;
  user_id: string;
  user: User;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  shipping_address: Address;
  billing_address: Address;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

// Tipos de dirección
export interface Address {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos de wishlist
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product: Product;
  created_at: string;
}

// Tipos de reviews
export interface Review {
  id: string;
  user_id: string;
  user: User;
  product_id: string;
  product: Product;
  rating: number;
  title: string;
  comment: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos de cupones
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_amount?: number;
  max_uses?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos de notificaciones
export interface Notification {
  id: string;
  user_id: string;
  type: 'order' | 'product' | 'promotion' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  data?: any;
  created_at: string;
}

// Tipos de analytics
export interface AnalyticsData {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  average_order_value: number;
  top_products: Product[];
  sales_by_month: { month: string; sales: number }[];
  orders_by_status: { status: string; count: number }[];
}

// Tipos de configuración
export interface AppConfig {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  shipping: {
    free_shipping_threshold: number;
    default_shipping_cost: number;
  };
  payment: {
    accepted_methods: string[];
    currency: string;
    tax_rate: number;
  };
}

// Tipos de errores
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Tipos de respuesta de API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: ApiError;
}

// Tipos de filtros
export interface ProductFilters {
  category_id?: string;
  min_price?: number;
  max_price?: number;
  tags?: string[];
  is_featured?: boolean;
  sort_by?: 'name' | 'price' | 'created_at' | 'popularity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
