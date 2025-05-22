import { defineStore } from 'pinia';
import { request } from '../utils/request';
import type { Address } from '../types';

export const useAddressStore = defineStore('address', {
  state: () => ({
    addresses: [] as Address[],
    loading: false,
  }),

  actions: {
    // 获取地址列表
    async getAddresses() {
      this.loading = true;
      try {
        const response = await request.get('/api/addresses');
        this.addresses = response.data;
        return response;
      } finally {
        this.loading = false;
      }
    },

    // 创建新地址
    async createAddress(addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
      const response = await request.post('/api/addresses', addressData);
      return response;
    },

    // 更新地址
    async updateAddress(id: number, addressData: Partial<Address>) {
      const response = await request.put(`/api/addresses/${id}`, addressData);
      return response;
    },

    // 删除地址
    async deleteAddress(id: number) {
      const response = await request.delete(`/api/addresses/${id}`);
      return response;
    },

    // 设置默认地址
    async setDefaultAddress(id: number) {
      const response = await request.put(`/api/addresses/${id}/default`);
      return response;
    },
  },
}); 