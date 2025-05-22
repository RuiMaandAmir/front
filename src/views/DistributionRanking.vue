<template>
  <div class="ranking-page">
    <el-card class="ranking-card">
      <template #header>
        <div class="card-header">
          <span>分销商业绩排行</span>
          <el-radio-group v-model="period" size="small" @change="loadRanking">
            <el-radio-button label="daily">日榜</el-radio-button>
            <el-radio-button label="weekly">周榜</el-radio-button>
            <el-radio-button label="monthly">月榜</el-radio-button>
            <el-radio-button label="yearly">年榜</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="rankings"
        style="width: 100%"
      >
        <el-table-column type="index" label="排名" width="80">
          <template #default="{ $index }">
            <div class="rank-number" :class="getRankClass($index + 1)">
              {{ $index + 1 }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="distribution_user.user.username" label="分销商" />
        <el-table-column prop="distribution_user.level.name" label="等级" />
        <el-table-column prop="sales" label="销售额">
          <template #default="{ row }">
            ¥{{ row.sales }}
          </template>
        </el-table-column>
        <el-table-column prop="commission" label="佣金">
          <template #default="{ row }">
            ¥{{ row.commission }}
          </template>
        </el-table-column>
        <el-table-column prop="orders" label="订单数" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()
const loading = ref(false)
const rankings = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const period = ref('daily')

// 加载排行榜数据
const loadRanking = async () => {
  try {
    loading.value = true
    const response = await productStore.getDistributionRanking({
      period: period.value,
      page: currentPage.value,
      page_size: pageSize.value
    })
    rankings.value = response.items
    total.value = response.total
  } catch (error) {
    ElMessage.error('获取排行榜数据失败')
  } finally {
    loading.value = false
  }
}

// 获取排名样式
const getRankClass = (rank: number) => {
  const classes: Record<number, string> = {
    1: 'rank-first',
    2: 'rank-second',
    3: 'rank-third'
  }
  return classes[rank] || ''
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadRanking()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadRanking()
}

onMounted(() => {
  loadRanking()
})
</script>

<style scoped>
.ranking-page {
  padding: 20px;
}

.ranking-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rank-number {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 50%;
  font-weight: bold;
}

.rank-first {
  background-color: #f56c6c;
  color: white;
}

.rank-second {
  background-color: #e6a23c;
  color: white;
}

.rank-third {
  background-color: #67c23a;
  color: white;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 