<template>
  <div class="order-detail-container" :class="{ 'is-mobile': isMobileDevice }">
    <!-- 移动端头部 -->
    <div v-if="isMobileDevice" class="mobile-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="header-title">订单详情</div>
      <div class="header-right">
        <el-button text @click="handleShare">
          <el-icon><Share /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 订单状态 -->
    <div class="status-section" :class="{ 'mobile-status': isMobileDevice }">
      <div class="status-content">
        <el-icon class="status-icon" :class="order.status">
          <component :is="getStatusIcon(order.status)" />
        </el-icon>
        <div class="status-info">
          <h2>{{ getStatusText(order.status) }}</h2>
          <p>{{ getStatusDescription(order.status) }}</p>
        </div>
      </div>
    </div>

    <!-- 收货信息 -->
    <el-card class="info-card" :class="{ 'mobile-card': isMobileDevice }">
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

    <!-- 商品信息 -->
    <el-card class="info-card" :class="{ 'mobile-card': isMobileDevice }">
      <template #header>
        <div class="card-header">
          <el-icon><Goods /></el-icon>
          <span>商品信息</span>
        </div>
      </template>
      <div class="order-items">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="order-item"
          @click="router.push(`/product/${item.product_id}`)"
        >
          <el-image
            :src="item.image"
            fit="cover"
            class="item-image"
          />
          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-specs">{{ item.specs }}</p>
            <div class="item-price-qty">
              <span class="item-price">¥{{ item.price }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 订单信息 -->
    <el-card class="info-card" :class="{ 'mobile-card': isMobileDevice }">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>订单信息</span>
        </div>
      </template>
      <div class="order-info">
        <div class="info-item">
          <span class="label">订单编号</span>
          <span class="value">{{ order.order_no }}</span>
        </div>
        <div class="info-item">
          <span class="label">创建时间</span>
          <span class="value">{{ formatDate(order.created_at) }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付方式</span>
          <span class="value">{{ order.payment_method || '未支付' }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付时间</span>
          <span class="value">{{ order.paid_at ? formatDate(order.paid_at) : '未支付' }}</span>
        </div>
        <div class="info-item">
          <span class="label">发货时间</span>
          <span class="value">{{ order.shipped_at ? formatDate(order.shipped_at) : '未发货' }}</span>
        </div>
        <div class="info-item">
          <span class="label">完成时间</span>
          <span class="value">{{ order.completed_at ? formatDate(order.completed_at) : '未完成' }}</span>
        </div>
      </div>
    </el-card>

    <!-- 金额信息 -->
    <el-card class="info-card" :class="{ 'mobile-card': isMobileDevice }">
      <template #header>
        <div class="card-header">
          <el-icon><Money /></el-icon>
          <span>金额信息</span>
        </div>
      </template>
      <div class="amount-info">
        <div class="amount-item">
          <span class="label">商品总额</span>
          <span class="value">¥{{ order.total_amount }}</span>
        </div>
        <div class="amount-item">
          <span class="label">运费</span>
          <span class="value">¥{{ order.shipping_fee }}</span>
        </div>
        <div class="amount-item total">
          <span class="label">实付款</span>
          <span class="value">¥{{ order.total_amount + order.shipping_fee }}</span>
        </div>
      </div>
    </el-card>

    <!-- 底部操作栏 -->
    <div class="bottom-bar" :class="{ 'mobile-bottom-bar': isMobileDevice }">
      <template v-if="order.status === 'pending'">
        <el-button @click="handleCancelOrder">取消订单</el-button>
        <el-button type="primary" @click="handlePayOrder">立即付款</el-button>
      </template>
      <template v-else-if="order.status === 'shipped'">
        <el-button @click="handleViewLogistics">查看物流</el-button>
        <el-button type="primary" @click="handleConfirmReceive">确认收货</el-button>
      </template>
      <template v-else-if="order.status === 'completed'">
        <el-button @click="handleDeleteOrder">删除订单</el-button>
        <el-button type="primary" @click="handleBuyAgain">再次购买</el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Share,
  Location,
  Goods,
  Document,
  Money,
  Timer,
  CircleCheck,
  Van,
  Box
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
  created_at: '',
  updated_at: '',
  address: {
    name: '',
    phone: '',
    full_address: ''
  }
})

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = isMobile()
}

