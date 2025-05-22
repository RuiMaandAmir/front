import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { request } from '@/utils/request'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const register = async (data: {
    username: string
    password: string
    phone: string
  }) => {
    try {
      const response = await request.post('/api/auth/register', data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  const login = async (data: {
    username: string
    password: string
  }) => {
    try {
      const response = await request.post('/api/auth/login', data)
      const { token: newToken, user: userData } = response.data
      token.value = newToken
      user.value = userData
      return response.data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
  }

  return {
    user,
    token,
    register,
    login,
    logout
  }
}) 