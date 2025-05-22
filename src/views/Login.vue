<template>
  <div class="login-container">
    <div class="login-box">
      <h2>登录</h2>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="0"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名/手机号"
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
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
        
        <div class="other-login">
          <div class="divider">
            <span>其他登录方式</span>
          </div>
          
          <div class="social-login">
            <el-button
              class="wechat-login"
              @click="handleWechatLogin"
            >
              <i class="fab fa-weixin"></i>
              微信登录
            </el-button>
          </div>
        </div>
        
        <div class="register-link">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
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

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await userStore.login({
      username: form.username,
      password: form.password
    })
    
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败')
  } finally {
    loading.value = false
  }
}

const handleWechatLogin = () => {
  // 微信登录配置
  const appId = import.meta.env.VITE_WECHAT_APP_ID
  const redirectUri = encodeURIComponent(`${window.location.origin}/wechat-callback`)
  const scope = 'snsapi_userinfo'
  const state = 'wechat_login'
  
  // 跳转到微信授权页面
  const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
  window.location.href = url
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.login-form {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
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

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.wechat-login {
  background: #07c160;
  border-color: #07c160;
  color: #fff;
}

.wechat-login:hover {
  background: #06ad56;
  border-color: #06ad56;
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

@media (max-width: 768px) {
  .login-box {
    width: 90%;
    padding: 20px;
  }
}
</style> 