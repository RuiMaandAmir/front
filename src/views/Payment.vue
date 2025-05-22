<template>
  <div class="payment-page">
    <div class="page-header">
      <h2>订单支付</h2>
    </div>

    <div class="payment-content">
      <el-card class="order-info">
        <template #header>
          <div class="card-header">
            <span>订单信息</span>
            <el-tag type="warning">待支付</el-tag>
          </div>
        </template>
        <div class="order-detail">
          <p><strong>订单编号：</strong>{{ order.order_no }}</p>
          <p><strong>下单时间：</strong>{{ formatDate(order.created_at) }}</p>
          <p><strong>支付金额：</strong><span class="price">¥{{ order.total_amount }}</span></p>
        </div>
      </el-card>

      <el-card class="payment-methods">
        <template #header>
          <div class="card-header">
            <span>选择支付方式</span>
          </div>
        </template>
        <div class="method-list">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            class="method-item"
            :class="{ active: selectedMethod === method.id }"
            @click="selectMethod(method.id)"
          >
            <img :src="method.icon" :alt="method.name" class="method-icon" />
            <span class="method-name">{{ method.name }}</span>
            <el-icon v-if="selectedMethod === method.id" class="check-icon">
              <Check />
            </el-icon>
          </div>
        </div>
      </el-card>

      <div class="payment-actions">
        <el-button @click="cancelPayment">取消支付</el-button>
        <el-button type="primary" :loading="paying" @click="handlePayment">
          立即支付
        </el-button>
      </div>
    </div>

    <!-- 支付二维码弹窗 -->
    <el-dialog
      v-model="qrCodeVisible"
      title="扫码支付"
      width="300px"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="qrcode-content">
        <div class="qrcode-wrapper">
          <img :src="qrCodeUrl" alt="支付二维码" class="qrcode" />
        </div>
        <p class="qrcode-tip">请使用{{ selectedMethodName }}扫码支付</p>
        <p class="qrcode-amount">¥{{ order.total_amount }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelQrCode">取消支付</el-button>
          <el-button type="primary" @click="checkPaymentStatus">
            支付完成
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Check } from '@element-plus/icons-vue';
import { useOrderStore } from '../stores/order';
import { formatDate } from '../utils/date';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();

const order = ref({
  order_no: '',
  total_amount: 0,
  created_at: '',
});

const paying = ref(false);
const qrCodeVisible = ref(false);
const qrCodeUrl = ref('');
const paymentCheckTimer = ref(null);

// 支付方式
const paymentMethods = [
  {
    id: 'alipay',
    name: '支付宝支付',
    icon: '/icons/alipay.png',
  },
  {
    id: 'wechat',
    name: '微信支付',
    icon: '/icons/wechat.png',
  },
];

const selectedMethod = ref('alipay');
const selectedMethodName = computed(() => {
  const method = paymentMethods.find(m => m.id === selectedMethod.value);
  return method ? method.name : '';
});

// 选择支付方式
const selectMethod = (methodId: string) => {
  selectedMethod.value = methodId;
};

// 加载订单信息
const loadOrderInfo = async () => {
  try {
    const orderId = route.params.id;
    const response = await orderStore.getOrder(orderId);
    order.value = response.data;
  } catch (error) {
    ElMessage.error('加载订单信息失败');
    router.push('/orders');
  }
};

// 处理支付
const handlePayment = async () => {
  if (!selectedMethod.value) {
    ElMessage.warning('请选择支付方式');
    return;
  }

  paying.value = true;
  try {
    const response = await orderStore.payOrder(route.params.id, {
      payment_method: selectedMethod.value,
    });
    
    // 显示支付二维码
    qrCodeUrl.value = response.data.qr_code;
    qrCodeVisible.value = true;
    
    // 开始轮询支付状态
    startPaymentCheck();
  } catch (error) {
    ElMessage.error('创建支付订单失败');
  } finally {
    paying.value = false;
  }
};

// 取消支付
const cancelPayment = async () => {
  try {
    await ElMessageBox.confirm('确定要取消支付吗？', '提示', {
      type: 'warning',
    });
    
    await orderStore.cancelOrder(route.params.id);
    ElMessage.success('订单已取消');
    router.push('/orders');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消订单失败');
    }
  }
};

// 取消二维码支付
const cancelQrCode = () => {
  qrCodeVisible.value = false;
  stopPaymentCheck();
};

// 开始检查支付状态
const startPaymentCheck = () => {
  paymentCheckTimer.value = setInterval(async () => {
    try {
      const response = await orderStore.getOrder(route.params.id);
      if (response.data.status === 'paid') {
        ElMessage.success('支付成功');
        qrCodeVisible.value = false;
        stopPaymentCheck();
        router.push('/orders');
      }
    } catch (error) {
      console.error('检查支付状态失败:', error);
    }
  }, 3000);
};

// 停止检查支付状态
const stopPaymentCheck = () => {
  if (paymentCheckTimer.value) {
    clearInterval(paymentCheckTimer.value);
    paymentCheckTimer.value = null;
  }
};

// 手动检查支付状态
const checkPaymentStatus = async () => {
  try {
    const response = await orderStore.getOrder(route.params.id);
    if (response.data.status === 'paid') {
      ElMessage.success('支付成功');
      qrCodeVisible.value = false;
      stopPaymentCheck();
      router.push('/orders');
    } else {
      ElMessage.warning('支付未完成，请完成支付后点击');
    }
  } catch (error) {
    ElMessage.error('检查支付状态失败');
  }
};

onMounted(() => {
  loadOrderInfo();
});

onUnmounted(() => {
  stopPaymentCheck();
});
</script>

<style scoped>
.payment-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #2e7d32;
}

.payment-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-detail {
  line-height: 1.8;
}

.order-detail p {
  margin: 5px 0;
}

.price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item:hover {
  border-color: #2e7d32;
}

.method-item.active {
  border-color: #2e7d32;
  background-color: #f0f9eb;
}

.method-icon {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.method-name {
  flex: 1;
  font-size: 16px;
}

.check-icon {
  color: #2e7d32;
  font-size: 20px;
}

.payment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.qrcode-content {
  text-align: center;
}

.qrcode-wrapper {
  margin: 20px 0;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.qrcode {
  width: 200px;
  height: 200px;
}

.qrcode-tip {
  margin: 10px 0;
  color: #666;
}

.qrcode-amount {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .payment-page {
    padding: 10px;
  }

  .method-item {
    padding: 10px;
  }

  .method-icon {
    width: 24px;
    height: 24px;
  }

  .method-name {
    font-size: 14px;
  }
}
</style> 