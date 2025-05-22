<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">欢迎登录</h2>
      
      <!-- 微信登录按钮 -->
      <el-button
        type="primary"
        class="login-btn wechat-btn"
        @click="handleWechatLogin"
        :loading="loading"
      >
        <i class="fab fa-weixin"></i>
        微信一键登录
      </el-button>

      <!-- 其他登录方式 -->
      <div class="other-login">
        <div class="divider">
          <span>其他登录方式</span>
        </div>
        
        <!-- 账号密码登录 -->
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名"
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              class="login-btn"
              @click="handleLogin"
              :loading="loading"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 注册链接 -->
      <div class="register-link">
        还没有账号？
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { wechatLogin, isWechatBrowser } from '@/utils/oauth'
import { isMobile, onResize, offResize } from '@/utils/responsive'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const formRef = ref<FormInstance>()

const form = ref({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 响应式状态
const isMobileDevice = ref(isMobile())

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = isMobile()
}

// 处理微信登录
const handleWechatLogin = async () => {
  loading.value = true
  try {
    await wechatLogin()
  } catch (error) {
    console.error('微信登录失败:', error)
    ElMessage.error('微信登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 处理账号密码登录
const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      await userStore.login(form.value.username, form.value.password)
      ElMessage.success('登录成功')
      
      // 跳转到之前的页面或首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error('登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  // 如果在微信浏览器中，自动触发微信登录
  if (isWechatBrowser()) {
    handleWechatLogin()
  }
  
  // 添加窗口大小变化监听
  onResize(handleResize)
})

onUnmounted(() => {
  // 移除窗口大小变化监听
  offResize(handleResize)
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
  font-size: 24px;
}

.login-btn {
  width: 100%;
  margin-bottom: 20px;
  height: 44px;
  font-size: 16px;
}

.wechat-btn {
  background-color: #07c160;
  border-color: #07c160;
}

.wechat-btn:hover {
  background-color: #06ad56;
  border-color: #06ad56;
}

.other-login {
  margin-top: 30px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #909399;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #dcdfe6;
}

.divider span {
  padding: 0 10px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
}

.register-link a {
  color: #409eff;
  text-decoration: none;
}

.register-link a:hover {
  color: #66b1ff;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .login-container {
    padding: 16px;
  }

  .login-box {
    padding: 24px;
  }

  .title {
    font-size: 20px;
    margin-bottom: 24px;
  }

  .login-btn {
    height: 40px;
    font-size: 15px;
  }

  .other-login {
    margin-top: 24px;
  }

  .divider {
    margin: 16px 0;
  }

  .register-link {
    margin-top: 16px;
    font-size: 14px;
  }
}
</style> 