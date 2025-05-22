// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  created_at: string;
  updated_at: string;
}

// 商品相关类型
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number;
  images: string[];
  category_id: number;
  sales: number;
  stock: number;
  is_affiliate_enabled: boolean;
  affiliate_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent?: number;
}

// 订单相关类型
export interface Order {
  id: number;
  order_no: string;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  address: Address;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

// 地址相关类型
export interface Address {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// API响应类型
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// 分销相关类型
export interface AffiliateStats {
  total_commission: number;
  pending_commission: number;
  settled_commission: number;
  total_clicks: number;
  total_conversions: number;
}

export interface AffiliateLink {
  id: number;
  user_id: number;
  product_id: number;
  product: Product;
  link: string;
  clicks: number;
  conversions: number;
  created_at: string;
  updated_at: string;
}

// 购物车相关类型
export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  created_at: string;
  updated_at: string;
}

// 评价相关类型
export interface Review {
  id: number;
  user_id: number;
  user: User;
  product_id: number;
  order_id: number;
  rating: number;
  content: string;
  images: string[];
  likes_count: number;
  is_liked: boolean;
  replies: ReviewReply[];
  created_at: string;
  updated_at: string;
}

export interface ReviewReply {
  id: number;
  review_id: number;
  user_id: number;
  user: User;
  content: string;
  created_at: string;
  updated_at: string;
} 