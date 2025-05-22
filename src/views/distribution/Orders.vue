<template>
  <div class="distribution-orders">
    <!-- 订单统计 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>今日订单</span>
            </div>
          </template>
          <div class="card-value">{{ stats.today_orders || 0 }}</div>
          <div class="card-desc">订单数</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>今日销售额</span>
            </div>
          </template>
          <div class="card-value">¥{{ stats.today_sales || 0 }}</div>
          <div class="card-desc">销售额</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>今日佣金</span>
            </div>
          </template>
          <div class="card-value">¥{{ stats.today_commission || 0 }}</div>
          <div class="card-desc">佣金</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>待结算佣金</span>
            </div>
          </template>
          <div class="card-value">¥{{ stats.pending_commission || 0 }}</div>
          <div class="card-desc">待结算</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单列表 -->
    <div class="order-list">
      <div class="section-header">
        <h3>订单列表</h3>
        <div class="filter-section">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateRangeChange"
          />
          <el-select v-model="statusFilter" placeholder="订单状态" @change="handleStatusChange">
            <el-option label="全部" value="" />
            <el-option label="待结算" value="pending" />
            <el-option label="已结算" value="settled" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
          <el-button type="primary" @click="refreshOrders">
            刷新
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="product_name" label="商品名称" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="price" label="单价" width="120">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="订单金额" width="120">
          <template #default="{ row }">
            ¥{{ row.total_amount }}
          </template>
        </el-table-column>
        <el-table-column prop="commission" label="佣金" width="120">
          <template #default="{ row }">
            ¥{{ row.commission }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="showOrderDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="800px"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.order_no }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ currentOrder.product_name }}</el-descriptions-item>
          <el-descriptions-item label="商品数量">{{ currentOrder.quantity }}</el-descriptions-item>
          <el-descriptions-item label="商品单价">¥{{ currentOrder.price }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ currentOrder.total_amount }}</el-descriptions-item>
          <el-descriptions-item label="佣金比例">{{ currentOrder.commission_rate }}%</el-descriptions-item>
          <el-descriptions-item label="佣金金额">¥{{ currentOrder.commission }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.created_at }}</el-descriptions-item>
          <el-descriptions-item label="结算时间">{{ currentOrder.settled_at || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="commission-detail">
          <h4>佣金计算明细</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="商品金额">
              ¥{{ currentOrder.total_amount }}
            </el-descriptions-item>
            <el-descriptions-item label="佣金比例">
              {{ currentOrder.commission_rate }}%
            </el-descriptions-item>
            <el-descriptions-item label="佣金金额">
              ¥{{ currentOrder.commission }}
            </el-descriptions-item>
            <el-descriptions-item label="结算状态">
              {{ getStatusText(currentOrder.status) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { Refresh } from '@element-plus/icons-vue'

const productStore = useProductStore()

// 统计数据
const stats = ref({
  today_orders: 0,
  today_sales: 0,
  today_commission: 0,
  pending_commission: 0
})

// 订单列表
const orders = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dateRange = ref<[Date, Date] | null>(null)
const statusFilter = ref('')

// 订单详情
const detailDialogVisible = ref(false)
const currentOrder = ref(null)

// 获取统计数据
const getStats = async () => {
  try {
    const response = await productStore.getDistributionStats()
    stats.value = response
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取订单列表
const getOrders = async () => {
  try {
    const params: any = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    if (dateRange.value) {
      params.start_date = dateRange.value[0].toISOString().split('T')[0]
      params.end_date = dateRange.value[1].toISOString().split('T')[0]
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    const response = await productStore.getDistributionOrders(params)
    orders.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('获取订单列表失败:', error)
  }
}

// 刷新订单列表
const refreshOrders = () => {
  getStats()
  getOrders()
}

// 处理日期范围变化
const handleDateRangeChange = () => {
  currentPage.value = 1
  getOrders()
}

// 处理状态筛选变化
const handleStatusChange = () => {
  currentPage.value = 1
  getOrders()
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getOrders()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getOrders()
}

// 显示订单详情
const showOrderDetail = (order: any) => {
  currentOrder.value = order
  detailDialogVisible.value = true
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    settled: 'success',
    cancelled: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待结算',
    settled: '已结算',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

onMounted(() => {
  getStats()
  getOrders()
})
</script>

<style scoped>
.distribution-orders {
  padding: 20px;
}

.stat-card {
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 20px 0;
}

.card-desc {
  font-size: 14px;
  color: #909399;
  margin-top: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.filter-section {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-detail {
  padding: 20px;
}

.commission-detail {
  margin-top: 20px;
}

.commission-detail h4 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #303133;
}

@media (max-width: 768px) {
  .el-col {
    width: 100%;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 