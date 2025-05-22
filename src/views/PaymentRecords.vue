<template>
  <div class="payment-records-page">
    <div class="page-header">
      <h2>支付记录</h2>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索订单号/支付单号"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="支付状态" @change="handleSearch">
          <el-option label="全部" value="" />
          <el-option label="支付成功" value="success" />
          <el-option label="支付失败" value="failed" />
          <el-option label="待支付" value="pending" />
        </el-select>
      </div>
    </div>

    <el-card class="records-card">
      <el-table
        v-loading="loading"
        :data="records"
        style="width: 100%"
      >
        <el-table-column prop="order_no" label="订单号" min-width="180" />
        <el-table-column prop="payment_no" label="支付单号" min-width="180" />
        <el-table-column prop="amount" label="支付金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payment_method" label="支付方式" width="120">
          <template #default="{ row }">
            <el-tag :type="row.payment_method === 'alipay' ? 'primary' : 'success'">
              {{ row.payment_method === 'alipay' ? '支付宝' : '微信支付' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="支付时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="primary"
              link
              @click="handleRepay(row)"
            >
              重新支付
            </el-button>
            <el-button
              v-if="row.status === 'success'"
              type="primary"
              link
              @click="viewOrderDetail(row)"
            >
              查看订单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { useOrderStore } from '../stores/order';
import { formatDate } from '../utils/date';

const router = useRouter();
const orderStore = useOrderStore();

const loading = ref(false);
const records = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const statusFilter = ref('');

// 获取支付状态类型
const getStatusType = (status: string) => {
  const statusMap = {
    success: 'success',
    failed: 'danger',
    pending: 'warning',
  };
  return statusMap[status] || 'info';
};

// 获取支付状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    success: '支付成功',
    failed: '支付失败',
    pending: '待支付',
  };
  return statusMap[status] || status;
};

// 加载支付记录
const loadRecords = async () => {
  loading.value = true;
  try {
    const response = await orderStore.getPaymentRecords({
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value,
      status: statusFilter.value,
    });
    records.value = response.data.results;
    total.value = response.data.count;
  } catch (error) {
    ElMessage.error('加载支付记录失败');
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  loadRecords();
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  loadRecords();
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadRecords();
};

// 重新支付
const handleRepay = (record: any) => {
  router.push(`/payment/${record.order_id}`);
};

// 查看订单详情
const viewOrderDetail = (record: any) => {
  router.push(`/orders/${record.order_id}`);
};

onMounted(() => {
  loadRecords();
});
</script>

<style scoped>
.payment-records-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #2e7d32;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.header-actions .el-input {
  width: 300px;
}

.records-card {
  margin-bottom: 20px;
}

.amount {
  color: #f56c6c;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .payment-records-page {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    gap: 10px;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .header-actions .el-input {
    width: 100%;
  }
}
</style> 