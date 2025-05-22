export interface OrderItem {
  id: number
  product_id: number
  name: string
  image: string
  specs: string
  price: number
  quantity: number
}

export interface OrderAddress {
  name: string
  phone: string
  full_address: string
}

export interface Order {
  id: number
  order_no: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  items: OrderItem[]
  total_amount: number
  shipping_fee: number
  payment_method?: string
  address: OrderAddress
  created_at: string
  updated_at: string
  paid_at?: string
  shipped_at?: string
  completed_at?: string
} 