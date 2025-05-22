import request from './request';
import type { Order, PaginatedResponse } from '../types';

export const orderApi = {
  // 创建订单
  createOrder(data: {
    products: Array<{ product_id: number; quantity: number }>;
    address: string;
    payment_method: string;
  }) {
    return request.post<Order>('/orders/', data);
  },

  // 获取订单列表
  getOrders(params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }) {
    return request.get<PaginatedResponse<Order>>('/orders/', { params });
  },

  // 获取订单详情
  getOrder(id: number) {
    return request.get<Order>(`/orders/${id}/`);
  },

  // 取消订单
  cancelOrder(id: number) {
    return request.post(`/orders/${id}/cancel/`);
  },

  // 支付订单
  payOrder(id: number, payment_data: any) {
    return request.post(`/orders/${id}/pay/`, payment_data);
  },

  // 确认收货
  confirmOrder(id: number) {
    return request.post(`/orders/${id}/confirm/`);
  },
}; 