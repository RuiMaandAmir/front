<template>
  <div class="payment-container" :class="{ 'is-mobile': isMobileDevice }">
    <!-- 移动端头部 -->
    <div v-if="isMobileDevice" class="mobile-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="header-title">订单支付</div>
    </div>

    <!-- 支付金额 -->
    <div class="amount-section" :class="{ 'mobile-amount': isMobileDevice }">
      <div class="amount-content">
        <span class="label">支付金额</span>
        <span class="amount">¥{{ order.total_amount + order.shipping_fee }}</span>
      </div>
    </div>

    <!-- 支付方式 -->
    <el-card class="payment-card" :class="{ 'mobile-card': isMobileDevice }">
      <template #header>
        <div class="card-header">
          <el-icon><Money /></el-icon>
          <span>选择支付方式</span>
        </div>
      </template>
      <div class="payment-methods">
        <div
          v-for="method in paymentMethods"
          :key="method.value"
          class="payment-method"
          :class="{ active: selectedMethod === method.value }"
          @click="selectedMethod = method.value"
        >
          <el-image
            :src="method.icon"
            class="method-icon"
          />
          <span class="method-name">{{ method.label }}</span>
          <el-icon v-if="selectedMethod === method.value" class="check-icon">
            <Check />
          </el-icon>
        </div>
      </div>
    </el-card>

    <!-- 订单信息 -->
    <el-card class="order-card" :class="{ 'mobile-card': isMobileDevice }">
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
          <span class="label">商品总额</span>
          <span class="value">¥{{ order.total_amount }}</span>
        </div>
        <div class="info-item">
          <span class="label">运费</span>
          <span class="value">¥{{ order.shipping_fee }}</span>
        </div>
        <div class="info-item total">
          <span class="label">实付款</span>
          <span class="value">¥{{ order.total_amount + order.shipping_fee }}</span>
        </div>
      </div>
    </el-card>

    <!-- 底部操作栏 -->
    <div class="bottom-bar" :class="{ 'mobile-bottom-bar': isMobileDevice }">
      <div class="payment-info">
        <span class="label">实付款：</span>
        <span class="amount">¥{{ order.total_amount + order.shipping_fee }}</span>
      </div>
      <el-button
        type="primary"
        class="pay-button"
        :loading="paying"
        @click="handlePay"
      >
        立即支付
      </el-button>
    </div>

    <!-- 支付二维码弹窗 -->
    <el-dialog
      v-model="showQRCode"
      title="扫码支付"
      width="300px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :class="{ 'mobile-dialog': isMobileDevice }"
    >
      <div class="qrcode-content">
        <el-image
          :src="qrCodeUrl"
          class="qrcode-image"
        />
        <p class="qrcode-tip">请使用{{ getPaymentMethodName(selectedMethod) }}扫码支付</p>
        <p class="qrcode-amount">¥{{ order.total_amount + order.shipping_fee }}</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelPay">取消支付</el-button>
          <el-button type="primary" @click="handlePaySuccess">支付完成</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Money, Document, Check } from '@element-plus/icons-vue'
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
const selectedMethod = ref('alipay')
const paying = ref(false)
const showQRCode = ref(false)
const qrCodeUrl = ref('')

// 支付方式列表
const paymentMethods = [
  {
    label: '支付宝',
    value: 'alipay',
    icon: '/images/payment/alipay.png'
  },
  {
    label: '微信支付',
    value: 'wechat',
    icon: '/images/payment/wechat.png'
  },
  {
    label: '银联支付',
    value: 'unionpay',
    icon: '/images/payment/unionpay.png'
  }
]

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = isMobile()
}

// 获取支付方式名称
const getPaymentMethodName = (value: string) => {
  const method = paymentMethods.find(m => m.value === value)
  return method ? method.label : value
}

// 处理支付
const handlePay = async () => {
  if (!selectedMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }

  paying.value = true
  try {
    // TODO: 调用支付接口获取二维码
    // const response = await api.getPaymentQRCode({
    //   orderId: order.value.id,
    //   method: selectedMethod.value
    // })
    // qrCodeUrl.value = response.data.qrcode
    qrCodeUrl.value = '/images/payment/qrcode.png' // 临时使用静态图片
    showQRCode.value = true
  } catch (error) {
    console.error('获取支付二维码失败:', error)
    ElMessage.error('获取支付二维码失败')
  } finally {
    paying.value = false
  }
}

// 处理取消支付
const handleCancelPay = () => {
  ElMessageBox.confirm('确定要取消支付吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    showQRCode.value = false
    router.back()
  })
}

// 处理支付完成
const handlePaySuccess = async () => {
  try {
    // TODO: 调用支付完成接口
    // await api.confirmPayment(order.value.id)
    ElMessage.success('支付成功')
    showQRCode.value = false
    router.push(`/order/${order.value.id}`)
  } catch (error) {
    console.error('确认支付失败:', error)
    ElMessage.error('确认支付失败')
  }
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
.payment-container {
  padding: 20px;
  padding-bottom: 80px;
}

.amount-section {
  background: linear-gradient(135deg, #409eff 0%, #2e7d32 100%);
  color: #fff;
  padding: 30px 20px;
  margin: -20px -20px 20px;
}

.amount-content {
  text-align: center;
}

.amount-content .label {
  display: block;
  font-size: 16px;
  margin-bottom: 8px;
}

.amount-content .amount {
  font-size: 36px;
  font-weight: 500;
}

.payment-card,
.order-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-method:hover {
  border-color: #409eff;
}

.payment-method.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.method-icon {
  width: 24px;
  height: 24px;
}

.method-name {
  flex: 1;
  font-size: 14px;
}

.check-icon {
  color: #409eff;
  font-size: 20px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
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

.info-item.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.info-item.total .value {
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
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.payment-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.payment-info .label {
  font-size: 14px;
}

.payment-info .amount {
  color: #f56c6c;
  font-size: 24px;
  font-weight: 500;
}

.pay-button {
  padding: 12px 32px;
  font-size: 16px;
}

.qrcode-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}

.qrcode-image {
  width: 200px;
  height: 200px;
}

.qrcode-tip {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.qrcode-amount {
  margin: 0;
  color: #f56c6c;
  font-size: 24px;
  font-weight: 500;
}

/* 移动端样式 */
.is-mobile {
  padding: 0;
  padding-bottom: 60px;
}

.mobile-amount {
  padding: 20px 16px;
  margin: 0 0 12px;
}

.mobile-amount .amount-content .amount {
  font-size: 32px;
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

.mobile-card .payment-method {
  padding: 10px;
}

.mobile-card .method-icon {
  width: 20px;
  height: 20px;
}

.mobile-card .method-name {
  font-size: 13px;
}

.mobile-card .info-item {
  font-size: 13px;
}

.mobile-card .info-item.total .value {
  font-size: 16px;
}

.mobile-bottom-bar {
  padding: 8px 16px;
}

.mobile-bottom-bar .payment-info .amount {
  font-size: 20px;
}

.mobile-bottom-bar .pay-button {
  padding: 8px 24px;
  font-size: 14px;
}

.mobile-dialog :deep(.el-dialog__body) {
  padding: 16px;
}

.mobile-dialog .qrcode-image {
  width: 160px;
  height: 160px;
}

.mobile-dialog .qrcode-tip {
  font-size: 13px;
}

.mobile-dialog .qrcode-amount {
  font-size: 20px;
}
</style> 