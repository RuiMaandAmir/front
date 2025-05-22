import request from './request';
import type { Product, Category, PaginatedResponse } from '../types';

export const productApi = {
  // 获取商品列表
  getProducts(params?: {
    page?: number;
    page_size?: number;
    category?: number;
    search?: string;
    sort?: string;
  }) {
    return request.get<PaginatedResponse<Product>>('/products/', { params });
  },

  // 获取商品详情
  getProduct(id: number) {
    return request.get<Product>(`/products/${id}/`);
  },

  // 获取分类列表
  getCategories() {
    return request.get<Category[]>('/categories/');
  },

  // 获取分类详情
  getCategory(id: number) {
    return request.get<Category>(`/categories/${id}/`);
  },

  // 获取推荐商品
  getRecommendedProducts() {
    return request.get<Product[]>('/products/recommended/');
  },

  // 获取热门商品
  getHotProducts() {
    return request.get<Product[]>('/products/hot/');
  },

  // 获取新品
  getNewProducts() {
    return request.get<Product[]>('/products/new/');
  },
}; 