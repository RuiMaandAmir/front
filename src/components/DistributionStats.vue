<template>
  <div class="distribution-stats">
    <el-card class="stats-card">
      <template #header>
        <div class="card-header">
          <span>分销统计</span>
          <el-button type="primary" link @click="refreshStats">
            刷新
          </el-button>
        </div>
      </template>

      <div v-if="loading" class="loading">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else class="stats-content">
        <div class="stats-overview">
          <div class="stat-item">
            <div class="value">{{ stats.total_clicks }}</div>
            <div class="label">总点击次数</div>
          </div>
          <div class="stat-item">
            <div class="value">{{ stats.total_orders }}</div>
            <div class="label">总订单数</div>
          </div>
          <div class="stat-item">
            <div class="value">¥{{ stats.total_commission }}</div>
            <div class="label">总佣金</div>
          </div>
          <div class="stat-item">
            <div class="value">{{ stats.links_count }}</div>
            <div class="label">分销链接数</div>
          </div>
        </div>

        <div class="stats-charts">
          <div class="chart-container">
            <div ref="trendChartRef" class="chart"></div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductStore } from '@/stores/product'
import * as echarts from 'echarts'

const props = defineProps<{
  productId: number
}>()

const productStore = useProductStore()
const loading = ref(false)
const stats = ref<any>({
  total_clicks: 0,
  total_orders: 0,
  total_commission: 0,
  links_count: 0,
  orders_count: 0
})

const trendChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null

const loadStats = async () => {
  try {
    loading.value = true
    const response = await productStore.getDistributionStats(props.productId)
    stats.value = response
  } catch (error) {
    ElMessage.error('获取分销统计失败')
  } finally {
    loading.value = false
  }
}

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

const refreshStats = () => {
  loadStats()
}

onMounted(() => {
  loadStats()
  initTrendChart()
})

watch(() => props.productId, () => {
  loadStats()
})

// 监听窗口大小变化，调整图表大小
window.addEventListener('resize', () => {
  trendChart?.resize()
})
</script>

<style scoped>
.distribution-stats {
  margin-top: 20px;
}

.stats-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-content {
  padding: 20px 0;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
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

.stats-charts {
  margin-top: 30px;
}

.chart-container {
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}

.loading {
  padding: 20px;
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 