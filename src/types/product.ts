export interface Category {
  id: number
  name: string
  image: string
  order: number
  is_active: boolean
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  original_price: number | null
  image: string
  images: string[]
  stock: number
  sales_count: number
  commission_rate: number
  category_id: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface ProductListResponse {
  items: Product[]
  total: number
}

export interface DistributionLink {
  id: number
  product: Product
  code: string
  qr_code: string
  clicks: number
  orders: number
  created_at: string
  updated_at: string
}

export interface Spec {
  id: number
  name: string
  value: string
  price_adjustment: number
  stock: number
  is_active: boolean
}

export interface SpecResponse {
  data: Spec[]
  total: number
}

export interface Review {
  id: number
  user: number
  product: number
  rating: number
  content: string
  created_at: string
}

export interface OrderItem {
  id: number
  product: {
    id: number
    name: string
    image: string
  }
  specifications: Record<string, string>
  price: number
  quantity: number
}

export interface OrderAddress {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
}

export interface DistributionInfo {
  distributor_name: string
  commission_rate: number
  commission_amount: number
  status: 'pending' | 'settled' | 'cancelled'
}

export interface Order {
  id: number
  order_no: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  items: OrderItem[]
  address: OrderAddress
  total_amount: number
  shipping_fee: number
  discount_amount: number
  paid_amount: number
  distribution_info?: DistributionInfo
  created_at: string
  paid_at?: string
  shipped_at?: string
  completed_at?: string
}

export interface OrderResponse {
  items: Order[]
  total: number
}

export interface DistributionStatistics {
  total_sales: number
  total_commission: number
  total_orders: number
  team_size: number
  sales_growth: number
  commission_growth: number
  order_growth: number
  team_growth: number
  trends: {
    dates: string[]
    sales: number[]
    commission: number[]
    orders: number[]
    team: number[]
  }
  product_ranking: Array<{
    id: number
    name: string
    image: string
    sales_count: number
    sales_amount: number
    commission_amount: number
  }>
} 