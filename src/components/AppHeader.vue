<template>
  <div class="app-header">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      router
    >
      <el-menu-item index="/">首页</el-menu-item>
      <el-menu-item index="/products">商品</el-menu-item>
      <el-menu-item index="/cart">购物车</el-menu-item>

      <div class="flex-grow" />

      <template v-if="isLoggedIn">
        <el-sub-menu index="user">
          <template #title>
            <el-avatar :size="32" :src="userStore.currentUser?.avatar" />
            <span class="username">{{ userStore.currentUser?.username }}</span>
          </template>
          <el-menu-item index="/profile">个人中心</el-menu-item>
          <el-menu-item index="/orders">我的订单</el-menu-item>
          <el-menu-item index="/address">收货地址</el-menu-item>
          <el-menu-item index="/coupons">我的优惠券</el-menu-item>
          <el-menu-item index="/after-sales">售后服务</el-menu-item>
          <el-menu-item index="/distribution">分销中心</el-menu-item>
          <el-menu-item @click="handleLogout">退出登录</el-menu-item>
        </el-sub-menu>
      </template>
      <template v-else>
        <el-menu-item index="/login">登录</el-menu-item>
        <el-menu-item index="/register">注册</el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeIndex = computed(() => route.path)
const isLoggedIn = computed(() => userStore.isLoggedIn)

const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('退出成功')
    router.push('/login')
  } catch (error) {
    ElMessage.error('退出失败')
  }
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-menu-demo {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
}

.flex-grow {
  flex-grow: 1;
}

.username {
  margin-left: 8px;
}

@media (max-width: 768px) {
  .username {
    display: none;
  }
}
</style> 