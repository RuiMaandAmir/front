<template>
  <div class="statistics-page">
    <div class="page-header">
      <h2>数据统计</h2>
    </div>

    <!-- 数据概览 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总销售额</span>
              <el-tag size="small" :type="salesGrowth >= 0 ? 'success' : 'danger'">
                {{ salesGrowth >= 0 ? '+' : '' }}{{ salesGrowth }}%
              </el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">¥{{ formatNumber(totalSales) }}</div>
            <div class="compare">较上月</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总佣金</span>
              <el-tag size="small" :type="commissionGrowth >= 0 ? 'success' : 'danger'">
                {{ commissionGrowth >= 0 ? '+' : '' }}{{ commissionGrowth }}%
              </el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">¥{{ formatNumber(totalCommission) }}</div>
            <div class="compare">较上月</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总订单数</span>
              <el-tag size="small" :type="orderGrowth >= 0 ? 'success' : 'danger'">
                {{ orderGrowth >= 0 ? '+' : '' }}{{ orderGrowth }}%
              </el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">{{ formatNumber(totalOrders) }}</div>
            <div class="compare">较上月</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>团队规模</span>
              <el-tag size="small" :type="teamGrowth >= 0 ? 'success' : 'danger'">
                {{ teamGrowth >= 0 ? '+' : '' }}{{ teamGrowth }}%
              </el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">{{ formatNumber(teamSize) }}</div>
            <div class="compare">较上月</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 时间范围选择 -->
    <div class="time-range">
      <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
        <el-radio-button label="7">近7天</el-radio-button>
        <el-radio-button label="30">近30天</el-radio-button>
        <el-radio-button label="90">近90天</el-radio-button>
      </el-radio-group>
      <el-date-picker
        v-model="customDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :shortcuts="dateShortcuts"
        @change="handleCustomDateChange"
      />
    </div>

    <!-- 趋势图表 -->
    <el-row :gutter="20" class="trend-charts">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>销售额趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="salesChartOption" autoresize />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>佣金趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="commissionChartOption" autoresize />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>订单趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="orderChartOption" autoresize />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>团队增长趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="teamChartOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 商品排行 -->
    <el-card shadow="hover" class="product-ranking">
      <template #header>
        <div class="card-header">
          <span>商品销售排行</span>
        </div>
      </template>
      <el-table :data="productRanking" style="width: 100%">
        <el-table-column type="index" label="排名" width="80" />
        <el-table-column label="商品信息">
          <template #default="{ row }">
            <div class="product-info">
              <el-image
                :src="row.image"
                :alt="row.name"
                class="product-image"
              />
              <div class="product-name">{{ row.name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sales_count" label="销量" width="120" />
        <el-table-column prop="sales_amount" label="销售额" width="120">
          <template #default="{ row }">
            ¥{{ formatNumber(row.sales_amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="commission_amount" label="佣金" width="120">
          <template #default="{ row }">
            ¥{{ formatNumber(row.commission_amount) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import dayjs from 'dayjs'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent
])

const productStore = useProductStore()

// 数据概览
const totalSales = ref(0)
const totalCommission = ref(0)
const totalOrders = ref(0)
const teamSize = ref(0)
const salesGrowth = ref(0)
const commissionGrowth = ref(0)
const orderGrowth = ref(0)
const teamGrowth = ref(0)

// 时间范围
const timeRange = ref('30')
const customDateRange = ref<[Date, Date] | null>(null)
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 趋势数据
const trends = ref({
  dates: [] as string[],
  sales: [] as number[],
  commission: [] as number[],
  orders: [] as number[],
  team: [] as number[]
})

// 商品排行
const productRanking = ref([])

// 图表配置
const salesChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: trends.value.dates
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '销售额',
      type: 'line',
      smooth: true,
      data: trends.value.sales,
      itemStyle: {
        color: '#409EFF'
      }
    }
  ]
}))

const commissionChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: trends.value.dates
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '佣金',
      type: 'line',
      smooth: true,
      data: trends.value.commission,
      itemStyle: {
        color: '#67C23A'
      }
    }
  ]
}))

const orderChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: trends.value.dates
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '订单数',
      type: 'line',
      smooth: true,
      data: trends.value.orders,
      itemStyle: {
        color: '#E6A23C'
      }
    }
  ]
}))

const teamChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: trends.value.dates
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '团队人数',
      type: 'line',
      smooth: true,
      data: trends.value.team,
      itemStyle: {
        color: '#F56C6C'
      }
    }
  ]
}))

// 获取统计数据
const getStatistics = async () => {
  try {
    const params = {
      time_range: timeRange.value,
      start_date: customDateRange.value?.[0]?.toISOString(),
      end_date: customDateRange.value?.[1]?.toISOString()
    }
    const response = await productStore.getDistributionStatistics(params)
    
    // 更新数据概览
    totalSales.value = response.total_sales
    totalCommission.value = response.total_commission
    totalOrders.value = response.total_orders
    teamSize.value = response.team_size
    salesGrowth.value = response.sales_growth
    commissionGrowth.value = response.commission_growth
    orderGrowth.value = response.order_growth
    teamGrowth.value = response.team_growth

    // 更新趋势数据
    trends.value = response.trends

    // 更新商品排行
    productRanking.value = response.product_ranking
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 处理时间范围变化
const handleTimeRangeChange = () => {
  customDateRange.value = null
  getStatistics()
}

// 处理自定义日期变化
const handleCustomDateChange = () => {
  if (customDateRange.value) {
    timeRange.value = 'custom'
    getStatistics()
  }
}

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

onMounted(() => {
  getStatistics()
})
</script>

<style scoped>
.statistics-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.data-overview {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.amount {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.compare {
  font-size: 14px;
  color: #909399;
}

.time-range {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.trend-charts {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.product-ranking {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.product-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .el-col {
    width: 100%;
    margin-bottom: 20px;
  }

  .time-range {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>