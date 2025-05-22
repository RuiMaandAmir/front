<template>
  <div class="distribution-center">
    <!-- 数据概览 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>今日销售额</span>
              <el-tag size="small" type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-value">¥{{ stats.today_sales || 0 }}</div>
          <div class="card-compare">
            较昨日
            <span :class="stats.sales_trend >= 0 ? 'up' : 'down'">
              {{ Math.abs(stats.sales_trend || 0) }}%
              <el-icon>
                <component :is="stats.sales_trend >= 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>今日佣金</span>
              <el-tag size="small" type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-value">¥{{ stats.today_commission || 0 }}</div>
          <div class="card-compare">
            较昨日
            <span :class="stats.commission_trend >= 0 ? 'up' : 'down'">
              {{ Math.abs(stats.commission_trend || 0) }}%
              <el-icon>
                <component :is="stats.commission_trend >= 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>今日订单</span>
              <el-tag size="small" type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-value">{{ stats.today_orders || 0 }}</div>
          <div class="card-compare">
            较昨日
            <span :class="stats.orders_trend >= 0 ? 'up' : 'down'">
              {{ Math.abs(stats.orders_trend || 0) }}%
              <el-icon>
                <component :is="stats.orders_trend >= 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>团队人数</span>
            </div>
          </template>
          <div class="card-value">{{ stats.team_members || 0 }}</div>
          <div class="card-compare">
            本月新增
            <span class="up">
              +{{ stats.new_members || 0 }}
              <el-icon><ArrowUp /></el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷功能区 -->
    <div class="quick-actions">
      <h3>快捷功能</h3>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="action-card" @click="goToProducts">
            <el-icon><Goods /></el-icon>
            <span>分销商品</span>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="action-card" @click="goToTeam">
            <el-icon><User /></el-icon>
            <span>团队管理</span>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="action-card" @click="goToCommission">
            <el-icon><Money /></el-icon>
            <span>佣金提现</span>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="action-card" @click="goToRules">
            <el-icon><Document /></el-icon>
            <span>分销规则</span>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据趋势图 -->
    <div class="trend-chart">
      <h3>数据趋势</h3>
      <div ref="chartRef" class="chart"></div>
    </div>

    <!-- 最近订单 -->
    <div class="recent-orders">
      <div class="section-header">
        <h3>最近订单</h3>
        <el-button type="primary" link @click="goToOrders">
          查看更多
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-table :data="recentOrders" style="width: 100%">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="customer_name" label="客户" width="120" />
        <el-table-column prop="amount" label="订单金额" width="120">
          <template #default="{ row }">
            ¥{{ row.amount }}
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
        <el-table-column prop="created_at" label="创建时间" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import * as echarts from 'echarts'
import {
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Goods,
  User,
  Money,
  Document
} from '@element-plus/icons-vue'

const router = useRouter()
const productStore = useProductStore()
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 统计数据
const stats = ref({
  today_sales: 0,
  today_commission: 0,
  today_orders: 0,
  team_members: 0,
  new_members: 0,
  sales_trend: 0,
  commission_trend: 0,
  orders_trend: 0
})

// 最近订单
const recentOrders = ref([])

// 获取统计数据
const getStats = async () => {
  try {
    const response = await productStore.getDistributionStats()
    stats.value = response
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取最近订单
const getRecentOrders = async () => {
  try {
    const response = await productStore.getDistributionOrders({
      page: 1,
      page_size: 5
    })
    recentOrders.value = response.items
  } catch (error) {
    console.error('获取最近订单失败:', error)
  }
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['销售额', '佣金', '订单数']
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: [
      {
        type: 'value',
        name: '金额',
        position: 'left',
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      {
        type: 'value',
        name: '订单数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        data: [1200, 1320, 1010, 1340, 900, 1230, 1320]
      },
      {
        name: '佣金',
        type: 'line',
        data: [120, 132, 101, 134, 90, 123, 132]
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: [12, 13, 10, 13, 9, 12, 13]
      }
    ]
  }
  chart.setOption(option)
}

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    paid: 'success',
    completed: 'success',
    cancelled: 'info',
    refunded: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return statusMap[status] || status
}

// 页面跳转
const goToProducts = () => router.push('/distribution/products')
const goToTeam = () => router.push('/distribution/team')
const goToCommission = () => router.push('/distribution/commission')
const goToRules = () => router.push('/distribution/rules')
const goToOrders = () => router.push('/distribution/orders')

onMounted(() => {
  getStats()
  getRecentOrders()
  initChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chart?.resize()
  })
})
</script>

<style scoped>
.distribution-center {
  padding: 20px;
}

.data-card {
  margin-bottom: 20px;
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
  margin: 10px 0;
}

.card-compare {
  font-size: 14px;
  color: #909399;
}

.card-compare .up {
  color: #67c23a;
}

.card-compare .down {
  color: #f56c6c;
}

.quick-actions {
  margin: 30px 0;
}

.quick-actions h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #303133;
}

.action-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  transform: translateY(-5px);
}

.action-card .el-icon {
  font-size: 32px;
  color: #409EFF;
  margin-bottom: 10px;
}

.action-card span {
  display: block;
  color: #606266;
}

.trend-chart {
  margin: 30px 0;
}

.trend-chart h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #303133;
}

.chart {
  height: 400px;
}

.recent-orders {
  margin-top: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

@media (max-width: 768px) {
  .el-col {
    width: 100%;
  }
  
  .chart {
    height: 300px;
  }
}
</style> 