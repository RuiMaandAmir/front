import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Order, PaginatedResponse } from '../types';
import { orderApi } from '../api/order';
import { request } from '../utils/request';

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const loading = ref(false);
  const total = ref(0);

  // 获取订单列表
  const getOrders = async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }) => {
    loading.value = true;
    try {
      const response = await request.get('/api/orders/', { params });
      orders.value = response.data.results;
      total.value = response.data.count;
      return response;
    } finally {
      loading.value = false;
    }
  };

  // 获取订单详情
  const getOrderDetail = async (id: number) => {
    loading.value = true;
    try {
      const response = await request.get(`/api/orders/${id}/`);
      currentOrder.value = response.data;
      return response;
    } finally {
      loading.value = false;
    }
  };

  // 创建订单
  const createOrder = async (data: {
    address_id: number;
    items: Array<{
      product_id: number;
      quantity: number;
    }>;
    coupon_id?: number;
  }) => {
    loading.value = true;
    try {
      const response = await request.post('/api/orders/', data);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 取消订单
  const cancelOrder = async (id: number) => {
    loading.value = true;
    try {
      const response = await request.post(`/api/orders/${id}/cancel/`);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 确认收货
  const confirmOrder = async (id: number) => {
    loading.value = true;
    try {
      const response = await request.post(`/api/orders/${id}/confirm/`);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 支付订单
  const payOrder = async (id: number, data: {
    payment_method: string;
    coupon_id?: number;
  }) => {
    loading.value = true;
    try {
      const response = await request.post(`/api/orders/${id}/pay/`, data);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取支付记录
  const getPaymentRecords = async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
  }) => {
    loading.value = true;
    try {
      const response = await request.get('/api/payments/', { params });
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取支付详情
  const getPaymentDetail = async (id: number) => {
    loading.value = true;
    try {
      const response = await request.get(`/api/payments/${id}/`);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取物流信息
  const getLogistics = async (id: number) => {
    loading.value = true;
    try {
      const response = await request.get(`/api/orders/${id}/logistics/`);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 申请退款/退货
  const requestRefund = async (id: number, data: {
    type: 'refund' | 'return';
    reason: string;
    description: string;
    images?: string[];
  }) => {
    loading.value = true;
    try {
      const response = await request.post(`/api/orders/${id}/refund/`, data);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取退款记录
  const getRefundRecords = async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }) => {
    loading.value = true;
    try {
      const response = await request.get('/api/refunds/', { params });
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取退款详情
  const getRefundDetail = async (id: number) => {
    loading.value = true;
    try {
      const response = await request.get(`/api/refunds/${id}/`);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 取消退款申请
  const cancelRefund = async (id: number) => {
    loading.value = true;
    try {
      const response = await request.post(`/api/refunds/${id}/cancel/`);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 提交退货物流信息
  const submitReturnLogistics = async (id: number, data: {
    logistics_company: string;
    tracking_no: string;
  }) => {
    loading.value = true;
    try {
      const response = await request.post(`/api/refunds/${id}/return/`, data);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 提交退款评价
  const submitRefundRating = async (id: number, data: {
    rating: number;
    comment?: string;
  }) => {
    loading.value = true;
    try {
      const response = await request.post(`/api/refunds/${id}/rating/`, data);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取退款评价
  const getRefundRating = async (id: number) => {
    loading.value = true;
    try {
      const response = await request.get(`/api/refunds/${id}/rating/`);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取退款统计
  const getRefundStats = async (params?: {
    start_date?: string;
    end_date?: string;
  }) => {
    loading.value = true;
    try {
      const response = await request.get('/api/refunds/stats/', { params });
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取退款通知设置
  const getRefundNotificationSettings = async () => {
    loading.value = true;
    try {
      const response = await request.get('/api/refunds/notification-settings/');
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 更新退款通知设置
  const updateRefundNotificationSettings = async (data: {
    email_notification: boolean;
    sms_notification: boolean;
    wechat_notification: boolean;
    notification_events: string[];
  }) => {
    loading.value = true;
    try {
      const response = await request.put('/api/refunds/notification-settings/', data);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  return {
    orders,
    currentOrder,
    loading,
    total,
    getOrders,
    getOrderDetail,
    createOrder,
    cancelOrder,
    confirmOrder,
    payOrder,
    getPaymentRecords,
    getPaymentDetail,
    getLogistics,
    requestRefund,
    getRefundRecords,
    getRefundDetail,
    cancelRefund,
    submitReturnLogistics,
    submitRefundRating,
    getRefundRating,
    getRefundStats,
    getRefundNotificationSettings,
    updateRefundNotificationSettings,
  };
}); 