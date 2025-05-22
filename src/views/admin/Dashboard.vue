<template>
  <div class="dashboard-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>今日销售额</span>
              <el-tag size="small" type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">¥{{ todaySales.toFixed(2) }}</div>
            <div class="trend">
              <span :class="{ 'up': salesTrend > 0, 'down': salesTrend < 0 }">
                {{ Math.abs(salesTrend) }}%
              </span>
              较昨日
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>今日订单数</span>
              <el-tag size="small" type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">{{ todayOrders }}</div>
            <div class="trend">
              <span :class="{ 'up': ordersTrend > 0, 'down': ordersTrend < 0 }">
                {{ Math.abs(ordersTrend) }}%
              </span>
              较昨日
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>今日新增用户</span>
              <el-tag size="small" type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">{{ todayUsers }}</div>
            <div class="trend">
              <span :class="{ 'up': usersTrend > 0, 'down': usersTrend < 0 }">
                {{ Math.abs(usersTrend) }}%
              </span>
              较昨日
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>今日新增分销商</span>
              <el-tag size="small" type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">{{ todayDistributors }}</div>
            <div class="trend">
              <span :class="{ 'up': distributorsTrend > 0, 'down': distributorsTrend < 0 }">
                {{ Math.abs(distributorsTrend) }}%
              </span>
              较昨日
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>销售趋势</span>
              <el-radio-group v-model="salesChartType" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="salesChartOption" autoresize />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>销售分类占比</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="categoryChartOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="table-row">
      <el-col :span="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>热销商品</span>
              <el-button type="primary" link>查看更多</el-button>
            </div>
          </template>
          <el-table :data="hotProducts" style="width: 100%">
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="sales" label="销量" width="100" />
            <el-table-column prop="amount" label="销售额" width="120">
              <template #default="{ row }">
                ¥{{ row.amount.toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>最新订单</span>
              <el-button type="primary" link>查看更多</el-button>
            </div>
          </template>
          <el-table :data="latestOrders" style="width: 100%">
            <el-table-column prop="order_no" label="订单号" width="180" />
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="{ row }">
                ¥{{ row.amount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getOrderStatusType(row.status)">
                  {{ getOrderStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

// 数据
const todaySales = ref(0)
const salesTrend = ref(0)
const todayOrders = ref(0)
const ordersTrend = ref(0)
const todayUsers = ref(0)
const usersTrend = ref(0)
const todayDistributors = ref(0)
const distributorsTrend = ref(0)

const salesChartType = ref('week')
const salesChartOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    }
  ]
})

const categoryChartOption = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '服装' },
        { value: 735, name: '电子' },
        { value: 580, name: '食品' },
        { value: 484, name: '家居' },
        { value: 300, name: '其他' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

const hotProducts = ref([
  { name: '商品1', sales: 100, amount: 1000 },
  { name: '商品2', sales: 80, amount: 800 },
  { name: '商品3', sales: 60, amount: 600 },
  { name: '商品4', sales: 40, amount: 400 },
  { name: '商品5', sales: 20, amount: 200 }
])

const latestOrders = ref([
  { order_no: '202403150001', amount: 1000, status: 'pending' },
  { order_no: '202403150002', amount: 800, status: 'paid' },
  { order_no: '202403150003', amount: 600, status: 'shipped' },
  { order_no: '202403150004', amount: 400, status: 'completed' },
  { order_no: '202403150005', amount: 200, status: 'cancelled' }
])

// 方法
const getOrderStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'success',
    completed: 'success',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

const getOrderStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

// 生命周期
onMounted(() => {
  // TODO: 加载数据
})
</script>

<style scoped>
.dashboard-page {
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

.card-content {
  text-align: center;
}

.amount {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.trend {
  font-size: 14px;
  color: #666;
}

.trend .up {
  color: #67c23a;
}

.trend .down {
  color: #f56c6c;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  height: 320px;
}

.chart {
  height: 100%;
}

.table-row {
  margin-bottom: 20px;
}

.table-card {
  height: 400px;
}
</style> 