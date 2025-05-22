<template>
  <div class="mobile-container">
    <!-- 订单状态 -->
    <div class="order-status">
      <el-card>
        <div class="status-header">
          <el-icon><CircleCheck v-if="order.status === 'completed'" /><Clock v-else /></el-icon>
          <span class="status-text">{{ getStatusText(order.status) }}</span>
        </div>
        <div class="status-desc">{{ getStatusDesc(order.status) }}</div>
      </el-card>
    </div>

    <!-- 收货信息 -->
    <div class="delivery-info">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>收货信息</span>
          </div>
        </template>
        <div class="info-item">
          <span class="label">收货人：</span>
          <span class="value">{{ order.receiverName }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系电话：</span>
          <span class="value">{{ order.receiverPhone }}</span>
        </div>
        <div class="info-item">
          <span class="label">收货地址：</span>
          <span class="value">{{ order.receiverAddress }}</span>
        </div>
      </el-card>
    </div>

    <!-- 商品列表 -->
    <div class="order-items">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>商品信息</span>
          </div>
        </template>
        <div class="item-list">
          <div v-for="item in order.items" :key="item.id" class="item">
            <el-image :src="item.image" class="item-image" />
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-spec">{{ item.spec }}</div>
              <div class="item-price">
                <span class="price">¥{{ item.price }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 订单信息 -->
    <div class="order-info">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>订单信息</span>
          </div>
        </template>
        <div class="info-item">
          <span class="label">订单编号：</span>
          <span class="value">{{ order.orderNo }}</span>
        </div>
        <div class="info-item">
          <span class="label">创建时间：</span>
          <span class="value">{{ formatDate(order.createTime) }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付方式：</span>
          <span class="value">{{ order.paymentMethod }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付时间：</span>
          <span class="value">{{ formatDate(order.payTime) }}</span>
        </div>
      </el-card>
    </div>

    <!-- 订单金额 -->
    <div class="order-amount">
      <el-card>
        <div class="amount-item">
          <span class="label">商品总额</span>
          <span class="value">¥{{ order.totalAmount }}</span>
        </div>
        <div class="amount-item">
          <span class="label">运费</span>
          <span class="value">¥{{ order.freight }}</span>
        </div>
        <div class="amount-item total">
          <span class="label">实付金额</span>
          <span class="value">¥{{ order.payAmount }}</span>
        </div>
      </el-card>
    </div>

    <!-- 底部操作栏 -->
    <div class="order-actions" v-if="order.status !== 'completed'">
      <el-button type="danger" @click="handleCancel">取消订单</el-button>
      <el-button type="primary" @click="handlePay" v-if="order.status === 'pending'">立即支付</el-button>
      <el-button type="success" @click="handleConfirm" v-if="order.status === 'shipped'">确认收货</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheck, Clock } from '@element-plus/icons-vue'
import { request } from '@/utils/request'

// 订单项类型定义
interface OrderItem {
  id: string
  image: string
  name: string
  spec: string
  price: number
  quantity: number
}

// 订单类型定义
interface Order {
  id: string
  orderNo: string
  status: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  items: OrderItem[]
  totalAmount: number
  freight: number
  payAmount: number
  paymentMethod: string
  createTime: string
  payTime: string
}

const route = useRoute()
const router = useRouter()

// 订单数据
const order = ref<Order>({
  id: '',
  orderNo: '',
  status: '',
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  items: [],
  totalAmount: 0,
  freight: 0,
  payAmount: 0,
  paymentMethod: '',
  createTime: '',
  payTime: '',
})

// 获取订单状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取订单状态描述
const getStatusDesc = (status: string) => {
  const descMap: Record<string, string> = {
    pending: '请尽快完成支付',
    paid: '商家正在处理您的订单',
    shipped: '商品正在配送中',
    completed: '交易已完成',
    cancelled: '订单已取消'
  }
  return descMap[status] || ''
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 获取订单详情
const getOrderDetail = async () => {
  try {
    const { data } = await request.get(`/api/orders/${route.params.id}`)
    order.value = data
  } catch (error) {
    ElMessage.error('获取订单详情失败')
  }
}

// 取消订单
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      type: 'warning'
    })
    await request.post(`/api/orders/${order.value.id}/cancel`)
    ElMessage.success('订单已取消')
    getOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消订单失败')
    }
  }
}

// 支付订单
const handlePay = () => {
  router.push(`/payment/${order.value.id}`)
}

// 确认收货
const handleConfirm = async () => {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '提示', {
      type: 'warning'
    })
    await request.post(`/api/orders/${order.value.id}/confirm`)
    ElMessage.success('确认收货成功')
    getOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('确认收货失败')
    }
  }
}

onMounted(() => {
  getOrderDetail()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile.scss';

.order-status {
  margin-bottom: $spacing-base;

  .status-header {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-small;

    .el-icon {
      font-size: 24px;
      margin-right: $spacing-small;
      color: $primary-color;
    }

    .status-text {
      font-size: $font-size-large;
      font-weight: $font-weight-medium;
      color: $text-primary;
    }
  }

  .status-desc {
    color: $text-secondary;
    font-size: $font-size-small;
  }
}

.delivery-info,
.order-items,
.order-info,
.order-amount {
  margin-bottom: $spacing-base;
}

.card-header {
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.info-item {
  display: flex;
  margin-bottom: $spacing-small;
  font-size: $font-size-base;
  line-height: $line-height-base;

  .label {
    color: $text-secondary;
    width: 80px;
    flex-shrink: 0;
  }

  .value {
    color: $text-primary;
    flex: 1;
  }
}

.item-list {
  .item {
    display: flex;
    padding: $spacing-base 0;
    border-bottom: 1px solid $border-color-lighter;

    &:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 80px;
      height: 80px;
      border-radius: $border-radius-base;
      margin-right: $spacing-base;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .item-name {
        font-size: $font-size-base;
        color: $text-primary;
        margin-bottom: $spacing-mini;
      }

      .item-spec {
        font-size: $font-size-small;
        color: $text-secondary;
        margin-bottom: $spacing-mini;
      }

      .item-price {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .price {
          color: $danger-color;
          font-size: $font-size-medium;
          font-weight: $font-weight-medium;
        }

        .quantity {
          color: $text-secondary;
          font-size: $font-size-small;
        }
      }
    }
  }
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: $spacing-small;
  font-size: $font-size-base;
  line-height: $line-height-base;

  &.total {
    margin-top: $spacing-base;
    padding-top: $spacing-base;
    border-top: 1px solid $border-color-lighter;
    font-size: $font-size-medium;
    font-weight: $font-weight-medium;
    color: $danger-color;
  }
}

.order-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-base;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end;
  gap: $spacing-base;
  z-index: 100;
}
</style> 