<template>
  <div class="refund-stats-page">
    <div class="page-header">
      <h2>退款统计</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
          @change="handleDateChange"
        />
      </div>
    </div>

    <div class="stats-content">
      <!-- 概览卡片 -->
      <div class="overview-cards">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>退款总数</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.total_count }}</div>
          <div class="stat-trend">
            较上月
            <span :class="stats.total_trend >= 0 ? 'up' : 'down'">
              {{ Math.abs(stats.total_trend) }}%
              <el-icon>
                <component :is="stats.total_trend >= 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </span>
          </div>
        </el-card>

        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>退款金额</span>
            </div>
          </template>
          <div class="stat-value">¥{{ stats.total_amount }}</div>
          <div class="stat-trend">
            较上月
            <span :class="stats.amount_trend >= 0 ? 'up' : 'down'">
              {{ Math.abs(stats.amount_trend) }}%
              <el-icon>
                <component :is="stats.amount_trend >= 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </span>
          </div>
        </el-card>

        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>平均处理时长</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.avg_process_time }}小时</div>
          <div class="stat-trend">
            较上月
            <span :class="stats.time_trend <= 0 ? 'up' : 'down'">
              {{ Math.abs(stats.time_trend) }}%
              <el-icon>
                <component :is="stats.time_trend <= 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </span>
          </div>
        </el-card>
      </div>

      <!-- 退款原因分布 -->
      <el-card class="reason-chart">
        <template #header>
          <div class="card-header">
            <span>退款原因分布</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="reasonChartRef" class="chart"></div>
        </div>
      </el-card>

      <!-- 处理时效分析 -->
      <el-card class="time-chart">
        <template #header>
          <div class="card-header">
            <span>处理时效分析</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="timeChartRef" class="chart"></div>
        </div>
      </el-card>

      <!-- 退款趋势 -->
      <el-card class="trend-chart">
        <template #header>
          <div class="card-header">
            <span>退款趋势</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="trendChartRef" class="chart"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { useOrderStore } from '../stores/order';

const orderStore = useOrderStore();
const dateRange = ref([]);
const stats = ref({
  total_count: 0,
  total_amount: 0,
  avg_process_time: 0,
  total_trend: 0,
  amount_trend: 0,
  time_trend: 0,
  reason_stats: [],
  time_stats: [],
  trend_stats: [],
});

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

// 图表实例
let reasonChart: echarts.ECharts | null = null;
let timeChart: echarts.ECharts | null = null;
let trendChart: echarts.ECharts | null = null;

// 图表容器引用
const reasonChartRef = ref<HTMLElement>();
const timeChartRef = ref<HTMLElement>();
const trendChartRef = ref<HTMLElement>();

// 处理日期变化
const handleDateChange = () => {
  loadStats();
};

// 加载统计数据
const loadStats = async () => {
  try {
    const [start, end] = dateRange.value;
    const response = await orderStore.getRefundStats({
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    });
    stats.value = response.data;
    updateCharts();
  } catch (error) {
    ElMessage.error('加载统计数据失败');
  }
};

// 初始化原因分布图表
const initReasonChart = () => {
  if (!reasonChartRef.value) return;
  
  reasonChart = echarts.init(reasonChartRef.value);
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [],
      },
    ],
  };
  reasonChart.setOption(option);
};

// 初始化处理时效图表
const initTimeChart = () => {
  if (!timeChartRef.value) return;
  
  timeChart = echarts.init(timeChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: [],
    },
    yAxis: {
      type: 'value',
      name: '处理时长（小时）',
    },
    series: [
      {
        type: 'bar',
        data: [],
      },
    ],
  };
  timeChart.setOption(option);
};

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return;
  
  trendChart = echarts.init(trendChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['退款数量', '退款金额'],
    },
    xAxis: {
      type: 'category',
      data: [],
    },
    yAxis: [
      {
        type: 'value',
        name: '退款数量',
      },
      {
        type: 'value',
        name: '退款金额',
        axisLabel: {
          formatter: '¥{value}',
        },
      },
    ],
    series: [
      {
        name: '退款数量',
        type: 'line',
        data: [],
      },
      {
        name: '退款金额',
        type: 'line',
        yAxisIndex: 1,
        data: [],
      },
    ],
  };
  trendChart.setOption(option);
};

// 更新图表数据
const updateCharts = () => {
  if (reasonChart) {
    reasonChart.setOption({
      series: [{
        data: stats.value.reason_stats.map(item => ({
          name: item.reason,
          value: item.count,
        })),
      }],
    });
  }

  if (timeChart) {
    timeChart.setOption({
      xAxis: {
        data: stats.value.time_stats.map(item => item.date),
      },
      series: [{
        data: stats.value.time_stats.map(item => item.avg_time),
      }],
    });
  }

  if (trendChart) {
    trendChart.setOption({
      xAxis: {
        data: stats.value.trend_stats.map(item => item.date),
      },
      series: [
        {
          data: stats.value.trend_stats.map(item => item.count),
        },
        {
          data: stats.value.trend_stats.map(item => item.amount),
        },
      ],
    });
  }
};

// 处理窗口大小变化
const handleResize = () => {
  reasonChart?.resize();
  timeChart?.resize();
  trendChart?.resize();
};

onMounted(() => {
  // 设置默认日期范围为最近一个月
  dateRange.value = dateShortcuts[1].value();
  
  // 初始化图表
  initReasonChart();
  initTimeChart();
  initTrendChart();
  
  // 加载数据
  loadStats();
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // 销毁图表实例
  reasonChart?.dispose();
  timeChart?.dispose();
  trendChart?.dispose();
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.refund-stats-page {
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

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2e7d32;
  margin: 10px 0;
}

.stat-trend {
  color: #666;
  font-size: 14px;
}

.stat-trend .up {
  color: #67c23a;
}

.stat-trend .down {
  color: #f56c6c;
}

.chart-container {
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .refund-stats-page {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    gap: 10px;
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 300px;
  }
}
</style> 