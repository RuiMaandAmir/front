<template>
  <div class="callback-container">
    <div class="loading-box">
      <el-icon class="loading-icon" :size="40"><Loading /></el-icon>
      <p class="loading-text">正在处理登录...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { handleOAuthCallback } from '@/utils/oauth'
import { OAuthPlatform } from '@/types/auth'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  const platform = route.params.platform as OAuthPlatform
  
  try {
    const success = await handleOAuthCallback(platform)
    if (success) {
      // 跳转到之前的页面或首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } else {
      router.push('/login')
    }
  } catch (error) {
    console.error('处理登录回调失败:', error)
    ElMessage.error('登录失败，请重试')
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
  background-color: #f5f7fa;
}

.loading-box {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.loading-icon {
  color: #409eff;
  animation: rotate 1s linear infinite;
}

.loading-text {
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