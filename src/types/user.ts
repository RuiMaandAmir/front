export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  balance: number
  points: number
  coupons: number
}

export interface Product {
  id: number
  name: string
  image: string
  price: number
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
}

export interface LoginRequest {
  username: string
  password: string
} 