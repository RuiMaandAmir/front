<template>
  <div class="callback-container">
    <div class="loading-box">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <p>正在处理微信登录...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

onMounted(async () => {
  try {
    const code = route.query.code as string
    const state = route.query.state as string
    
    if (!code || state !== 'wechat_login') {
      throw new Error('无效的微信登录回调')
    }
    
    // 调用微信登录接口
    await userStore.wechatLogin(code)
    
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('微信登录失败:', error)
    ElMessage.error('微信登录失败')
    router.push('/login')
  }
})
</script>

<style scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}

.loading-box {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.loading-icon {
  font-size: 40px;
  color: #409eff;
  animation: rotate 1s linear infinite;
}

.loading-box p {
  margin-top: 20px;
  color: #606266;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 