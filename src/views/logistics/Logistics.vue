<template>
  <div class="logistics-container" :class="{ 'is-mobile': isMobileDevice }">
    <!-- 移动端头部 -->
    <div v-if="isMobileDevice" class="mobile-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="header-title">物流跟踪</div>
    </div>

    <!-- 物流信息 -->
    <el-card class="logistics-card" :class="{ 'mobile-card': isMobileDevice }">
      <div class="logistics-info">
        <div class="company">
          <span class="label">物流公司：</span>
          <span class="value">{{ logistics.company }}</span>
        </div>
        <div class="tracking-number">
          <span class="label">物流单号：</span>
          <span class="value">{{ logistics.tracking_number }}</span>
          <el-button
            v-if="logistics.tracking_number"
            text
            type="primary"
            size="small"
            @click="handleCopyTrackingNumber"
          >
            复制
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 收货信息 -->
    <el-card class="address-card" :class="{ 'mobile-card': isMobileDevice }">
      <template #header>
        <div class="card-header">
          <el-icon><Location /></el-icon>
          <span>收货信息</span>
        </div>
      </template>
      <div class="address-info">
        <p class="contact">
          <span class="name">{{ order.address?.name }}</span>
          <span class="phone">{{ order.address?.phone }}</span>
        </p>
        <p class="address">{{ order.address?.full_address }}</p>
      </div>
    </el-card>

    <!-- 物流轨迹 -->
    <el-card class="timeline-card" :class="{ 'mobile-card': isMobileDevice }">
      <template #header>
        <div class="card-header">
          <el-icon><Van /></el-icon>
          <span>物流轨迹</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(track, index) in logistics.tracks"
          :key="index"
          :type="index === 0 ? 'primary' : ''"
          :hollow="index !== 0"
          :timestamp="track.time"
        >
          {{ track.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 商品信息 -->
    <el-card class="goods-card" :class="{ 'mobile-card': isMobileDevice }">
      <template #header>
        <div class="card-header">
          <el-icon><Goods /></el-icon>
          <span>商品信息</span>
        </div>
      </template>
      <div class="goods-list">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="goods-item"
          @click="router.push(`/product/${item.product_id}`)"
        >
          <el-image
            :src="item.image"
            fit="cover"
            class="goods-image"
          />
          <div class="goods-info">
            <h3 class="goods-name">{{ item.name }}</h3>
            <p class="goods-specs">{{ item.specs }}</p>
            <div class="goods-price-qty">
              <span class="goods-price">¥{{ item.price }}</span>
              <span class="goods-quantity">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Location,
  Van,
  Goods
} from '@element-plus/icons-vue'
import { isMobile, onResize, offResize } from '@/utils/responsive'
import type { Order } from '@/types/order'

const router = useRouter()
const route = useRoute()

// 响应式状态
const isMobileDevice = ref(isMobile())
const order = ref<Order>({
  id: 0,
  order_no: '',
  status: 'pending',
  items: [],
  total_amount: 0,
  shipping_fee: 0,
  address: {
    name: '',
    phone: '',
    full_address: ''
  },
  created_at: '',
  updated_at: ''
})

const logistics = ref({
  company: '',
  tracking_number: '',
  tracks: [] as Array<{
    time: string
    content: string
  }>
})

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = isMobile()
}

// 处理复制物流单号
const handleCopyTrackingNumber = () => {
  if (!logistics.value.tracking_number) return
  navigator.clipboard.writeText(logistics.value.tracking_number)
    .then(() => {
      ElMessage.success('物流单号已复制')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    const orderId = route.params.id
    // TODO: 实现订单详情获取逻辑
    // const response = await api.getOrderDetail(orderId)
    // order.value = response.data
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  }
}

// 获取物流信息
const fetchLogistics = async () => {
  try {
    const orderId = route.params.id
    // TODO: 实现物流信息获取逻辑
    // const response = await api.getLogistics(orderId)
    // logistics.value = response.data
  } catch (error) {
    console.error('获取物流信息失败:', error)
    ElMessage.error('获取物流信息失败')
  }
}

onMounted(() => {
  fetchOrderDetail()
  fetchLogistics()
  onResize(handleResize)
})

onUnmounted(() => {
  offResize(handleResize)
})
</script>

<style scoped>
.logistics-container {
  padding: 20px;
}

.logistics-card,
.address-card,
.timeline-card,
.goods-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.logistics-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.company,
.tracking-number {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: #606266;
}

.value {
  color: #303133;
}

.address-info {
  line-height: 1.6;
}

.contact {
  margin: 0 0 8px;
}

.name {
  font-weight: 500;
  margin-right: 12px;
}

.phone {
  color: #606266;
}

.address {
  margin: 0;
  color: #606266;
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.goods-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
}

.goods-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.goods-info {
  flex: 1;
}

.goods-name {
  margin: 0 0 8px;
  font-size: 14px;
  color: #303133;
}

.goods-specs {
  margin: 0 0 8px;
  font-size: 12px;
  color: #909399;
}

.goods-price-qty {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  color: #f56c6c;
  font-weight: 500;
}

.goods-quantity {
  color: #909399;
}

/* 移动端样式 */
.is-mobile {
  padding: 0;
}

.mobile-card {
  margin: 0 0 12px;
  border-radius: 0;
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

.mobile-card .goods-item {
  gap: 8px;
}

.mobile-card .goods-image {
  width: 60px;
  height: 60px;
}

.mobile-card .goods-name {
  font-size: 13px;
  margin-bottom: 6px;
}

.mobile-card .goods-specs {
  font-size: 11px;
  margin-bottom: 6px;
}

.mobile-card :deep(.el-timeline-item__content) {
  font-size: 13px;
}

.mobile-card :deep(.el-timeline-item__timestamp) {
  font-size: 12px;
}
</style> 