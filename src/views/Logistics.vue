<template>
  <div class="logistics-page">
    <div class="page-header">
      <h2>物流信息</h2>
    </div>

    <div class="logistics-content">
      <el-card class="order-info">
        <template #header>
          <div class="card-header">
            <span>订单信息</span>
            <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
          </div>
        </template>
        <div class="order-detail">
          <p><strong>订单编号：</strong>{{ order.order_no }}</p>
          <p><strong>下单时间：</strong>{{ formatDate(order.created_at) }}</p>
          <p><strong>收货地址：</strong>{{ formatAddress(order.address) }}</p>
        </div>
      </el-card>

      <el-card class="logistics-info">
        <template #header>
          <div class="card-header">
            <span>物流信息</span>
            <el-button type="text" @click="refreshLogistics">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        
        <div v-if="logistics.loading" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>
        
        <div v-else-if="logistics.error" class="error-state">
          <el-empty description="获取物流信息失败">
            <el-button type="primary" @click="refreshLogistics">重试</el-button>
          </el-empty>
        </div>
        
        <div v-else-if="!logistics.traces?.length" class="empty-state">
          <el-empty description="暂无物流信息" />
        </div>
        
        <div v-else class="logistics-timeline">
          <el-timeline>
            <el-timeline-item
              v-for="(trace, index) in logistics.traces"
              :key="index"
              :type="index === 0 ? 'primary' : ''"
              :timestamp="formatDate(trace.time)"
            >
              {{ trace.content }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>

      <el-card class="delivery-info">
        <template #header>
          <div class="card-header">
            <span>配送信息</span>
          </div>
        </template>
        <div class="delivery-detail">
          <p><strong>物流公司：</strong>{{ logistics.company }}</p>
          <p><strong>物流单号：</strong>{{ logistics.tracking_no }}</p>
          <p><strong>预计送达：</strong>{{ logistics.estimated_delivery }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { useOrderStore } from '../stores/order';
import { formatDate } from '../utils/date';

const route = useRoute();
const orderStore = useOrderStore();

const order = ref({
  order_no: '',
  status: '',
  created_at: '',
  address: {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
  },
});

const logistics = ref({
  loading: false,
  error: null,
  company: '',
  tracking_no: '',
  estimated_delivery: '',
  traces: [],
});

// 获取订单状态类型
const getStatusType = (status: string) => {
  const statusMap = {
    pending: 'info',
    paid: 'success',
    shipping: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };
  return statusMap[status] || 'info';
};

// 获取订单状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    pending: '待付款',
    paid: '已付款',
    shipping: '配送中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
};

// 格式化地址
const formatAddress = (address: any) => {
  if (!address) return '';
  return `${address.province} ${address.city} ${address.district} ${address.detail} (${address.name} ${address.phone})`;
};

// 加载订单信息
const loadOrderInfo = async () => {
  try {
    const orderId = route.params.id;
    const response = await orderStore.getOrder(orderId);
    order.value = response.data;
  } catch (error) {
    ElMessage.error('加载订单信息失败');
  }
};

// 加载物流信息
const loadLogistics = async () => {
  logistics.value.loading = true;
  logistics.value.error = null;
  
  try {
    const orderId = route.params.id;
    const response = await orderStore.getLogistics(orderId);
    logistics.value = {
      ...logistics.value,
      ...response.data,
    };
  } catch (error) {
    logistics.value.error = error;
    ElMessage.error('加载物流信息失败');
  } finally {
    logistics.value.loading = false;
  }
};

// 刷新物流信息
const refreshLogistics = () => {
  loadLogistics();
};

onMounted(() => {
  loadOrderInfo();
  loadLogistics();
});
</script>

<style scoped>
.logistics-page {
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

.logistics-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-detail,
.delivery-detail {
  line-height: 1.8;
}

.order-detail p,
.delivery-detail p {
  margin: 5px 0;
}

.logistics-timeline {
  padding: 10px 0;
}

.loading-state,
.error-state,
.empty-state {
  padding: 20px 0;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .logistics-page {
    padding: 10px;
  }

  .order-detail p,
  .delivery-detail p {
    font-size: 14px;
  }
}
</style> 