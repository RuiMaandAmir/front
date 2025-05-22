import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AffiliateLink, AffiliateCommission, PaginatedResponse } from '../types';
import { affiliateApi } from '../api/affiliate';

export const useAffiliateStore = defineStore('affiliate', () => {
  const affiliateLinks = ref<AffiliateLink[]>([]);
  const commissions = ref<AffiliateCommission[]>([]);
  const loading = ref(false);
  const total = ref(0);
  const stats = ref({
    total_commission: 0,
    pending_commission: 0,
    total_clicks: 0,
    total_conversions: 0,
  });

  // 生成分销链接
  const generateAffiliateLink = async (productId: number) => {
    try {
      loading.value = true;
      const response = await affiliateApi.generateAffiliateLink(productId);
      return response;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销链接列表
  const getAffiliateLinks = async (params?: {
    page?: number;
    page_size?: number;
    product?: number;
  }) => {
    try {
      loading.value = true;
      const response = await affiliateApi.getAffiliateLinks(params);
      affiliateLinks.value = response.data.results;
      total.value = response.data.count;
      return response;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销佣金列表
  const getCommissions = async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }) => {
    try {
      loading.value = true;
      const response = await affiliateApi.getCommissions(params);
      commissions.value = response.data.results;
      total.value = response.data.count;
      return response;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销统计数据
  const getAffiliateStats = async () => {
    try {
      const response = await affiliateApi.getAffiliateStats();
      stats.value = response.data;
      return response;
    } catch (error) {
      throw error;
    }
  };

  // 复制分销链接
  const copyAffiliateLink = (code: string) => {
    return affiliateApi.copyAffiliateLink(code);
  };

  return {
    affiliateLinks,
    commissions,
    loading,
    total,
    stats,
    generateAffiliateLink,
    getAffiliateLinks,
    getCommissions,
    getAffiliateStats,
    copyAffiliateLink,
  };
}); 