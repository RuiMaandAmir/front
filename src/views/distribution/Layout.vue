<template>
  <div class="distribution-layout">
    <el-container>
      <el-aside width="240px">
        <div class="sidebar">
          <div class="user-info">
            <el-avatar :size="64" :src="userInfo.avatar" />
            <h3>{{ userInfo.nickname }}</h3>
            <p class="user-level">分销等级：{{ userInfo.distribution_level }}</p>
          </div>
          
          <el-menu
            :default-active="activeMenu"
            class="distribution-menu"
            router
          >
            <el-menu-item index="/distribution">
              <el-icon><HomeFilled /></el-icon>
              <span>分销中心</span>
            </el-menu-item>
            
            <el-menu-item index="/distribution/commission">
              <el-icon><Money /></el-icon>
              <span>佣金管理</span>
            </el-menu-item>
            
            <el-menu-item index="/distribution/products">
              <el-icon><Goods /></el-icon>
              <span>分销商品</span>
            </el-menu-item>
            
            <el-menu-item index="/distribution/team">
              <el-icon><User /></el-icon>
              <span>分销团队</span>
            </el-menu-item>
            
            <el-menu-item index="/distribution/rules">
              <el-icon><Document /></el-icon>
              <span>分销规则</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  HomeFilled,
  Money,
  Goods,
  User,
  Document
} from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()

const userInfo = computed(() => ({
  avatar: userStore.userInfo?.avatar || '',
  nickname: userStore.userInfo?.nickname || '未登录',
  distribution_level: userStore.userInfo?.distribution_level || '普通分销商'
}))

const activeMenu = computed(() => route.path)
</script>

<style scoped>
.distribution-layout {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
}

.el-container {
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 60px);
}

.el-aside {
  background: #fff;
  border-right: 1px solid #e6e6e6;
}

.sidebar {
  padding: 20px 0;
}

.user-info {
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 20px;
}

.user-info h3 {
  margin: 10px 0 5px;
  font-size: 16px;
  color: #333;
}

.user-level {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.distribution-menu {
  border-right: none;
}

.el-main {
  padding: 20px;
  background: #fff;
  margin: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .el-aside {
    width: 100% !important;
    position: fixed;
    z-index: 1000;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s;
  }

  .el-aside.show {
    transform: translateX(0);
  }

  .el-main {
    margin: 0;
    padding: 10px;
  }
}
</style> 