// 获取状态图标
const getStatusIcon = (status: string) => {
  const icons = {
    pending: Timer,
    paid: CircleCheck,
    shipped: Van,
    completed: Box,
    cancelled: CircleCheck
  }
  return icons[status as keyof typeof icons] || Timer
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status as keyof typeof texts] || status
}

// 获取状态描述
const getStatusDescription = (status: string) => {
  const descriptions = {
    pending: '请尽快完成支付',
    paid: '商家正在处理您的订单',
    shipped: '商品正在配送中',
    completed: '交易已完成',
    cancelled: '订单已取消'
  }
  return descriptions[status as keyof typeof descriptions] || ''
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 处理分享
const handleShare = () => {
  // TODO: 实现分享功能
  ElMessage.success('分享功能开发中')
}

// 处理订单操作
const handleCancelOrder = () => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 实现取消订单逻辑
    ElMessage.success('订单已取消')
  })
}

const handlePayOrder = () => {
  router.push(`/payment/${order.value.id}`)
}

const handleViewLogistics = () => {
  router.push(`/logistics/${order.value.id}`)
}

const handleConfirmReceive = () => {
  ElMessageBox.confirm('确认已收到商品？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 实现确认收货逻辑
    ElMessage.success('确认收货成功')
  })
}

const handleDeleteOrder = () => {
  ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 实现删除订单逻辑
    ElMessage.success('订单已删除')
  })
}

const handleBuyAgain = () => {
  // TODO: 实现再次购买逻辑
  router.push('/cart')
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

onMounted(() => {
  fetchOrderDetail()
  onResize(handleResize)
})

onUnmounted(() => {
  offResize(handleResize)
})
</script>

<style scoped>
.order-detail-container {
  padding: 20px;
  padding-bottom: 80px;
}

.status-section {
  background: linear-gradient(135deg, #409eff 0%, #2e7d32 100%);
  color: #fff;
  padding: 30px 20px;
  margin: -20px -20px 20px;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-icon {
  font-size: 48px;
}

.status-info h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.status-info p {
  margin: 0;
  opacity: 0.8;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
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

.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0 0 8px;
  font-size: 14px;
  color: #303133;
}

.item-specs {
  margin: 0 0 8px;
  font-size: 12px;
  color: #909399;
}

.item-price-qty {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  color: #f56c6c;
  font-weight: 500;
}

.item-quantity {
  color: #909399;
}

.order-info,
.amount-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item,
.amount-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #606266;
}

.value {
  color: #303133;
}

.amount-item.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.amount-item.total .value {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 500;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

/* 移动端样式 */
.is-mobile {
  padding: 0;
  padding-bottom: 60px;
}

.mobile-status {
  padding: 20px 16px;
  margin: 0 0 12px;
}

.mobile-status .status-icon {
  font-size: 36px;
}

.mobile-status .status-info h2 {
  font-size: 20px;
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

.mobile-card .order-item {
  gap: 8px;
}

.mobile-card .item-image {
  width: 60px;
  height: 60px;
}

.mobile-card .item-name {
  font-size: 13px;
  margin-bottom: 6px;
}

.mobile-card .item-specs {
  font-size: 11px;
  margin-bottom: 6px;
}

.mobile-card .info-item,
.mobile-card .amount-item {
  font-size: 13px;
}

.mobile-card .amount-item.total .value {
  font-size: 16px;
}

.mobile-bottom-bar {
  padding: 8px 16px;
}

.mobile-bottom-bar .el-button {
  padding: 8px 16px;
  font-size: 14px;
}
</style> 