import { OAuthPlatform, OAuthConfig, OAuthResponse } from '@/types/auth'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 生成随机state
const generateState = (): string => {
  return Math.random().toString(36).substring(2, 15)
}

// 获取URL参数
const getUrlParams = (): OAuthResponse => {
  const params = new URLSearchParams(window.location.search)
  return {
    code: params.get('code') || '',
    state: params.get('state') || undefined
  }
}

// 微信登录
export const wechatLogin = async () => {
  const state = generateState()
  localStorage.setItem('oauth_state', state)
  
  const config = {
    appid: import.meta.env.VITE_WECHAT_APP_ID,
    redirect_uri: encodeURIComponent(`${window.location.origin}/auth/callback/wechat`),
    response_type: 'code',
    scope: 'snsapi_userinfo',
    state
  }
  
  const url = `https://open.weixin.qq.com/connect/qrconnect?${Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}#wechat_redirect`
  
  window.location.href = url
}

// 抖音登录
export const douyinLogin = async () => {
  const state = generateState()
  localStorage.setItem('oauth_state', state)
  
  const config = {
    client_key: import.meta.env.VITE_DOUYIN_APP_ID,
    redirect_uri: encodeURIComponent(`${window.location.origin}/auth/callback/douyin`),
    response_type: 'code',
    scope: 'user_info',
    state
  }
  
  const url = `https://open.douyin.com/platform/oauth/connect/?${Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`
  
  window.location.href = url
}

// 处理登录回调
export const handleOAuthCallback = async (platform: OAuthPlatform) => {
  const { code, state } = getUrlParams()
  const savedState = localStorage.getItem('oauth_state')
  
  // 验证state
  if (!state || state !== savedState) {
    ElMessage.error('登录验证失败，请重试')
    return false
  }
  
  // 清除state
  localStorage.removeItem('oauth_state')
  
  if (!code) {
    ElMessage.error('获取授权码失败，请重试')
    return false
  }
  
  try {
    const userStore = useUserStore()
    const response = await userStore.oauthLogin(platform, code)
    
    if (response.isNewUser) {
      ElMessage.success('登录成功，欢迎使用！')
    } else {
      ElMessage.success('登录成功')
    }
    
    return true
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请重试')
    return false
  }
}

// 检查是否在微信浏览器中
export const isWechatBrowser = (): boolean => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.indexOf('micromessenger') !== -1
}

// 检查是否在抖音浏览器中
export const isDouyinBrowser = (): boolean => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.indexOf('douyin') !== -1
} 