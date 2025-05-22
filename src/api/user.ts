import request from './request';
import type { User } from '../types';

export const userApi = {
  // 用户登录
  login(data: { username: string; password: string }) {
    return request.post<{ token: string; user: User }>('/auth/login/', data);
  },

  // 用户注册
  register(data: { username: string; password: string; email: string }) {
    return request.post<{ user: User }>('/auth/register/', data);
  },

  // 获取用户信息
  getUserInfo() {
    return request.get<User>('/auth/user/');
  },

  // 更新用户信息
  updateUserInfo(data: Partial<User>) {
    return request.patch<User>('/auth/user/', data);
  },

  // 修改密码
  changePassword(data: { old_password: string; new_password: string }) {
    return request.post('/auth/change-password/', data);
  },

  // 重置密码
  resetPassword(data: { email: string }) {
    return request.post('/auth/reset-password/', data);
  },
}; 