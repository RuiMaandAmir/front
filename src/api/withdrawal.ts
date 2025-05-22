import request from '@/utils/request'

// 获取提现记录
export function getWithdrawalRecords(params: any) {
  return request({
    url: '/api/withdrawals/',
    method: 'get',
    params
  })
}

// 创建提现申请
export function createWithdrawal(data: any) {
  return request({
    url: '/api/withdrawals/',
    method: 'post',
    data
  })
}

// 获取提现详情
export function getWithdrawalDetail(id: number) {
  return request({
    url: `/api/withdrawals/${id}/`,
    method: 'get'
  })
}

// 取消提现申请
export function cancelWithdrawal(id: number) {
  return request({
    url: `/api/withdrawals/${id}/cancel/`,
    method: 'post'
  })
} 