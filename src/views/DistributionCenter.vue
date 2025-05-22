<template>
  <div class="distribution-center">
    <el-row :gutter="20">
      <!-- 分销商信息 -->
      <el-col :span="24">
        <el-card class="user-card">
          <div class="user-info">
            <div class="level-info">
              <el-avatar :size="64" :src="distributionUser?.level?.icon" />
              <div class="level-detail">
                <h3>{{ distributionUser?.level?.name }}</h3>
                <p>当前等级: Lv.{{ distributionUser?.level?.level }}</p>
                <p>佣金比例: {{ distributionUser?.level?.commission_rate }}%</p>
              </div>
            </div>
            <div class="user-stats">
              <div class="stat-item">
                <div class="value">¥{{ distributionUser?.total_sales || '0.00' }}</div>
                <div class="label">累计销售额</div>
              </div>
              <div class="stat-item">
                <div class="value">¥{{ distributionUser?.total_commission || '0.00' }}</div>
                <div class="label">累计佣金</div>
              </div>
              <div class="stat-item">
                <div class="value">¥{{ distributionUser?.available_commission || '0.00' }}</div>
                <div class="label">可提现佣金</div>
              </div>
            </div>
            <div class="action-buttons">
              <el-button type="primary" @click="$router.push('/distribution/withdrawal')">
                提现
              </el-button>
              <el-button type="success" @click="$router.push('/distribution/team')">
                团队管理
              </el-button>
              <el-button type="warning" @click="$router.push('/distribution/ranking')">
                业绩排行
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 分销概览 -->
      <el-col :span="24">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>分销概览</span>
              <el-button type="primary" link @click="refreshStats">
                刷新
              </el-button>
            </div>
          </template>

          <div v-if="loading" class="loading">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else class="overview-content">
            <div class="stat-item">
              <div class="value">¥{{ stats.total_commission || 0 }}</div>
              <div class="label">总佣金</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ stats.total_orders || 0 }}</div>
              <div class="label">总订单数</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ stats.total_clicks || 0 }}</div>
              <div class="label">总点击次数</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ stats.links_count || 0 }}</div>
              <div class="label">分销链接数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 分销趋势图 -->
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>分销趋势</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <div class="chart-container">
            <div ref="trendChartRef" class="chart"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 分销订单列表 -->
      <el-col :span="24">
        <el-card class="order-card">
          <template #header>
            <div class="card-header">
              <span>分销订单</span>
              <el-input
                v-model="searchQuery"
                placeholder="搜索订单号"
                style="width: 200px"
                clearable
                @clear="loadOrders"
              >
                <template #append>
                  <el-button @click="loadOrders">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
          </template>

          <el-table
            v-loading="loading"
            :data="orders"
            style="width: 100%"
          >
            <el-table-column prop="order_no" label="订单号" width="180" />
            <el-table-column prop="product.name" label="商品" />
            <el-table-column prop="commission" label="佣金" width="120">
              <template #default="{ row }">
                ¥{{ row.commission }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="180" />
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
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'
import * as echarts from 'echarts'

const productStore = useProductStore()
const loading = ref(false)
const distributionUser = ref<any>(null)
const stats = ref<any>({})
const orders = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const chartType = ref('week')

const trendChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null

// 加载分销商信息
const loadDistributionUser = async () => {
  try {
    loading.value = true
    const response = await productStore.getDistributionUser()
    distributionUser.value = response
  } catch (error) {
    ElMessage.error('获取分销商信息失败')
  } finally {
    loading.value = false
  }
}

// 加载分销统计
const loadStats = async () => {
  try {
    loading.value = true
    const response = await productStore.getDistributionOrderStats()
    stats.value = response
  } catch (error) {
    ElMessage.error('获取分销统计失败')
  } finally {
    loading.value = false
  }
}

// 加载分销订单
const loadOrders = async () => {
  try {
    loading.value = true
    const response = await productStore.getDistributionOrders({
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value
    })
    orders.value = response.items
    total.value = response.total
  } catch (error) {
    ElMessage.error('获取分销订单失败')
  } finally {
    loading.value = false
  }
}

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  const option = {
    title: {
      text: '分销趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['点击次数', '订单数', '佣金']
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: [
      {
        type: 'value',
        name: '数量',
        position: 'left'
      },
      {
        type: 'value',
        name: '佣金',
        position: 'right',
        axisLabel: {
          formatter: '¥{value}'
        }
      }
    ],
    series: [
      {
        name: '点击次数',
        type: 'line',
        data: []
      },
      {
        name: '订单数',
        type: 'line',
        data: []
      },
      {
        name: '佣金',
        type: 'line',
        yAxisIndex: 1,
        data: []
      }
    ]
  }
  trendChart.setOption(option)
}

// 更新趋势图数据
const updateTrendChart = (data: any) => {
  if (!trendChart) return

  const dates = data.map((item: any) => item.date)
  const clicks = data.map((item: any) => item.clicks)
  const orders = data.map((item: any) => item.orders)
  const commission = data.map((item: any) => item.commission)

  trendChart.setOption({
    xAxis: {
      data: dates
    },
    series: [
      {
        data: clicks
      },
      {
        data: orders
      },
      {
        data: commission
      }
    ]
  })
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    settled: 'success',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待结算',
    settled: '已结算',
    cancelled: '已取消'
  }
  return texts[status] || status
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadOrders()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadOrders()
}

// 刷新统计
const refreshStats = () => {
  loadStats()
}

// 监听图表类型变化
watch(chartType, () => {
  loadStats()
})

onMounted(() => {
  loadDistributionUser()
  loadStats()
  loadOrders()
  initTrendChart()
})

// 监听窗口大小变化
window.addEventListener('resize', () => {
  trendChart?.resize()
})
</script>

<style scoped>
.distribution-center {
  padding: 20px;
}

.user-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.level-detail h3 {
  margin: 0 0 10px;
  font-size: 20px;
}

.level-detail p {
  margin: 5px 0;
  color: #666;
}

.user-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-item .value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-item .label {
  color: #666;
  font-size: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overview-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.chart-card {
  margin-top: 20px;
}

.chart-container {
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}

.order-card {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.loading {
  padding: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    gap: 20px;
  }

  .user-stats {
    width: 100%;
    justify-content: space-between;
  }

  .overview-content {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-container {
    height: 300px;
  }

  .action-buttons {
    width: 100%;
    flex-wrap: wrap;
  }

  .action-buttons .el-button {
    flex: 1;
  }
}
</style> 