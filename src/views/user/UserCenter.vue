<template>
  <div class="user-center-container" :class="{ 'is-mobile': isMobileDevice }">
    <!-- 用户信息卡片 -->
    <div class="user-card" :class="{ 'mobile-card': isMobileDevice }">
      <div class="user-info">
        <el-avatar
          :size="isMobileDevice ? 60 : 80"
          :src="user.avatar"
        />
        <div class="user-detail">
          <h2 class="username">{{ user.nickname || user.username }}</h2>
          <p class="user-id">ID: {{ user.id }}</p>
        </div>
      </div>
      <div class="user-stats">
        <div class="stat-item">
          <span class="value">{{ user.balance }}</span>
          <span class="label">余额</span>
        </div>
        <div class="stat-item">
          <span class="value">{{ user.points }}</span>
          <span class="label">积分</span>
        </div>
        <div class="stat-item">
          <span class="value">{{ user.coupons }}</span>
          <span class="label">优惠券</span>
        </div>
      </div>
    </div>

    <!-- 我的订单 -->
    <el-card class="order-card" :class="{ 'mobile-card': isMobileDevice }">
      <template #header>
        <div class="card-header">
          <span>我的订单</span>
          <el-button text @click="router.push('/order')">
            查看全部
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>
      <div class="order-types">
        <div
          v-for="type in orderTypes"
          :key="type.value"
          class="order-type"
          @click="router.push(`/order?status=${type.value}`)"
        >
          <el-badge
            :value="type.count"
            :hidden="!type.count"
            class="type-badge"
          >
            <el-icon class="type-icon">
              <component :is="type.icon" />
            </el-icon>
          </el-badge>
          <span class="type-name">{{ type.label }}</span>
        </div>
      </div>
    </el-card>

    <!-- 我的服务 -->
    <el-card class="service-card" :class="{ 'mobile-card': isMobileDevice }">
      <template #header>
        <div class="card-header">
          <span>我的服务</span>
        </div>
      </template>
      <div class="service-list">
        <div
          v-for="service in services"
          :key="service.value"
          class="service-item"
          @click="handleServiceClick(service)"
        >
          <el-icon class="service-icon">
            <component :is="service.icon" />
          </el-icon>
          <span class="service-name">{{ service.label }}</span>
        </div>
      </div>
    </el-card>

    <!-- 推荐商品 -->
    <el-card class="recommend-card" :class="{ 'mobile-card': isMobileDevice }">
      <template #header>
        <div class="card-header">
          <span>为你推荐</span>
        </div>
      </template>
      <div class="recommend-list">
        <div
          v-for="product in recommendProducts"
          :key="product.id"
          class="recommend-item"
          @click="router.push(`/product/${product.id}`)"
        >
          <el-image
            :src="product.image"
            fit="cover"
            class="product-image"
          />
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-price">¥{{ product.price }}</p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowRight,
  Timer,
  CircleCheck,
  Van,
  Box,
  Star,
  Location,
  Setting,
  Service,
  QuestionFilled
} from '@element-plus/icons-vue'
import { isMobile, onResize, offResize } from '@/utils/responsive'
import type { User, Product } from '@/types/user'

const router = useRouter()

// 响应式状态
const isMobileDevice = ref(isMobile())
const user = ref<User>({
  id: 0,
  username: '',
  nickname: '',
  avatar: '',
  balance: 0,
  points: 0,
  coupons: 0
})

// 订单类型
const orderTypes = [
  { label: '待付款', value: 'pending', icon: Timer, count: 0 },
  { label: '待发货', value: 'paid', icon: CircleCheck, count: 0 },
  { label: '待收货', value: 'shipped', icon: Van, count: 0 },
  { label: '已完成', value: 'completed', icon: Box, count: 0 }
]

