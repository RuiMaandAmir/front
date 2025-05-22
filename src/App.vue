<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, ShoppingCart } from '@element-plus/icons-vue';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { useUserStore } from './stores/user';
import { useCartStore } from './stores/cart';

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();

const searchQuery = ref('');

const isLoggedIn = computed(() => userStore.isLoggedIn);
const cartCount = computed(() => cartStore.totalCount);

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    });
  }
};

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};

const goToCart = () => {
  router.push('/cart');
};

const goToProfile = () => {
  router.push('/profile');
};

const goToOrders = () => {
  router.push('/profile?tab=orders');
};

const goToAffiliate = () => {
  router.push('/affiliate');
};

const handleLogout = async () => {
  try {
    await userStore.logout();
    ElMessage.success('退出成功');
    router.push('/');
  } catch (error) {
    ElMessage.error('退出失败');
  }
};
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-content">
          <div class="logo">
            <img src="./assets/logo.png" alt="伊客拉穆商城" class="logo-img" />
            <span class="logo-text">伊客拉穆商城</span>
          </div>
          
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索火锅丸子、清真食品..."
              class="search-input"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="nav-right">
            <template v-if="isLoggedIn">
              <el-dropdown>
                <span class="user-info">
                  <el-avatar :size="32" :src="userStore.currentUser?.avatar">
                    {{ userStore.currentUser?.username?.charAt(0) }}
                  </el-avatar>
                  <span class="username">{{ userStore.currentUser?.username }}</span>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
                    <el-dropdown-item @click="goToOrders">我的订单</el-dropdown-item>
                    <el-dropdown-item @click="goToAffiliate">分销中心</el-dropdown-item>
                    <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <el-button type="text" @click="goToLogin">登录</el-button>
              <el-button type="text" @click="goToRegister">注册</el-button>
            </template>
            
            <el-badge :value="cartCount" class="cart-badge">
              <el-button type="text" class="cart-btn" @click="goToCart">
                <el-icon><ShoppingCart /></el-icon>
                <span class="cart-text">购物车</span>
              </el-button>
            </el-badge>
          </div>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>

      <!-- 页脚 -->
      <el-footer class="footer">
        <div class="footer-content">
          <div class="footer-section">
            <h4>关于我们</h4>
            <p>伊客拉穆商城是专业的清真食品电商平台</p>
            <p>提供优质的火锅丸子、清真食品等</p>
          </div>
          <div class="footer-section">
            <h4>客户服务</h4>
            <p>配送说明</p>
            <p>退换货政策</p>
            <p>食品安全</p>
          </div>
          <div class="footer-section">
            <h4>联系我们</h4>
            <p>客服电话：400-xxx-xxxx</p>
            <p>工作时间：9:00-18:00</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2024 伊客拉穆商城 版权所有</p>
        </div>
      </el-footer>
    </div>
  </el-config-provider>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-img {
  height: 40px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #2e7d32;
}

.search-box {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  background: #f5f7fa;
}

.search-input :deep(.el-input__inner) {
  height: 40px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  color: #333;
}

.cart-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
}

.cart-text {
  margin-left: 5px;
}

.main-content {
  margin-top: 60px;
  flex: 1;
  background: #f5f7fa;
}

.footer {
  background: #2e7d32;
  color: #fff;
  padding: 40px 20px 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-section h4 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #fff;
}

.footer-section p {
  margin: 8px 0;
  color: rgba(255, 255, 255, 0.8);
}

.footer-bottom {
  max-width: 1200px;
  margin: 20px auto 0;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .header-content {
    padding: 0 10px;
  }

  .logo-text {
    display: none;
  }

  .search-box {
    margin: 0 10px;
  }

  .username {
    display: none;
  }

  .cart-text {
    display: none;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
