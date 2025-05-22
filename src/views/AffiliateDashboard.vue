<template>
  <div class="affiliate-dashboard">
    <el-card class="stats-card">
      <template #header>
        <div class="card-header">
          <h2>分销统计</h2>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-title">总佣金</div>
            <div class="stat-value">¥{{ stats.total_commission }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-title">待结算佣金</div>
            <div class="stat-value">¥{{ stats.pending_commission }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-title">总点击量</div>
            <div class="stat-value">{{ stats.total_clicks }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-title">总转化量</div>
            <div class="stat-value">{{ stats.total_conversions }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="links-card">
      <template #header>
        <div class="card-header">
          <h2>我的分销链接</h2>
        </div>
      </template>

      <el-table :data="affiliateLinks" v-loading="loading">
        <el-table-column prop="product.name" label="商品名称" />
        <el-table-column prop="commission_rate" label="佣金比例">
          <template #default="{ row }">
            {{ row.commission_rate }}%
          </template>
        </el-table-column>
        <el-table-column prop="clicks" label="点击量" />
        <el-table-column prop="conversions" label="转化量" />
        <el-table-column prop="total_commission" label="总佣金">
          <template #default="{ row }">
            ¥{{ row.total_commission }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button @click="copyLink(row.code)" type="primary" size="small">
              复制链接
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-card class="commissions-card">
      <template #header>
        <div class="card-header">
          <h2>佣金记录</h2>
        </div>
      </template>

      <el-table :data="commissions" v-loading="loading">
        <el-table-column prop="order.id" label="订单号" />
        <el-table-column prop="amount" label="佣金金额">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" />
        <el-table-column prop="paid_at" label="结算时间" />
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="commissionPage"
          v-model:page-size="commissionPageSize"
          :total="commissionTotal"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleCommissionSizeChange"
          @current-change="handleCommissionPageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useAffiliateStore } from '../stores/affiliate';
import type { CommissionStatus } from '../types';

const affiliateStore = useAffiliateStore();
const loading = ref(false);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const commissionPage = ref(1);
const commissionPageSize = ref(10);
const commissionTotal = ref(0);

// 统计数据
const stats = ref({
  total_commission: 0,
  pending_commission: 0,
  total_clicks: 0,
  total_conversions: 0,
});

// 分销链接和佣金数据
const affiliateLinks = ref([]);
const commissions = ref([]);

// 获取状态显示文本
const getStatusText = (status: CommissionStatus) => {
  const statusMap = {
    [CommissionStatus.PENDING]: '待结算',
    [CommissionStatus.APPROVED]: '已确认',
    [CommissionStatus.PAID]: '已结算',
    [CommissionStatus.CANCELLED]: '已取消',
  };
  return statusMap[status] || status;
};

// 获取状态标签类型
const getStatusType = (status: CommissionStatus) => {
  const typeMap = {
    [CommissionStatus.PENDING]: 'warning',
    [CommissionStatus.APPROVED]: 'success',
    [CommissionStatus.PAID]: 'success',
    [CommissionStatus.CANCELLED]: 'danger',
  };
  return typeMap[status] || 'info';
};

// 复制链接
const copyLink = (code: string) => {
  const link = affiliateStore.copyAffiliateLink(code);
  navigator.clipboard.writeText(link).then(() => {
    ElMessage.success('链接已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制');
  });
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    await Promise.all([
      affiliateStore.getAffiliateStats().then(res => {
        stats.value = res.data;
      }),
      affiliateStore.getAffiliateLinks({
        page: currentPage.value,
        page_size: pageSize.value,
      }).then(res => {
        affiliateLinks.value = res.data.results;
        total.value = res.data.count;
      }),
      affiliateStore.getCommissions({
        page: commissionPage.value,
        page_size: commissionPageSize.value,
      }).then(res => {
        commissions.value = res.data.results;
        commissionTotal.value = res.data.count;
      }),
    ]);
  } catch (error) {
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  loadData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loadData();
};

const handleCommissionSizeChange = (val: number) => {
  commissionPageSize.value = val;
  loadData();
};

const handleCommissionPageChange = (val: number) => {
  commissionPage.value = val;
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.affiliate-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.stats-card,
.links-card,
.commissions-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 