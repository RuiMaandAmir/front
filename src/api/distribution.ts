import request from './request';

// 获取分销状态
export const getDistributionStatus = () => {
  return request.get('/accounts/distribution/status/');
};

// 申请成为分销商
export const applyDistribution = (data: {
  name: string;
  phone: string;
  id_card: string;
  bank_account: string;
  bank_name: string;
}) => {
  return request.post('/accounts/distribution/apply/', data);
};

// 获取分销订单
export const getDistributionOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return request.get('/accounts/distribution/orders/', { params });
};

// 获取分销佣金
export const getDistributionCommission = (params?: {
  page?: number;
  limit?: number;
  type?: string;
}) => {
  return request.get('/accounts/distribution/commission/', { params });
};

// 提现申请
export const applyWithdrawal = (data: {
  amount: number;
  bank_account: string;
  bank_name: string;
}) => {
  return request.post('/accounts/distribution/withdrawal/', data);
}; 