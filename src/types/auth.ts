// 第三方登录平台类型
export enum OAuthPlatform {
  WECHAT = 'wechat',
  DOUYIN = 'douyin',
  // 预留其他平台
}

// 第三方登录配置
export interface OAuthConfig {
  platform: OAuthPlatform
  appId: string
  redirectUri: string
  scope: string
}

// 第三方登录响应
export interface OAuthResponse {
  code: string
  state?: string
}

// 第三方登录结果
export interface OAuthResult {
  token: string
  user: {
    id: number
    username: string
    nickname: string
    avatar: string
    email: string
    phone: string
    role: 'user' | 'admin' | 'distributor'
    openid: string
    unionid?: string
    platform: OAuthPlatform
    created_at: string
    updated_at: string
  }
  isNewUser: boolean
}

// 微信登录配置
export const WECHAT_CONFIG: OAuthConfig = {
  platform: OAuthPlatform.WECHAT,
  appId: import.meta.env.VITE_WECHAT_APP_ID,
  redirectUri: `${window.location.origin}/auth/callback/wechat`,
  scope: 'snsapi_userinfo'
}

// 抖音登录配置
export const DOUYIN_CONFIG: OAuthConfig = {
  platform: OAuthPlatform.DOUYIN,
  appId: import.meta.env.VITE_DOUYIN_APP_ID,
  redirectUri: `${window.location.origin}/auth/callback/douyin`,
  scope: 'user_info'
} 