import request from './request';
import type { AffiliateLink, AffiliateCommission, PaginatedResponse } from '../types';

export const affiliateApi = {
  // 生成分销链接
  generateAffiliateLink(productId: number) {
    return request.post<AffiliateLink>(`/affiliate/links/`, { product: productId });
  },

  // 获取分销链接列表
  getAffiliateLinks(params?: {
    page?: number;
    page_size?: number;
    product?: number;
  }) {
    return request.get<PaginatedResponse<AffiliateLink>>('/affiliate/links/', { params });
  },

  // 获取分销佣金列表
  getCommissions(params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }) {
    return request.get<PaginatedResponse<AffiliateCommission>>('/affiliate/commissions/', { params });
  },

  // 获取分销统计数据
  getAffiliateStats() {
    return request.get<{
      total_commission: number;
      pending_commission: number;
      total_clicks: number;
      total_conversions: number;
    }>('/affiliate/stats/');
  },

  // 复制分销链接
  copyAffiliateLink(code: string) {
    return `${window.location.origin}/product?ref=${code}`;
  },
}; 