import { defineStore } from 'pinia';
import { ref } from 'vue';
import { request } from '../utils/request';
import type { Product, ProductListResponse, Review } from '../types';

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([]);
  const currentProduct = ref<Product | null>(null);
  const loading = ref(false);

  // 评价相关状态
  const reviews = ref<Review[]>([]);
  const loadingReviews = ref(false);

  // 收藏夹相关
  const getCollectionFolders = () => {
    return request.get('/api/collection/folders/')
  }

  const getCollectionFolder = (id: string) => {
    return request.get(`/api/collection/folders/${id}/`)
  }

  const createCollectionFolder = (data: any) => {
    return request.post('/api/collection/folders/', data)
  }

  const updateCollectionFolder = (id: string, data: any) => {
    return request.put(`/api/collection/folders/${id}/`, data)
  }

  const deleteCollectionFolder = (id: string) => {
    return request.delete(`/api/collection/folders/${id}/`)
  }

  const getCollections = (params: any) => {
    return request.get('/api/collection/', { params })
  }

  const createCollection = (data: any) => {
    return request.post('/api/collection/', data)
  }

  const updateCollection = (id: string, data: any) => {
    return request.put(`/api/collection/${id}/`, data)
  }

  const deleteCollection = (id: string) => {
    return request.delete(`/api/collection/${id}/`)
  }

  const getCollectionShare = (folderId: string) => {
    return request.get(`/api/collection/folders/${folderId}/share/`)
  }

  const createCollectionShare = (folderId: string) => {
    return request.post(`/api/collection/folders/${folderId}/share/`)
  }

  const getCollectionShareFolder = (code: string) => {
    return request.get(`/api/collection/share/${code}/`)
  }

  const getShareCollections = (params: any) => {
    return request.get('/api/collection/share/', { params })
  }

  // 获取商品列表
  const getProducts = async (params?: any) => {
    try {
      loading.value = true;
      const response = await request.get('/api/products/', { params });
      products.value = response.data.items;
      return response;
    } finally {
      loading.value = false;
    }
  };

  // 获取商品详情
  const getProductDetail = async (id: number) => {
    try {
      loading.value = true;
      const response = await request.get(`/api/products/${id}/`);
      currentProduct.value = response.data;
      return response;
    } finally {
      loading.value = false;
    }
  };

  // 搜索商品
  const searchProducts = async (params: {
    keyword: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
  }) => {
    try {
      loading.value = true;
      const response = await request.get<ProductListResponse>('/api/products/search', { params });
      products.value = response.data.items;
      return response;
    } finally {
      loading.value = false;
    }
  };

  // 获取热门商品
  const getHotProducts = async () => {
    try {
      loading.value = true;
      const response = await request.get('/products/recommendations/hot/');
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取推荐商品
  const getRecommendedProducts = async () => {
    try {
      loading.value = true;
      const response = await request.get<ProductListResponse>('/api/products/recommended');
      products.value = response.data.items;
      return response;
    } finally {
      loading.value = false;
    }
  };

  // 获取商品评价列表
  const getProductReviews = async (params: {
    product_id: number;
    page?: number;
    page_size?: number;
    rating?: number;
    has_image?: boolean;
  }) => {
    try {
      loadingReviews.value = true;
      const response = await request.get('/api/products/reviews', { params });
      return response;
    } finally {
      loadingReviews.value = false;
    }
  };

  // 创建商品评价
  const createReview = async (data: {
    product_id: number;
    rating: number;
    content: string;
    images?: string[];
  }) => {
    try {
      const response = await request.post('/api/products/reviews', data);
      return response;
    } catch (error) {
      throw new Error('评价提交失败，请稍后重试');
    }
  };

  // 删除商品评价
  const deleteReview = async (reviewId: number) => {
    try {
      await request.delete(`/api/products/reviews/${reviewId}`);
    } catch (error) {
      throw new Error('删除评价失败，请稍后重试');
    }
  };

  // 点赞评价
  const likeReview = async (reviewId: number) => {
    try {
      const response = await request.post(`/api/products/reviews/${reviewId}/like`);
      return response;
    } catch (error) {
      throw new Error('点赞失败，请稍后重试');
    }
  };

  // 取消点赞
  const unlikeReview = async (reviewId: number) => {
    try {
      const response = await request.delete(`/api/products/reviews/${reviewId}/like`);
      return response;
    } catch (error) {
      throw new Error('取消点赞失败，请稍后重试');
    }
  };

  // 回复评价
  const replyReview = async (data: {
    review_id: number;
    content: string;
  }) => {
    try {
      const response = await request.post('/api/products/reviews/replies', data);
      return response;
    } catch (error) {
      throw new Error('回复失败，请稍后重试');
    }
  };

  // 删除回复
  const deleteReply = async (replyId: number) => {
    try {
      await request.delete(`/api/products/reviews/replies/${replyId}`);
    } catch (error) {
      throw new Error('删除回复失败，请稍后重试');
    }
  };

  // 创建分销链接
  const createDistributionLink = async (productId: number) => {
    try {
      loading.value = true;
      const response = await request.post(`/api/products/${productId}/create_distribution_link/`);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销统计
  const getDistributionStats = async (productId: number) => {
    try {
      loading.value = true;
      const response = await request.get(`/api/products/${productId}/distribution_stats/`);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销链接列表
  const getDistributionLinks = async (params?: any) => {
    try {
      loading.value = true;
      const response = await request.get('/api/distribution-links/', { params });
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销订单列表
  const getDistributionOrders = async (params?: any) => {
    try {
      loading.value = true;
      const response = await request.get('/api/distribution-orders/', { params });
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销订单统计
  const getDistributionOrderStats = async () => {
    try {
      loading.value = true;
      const response = await request.get('/api/distribution-orders/stats/');
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销配置
  const getDistributionConfig = async () => {
    try {
      loading.value = true;
      const response = await request.get('/api/distribution-configs/current/');
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销商信息
  const getDistributionUser = async () => {
    try {
      loading.value = true;
      const response = await request.get('/api/distribution/user/');
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取提现记录
  const getWithdrawals = async (params?: any) => {
    try {
      loading.value = true;
      const response = await request.get('/api/distribution/withdrawals/', { params });
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 创建提现申请
  const createWithdrawal = async (data: {
    amount: number;
    bank_name: string;
    bank_account: string;
    account_name: string;
    remark?: string;
  }) => {
    try {
      loading.value = true;
      const response = await request.post('/api/distribution/withdrawals/', data);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销商等级列表
  const getDistributionLevels = async () => {
    try {
      loading.value = true;
      const response = await request.get('/api/distribution/levels/');
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销商佣金结算记录
  const getCommissionSettlements = async (params?: any) => {
    try {
      loading.value = true;
      const response = await request.get('/api/distribution/commission-settlements/', { params });
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销商申请记录
  const getDistributionApplication = async () => {
    try {
      loading.value = true;
      const response = await request.get('/api/distribution/applications/current/');
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 创建分销商申请
  const createDistributionApplication = async (data: {
    name: string;
    phone: string;
    id_card: string;
    remark?: string;
  }) => {
    try {
      loading.value = true;
      const response = await request.post('/api/distribution/applications/', data);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销商团队信息
  const getDistributionTeam = async () => {
    try {
      loading.value = true;
      const response = await request.get('/api/distribution/teams/current/');
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 更新分销商团队信息
  const updateDistributionTeam = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      loading.value = true;
      const response = await request.put('/api/distribution/teams/current/', data);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 邀请团队成员
  const inviteTeamMember = async (data: {
    username: string;
  }) => {
    try {
      loading.value = true;
      const response = await request.post('/api/distribution/teams/current/invite/', data);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 移除团队成员
  const removeTeamMember = async (memberId: number) => {
    try {
      loading.value = true;
      const response = await request.delete(`/api/distribution/teams/current/members/${memberId}/`);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取分销商业绩排行
  const getDistributionRanking = async (params: {
    period: string;
    page?: number;
    page_size?: number;
  }) => {
    try {
      loading.value = true;
      const response = await request.get('/api/distribution/rankings/', { params });
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取个性化推荐
  const getPersonalizedRecommendations = async () => {
    try {
      loading.value = true;
      const response = await request.get('/products/recommendations/personal/');
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取相关商品
  const getRelatedProducts = async (productId: number) => {
    try {
      loading.value = true;
      const response = await request.get(`/products/recommendations/related/${productId}/`);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 获取新品推荐
  const getNewProducts = async () => {
    try {
      loading.value = true;
      const response = await request.get('/products/recommendations/new/');
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  // 记录用户行为
  const recordUserBehavior = async (productId: number, behaviorType: 'view' | 'cart' | 'purchase' | 'favorite' | 'share') => {
    try {
      const response = await request.post('/products/behavior/record/', {
        product_id: productId,
        behavior_type: behaviorType
      });
      return response.data;
    } catch (error) {
      console.error('记录用户行为失败:', error);
      throw error;
    }
  };

  return {
    products,
    currentProduct,
    loading,
    getProducts,
    getProductDetail,
    searchProducts,
    getHotProducts,
    getRecommendedProducts,
    reviews,
    loadingReviews,
    getProductReviews,
    createReview,
    deleteReview,
    likeReview,
    unlikeReview,
    replyReview,
    deleteReply,
    createDistributionLink,
    getDistributionStats,
    getDistributionLinks,
    getDistributionOrders,
    getDistributionOrderStats,
    getDistributionConfig,
    getDistributionUser,
    getWithdrawals,
    createWithdrawal,
    getDistributionLevels,
    getCommissionSettlements,
    getDistributionApplication,
    createDistributionApplication,
    getDistributionTeam,
    updateDistributionTeam,
    inviteTeamMember,
    removeTeamMember,
    getDistributionRanking,
    getPersonalizedRecommendations,
    getRelatedProducts,
    getNewProducts,
    recordUserBehavior,
    getCollectionFolders,
    getCollectionFolder,
    createCollectionFolder,
    updateCollectionFolder,
    deleteCollectionFolder,
    getCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    getCollectionShare,
    createCollectionShare,
    getCollectionShareFolder,
    getShareCollections,
  };
}); 