// 服务列表
const services = [
  { label: '我的收藏', value: 'favorite', icon: Star },
  { label: '收货地址', value: 'address', icon: Location },
  { label: '账号设置', value: 'settings', icon: Setting },
  { label: '客服中心', value: 'service', icon: Service },
  { label: '帮助中心', value: 'help', icon: QuestionFilled }
]

// 推荐商品
const recommendProducts = ref<Product[]>([])

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = isMobile()
}

// 处理服务点击
const handleServiceClick = (service: typeof services[0]) => {
  switch (service.value) {
    case 'favorite':
      router.push('/favorite')
      break
    case 'address':
      router.push('/address')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'service':
      router.push('/service')
      break
    case 'help':
      router.push('/help')
      break
    default:
      ElMessage.warning('功能开发中')
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // TODO: 实现用户信息获取逻辑
    // const response = await api.getUserInfo()
    // user.value = response.data
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 获取订单统计
const fetchOrderStats = async () => {
  try {
    // TODO: 实现订单统计获取逻辑
    // const response = await api.getOrderStats()
    // orderTypes.forEach(type => {
    //   type.count = response.data[type.value] || 0
    // })
  } catch (error) {
    console.error('获取订单统计失败:', error)
    ElMessage.error('获取订单统计失败')
  }
}

// 获取推荐商品
const fetchRecommendProducts = async () => {
  try {
    // TODO: 实现推荐商品获取逻辑
    // const response = await api.getRecommendProducts()
    // recommendProducts.value = response.data
  } catch (error) {
    console.error('获取推荐商品失败:', error)
    ElMessage.error('获取推荐商品失败')
  }
}

onMounted(() => {
  fetchUserInfo()
  fetchOrderStats()
  fetchRecommendProducts()
  onResize(handleResize)
})

onUnmounted(() => {
  offResize(handleResize)
})
</script>

<style scoped>
.user-center-container {
  padding: 20px;
}

.user-card {
  background: linear-gradient(135deg, #409eff 0%, #2e7d32 100%);
  color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.user-detail {
  flex: 1;
}

.username {
  margin: 0 0 4px;
  font-size: 20px;
}

.user-id {
  margin: 0;
  opacity: 0.8;
  font-size: 14px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-item .value {
  font-size: 20px;
  font-weight: 500;
}

.stat-item .label {
  font-size: 14px;
  opacity: 0.8;
}

.order-card,
.service-card,
.recommend-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.order-types {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
}

.order-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.type-icon {
  font-size: 24px;
  color: #409eff;
}

.type-name {
  font-size: 14px;
  color: #606266;
}

.service-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  padding: 16px 0;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.service-icon {
  font-size: 24px;
  color: #409eff;
}

.service-name {
  font-size: 14px;
  color: #606266;
}

.recommend-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px 0;
}

.recommend-item {
  cursor: pointer;
}

.product-image {
  width: 100%;
  height: 160px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.product-info {
  padding: 0 4px;
}

.product-name {
  margin: 0 0 4px;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  margin: 0;
  color: #f56c6c;
  font-size: 16px;
  font-weight: 500;
}

/* 移动端样式 */
.is-mobile {
  padding: 0;
}

.mobile-card {
  border-radius: 0;
  margin: 0 0 12px;
}

.mobile-card :deep(.el-card__header) {
  padding: 12px 16px;
}

.mobile-card :deep(.el-card__body) {
  padding: 12px 16px;
}

.mobile-card .card-header {
  font-size: 15px;
}

.mobile-card .order-types {
  padding: 12px 0;
}

.mobile-card .type-icon {
  font-size: 20px;
}

.mobile-card .type-name {
  font-size: 12px;
}

.mobile-card .service-list {
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 12px 0;
}

.mobile-card .service-icon {
  font-size: 20px;
}

.mobile-card .service-name {
  font-size: 12px;
}

.mobile-card .recommend-list {
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px 0;
}

.mobile-card .product-image {
  height: 120px;
}

.mobile-card .product-name {
  font-size: 13px;
}

.mobile-card .product-price {
  font-size: 14px;
}
</style> 