import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权,清除token并跳转到登录页
          localStorage.removeItem('token');
          router.push('/login');
          ElMessage.error('登录已过期,请重新登录');
          break;
        case 403:
          ElMessage.error('没有权限访问');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器错误');
          break;
        default:
          ElMessage.error(error.response.data.message || '请求失败');
      }
    } else {
      ElMessage.error('网络错误,请检查网络连接');
    }
    return Promise.reject(error);
  }
);

export default request; 