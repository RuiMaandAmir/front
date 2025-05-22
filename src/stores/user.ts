import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '../types';
import { userApi } from '../api/user';
import request from '@/utils/request';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const userInfo = ref<any>(null);

  // 设置用户信息
  const setUser = (userData: User | null) => {
    user.value = userData;
  };

  // 设置token
  const setToken = (newToken: string | null) => {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  // 登录
  const login = async (username: string, password: string) => {
    try {
      const response = await userApi.login({ username, password });
      setToken(response.data.token);
      setUser(response.data.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // 注册
  const register = async (username: string, password: string, email: string) => {
    try {
      const response = await userApi.register({ username, password, email });
      setUser(response.data.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await userApi.getUserInfo();
      setUser(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // 更新用户信息
  const updateUserInfo = async (data: Partial<User>) => {
    try {
      const response = await userApi.updateUserInfo(data);
      setUser(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // 退出登录
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // 微信登录
  const wechatLogin = async (code: string) => {
    const response = await request.post('/api/users/wechat-login/', { code });
    setToken(response.data.token);
    setUser(response.data.user);
    localStorage.setItem('token', response.data.token);
    return response.data;
  };

  // 检查登录状态
  const checkLogin = () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      return true;
    }
    return false;
  };

  return {
    user,
    token,
    userInfo,
    login,
    register,
    getUserInfo,
    updateUserInfo,
    logout,
    wechatLogin,
    checkLogin,
  };
}); 