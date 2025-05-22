import { defineStore } from 'pinia';
import { ref } from 'vue';
import { request } from '../utils/request';

export const useCouponStore = defineStore('coupon', () => {
  const loading = ref(false);

  // 获取优惠券列表
  const getCoupons = async (params: {
    page?: number;
    page_size?: number;
    status?: string;
  }) => {
    try {
      loading.value = true;
      const response = await request.get('/api/coupons', { params });
      return response;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 获取可领取的优惠券列表
  const getAvailableCoupons = async () => {
    try {
      loading.value = true;
      const response = await request.get('/api/coupons/available');
      return response;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 领取优惠券
  const receiveCoupon = async (couponId: number) => {
    try {
      loading.value = true;
      const response = await request.post(`/api/coupons/${couponId}/receive`);
      return response;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 获取优惠券详情
  const getCouponDetail = async (couponId: number) => {
    try {
      loading.value = true;
      const response = await request.get(`/api/coupons/${couponId}`);
      return response;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 检查优惠券是否可用
  const checkCouponAvailable = async (couponId: number, amount: number) => {
    try {
      loading.value = true;
      const response = await request.post(`/api/coupons/${couponId}/check`, {
        amount,
      });
      return response;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    getCoupons,
    getAvailableCoupons,
    receiveCoupon,
    getCouponDetail,
    checkCouponAvailable,
  };
}); 