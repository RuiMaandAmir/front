<template>
  <div class="distribution-activities">
    <!-- 活动列表 -->
    <div class="activity-list">
      <div class="section-header">
        <h3>活动列表</h3>
        <el-button type="primary" @click="showCreateDialog">
          创建活动
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>

      <el-table :data="activities" style="width: 100%">
        <el-table-column prop="name" label="活动名称" />
        <el-table-column prop="start_time" label="开始时间" width="180" />
        <el-table-column prop="end_time" label="结束时间" width="180" />
        <el-table-column prop="commission_rate" label="佣金比例" width="120">
          <template #default="{ row }">
            {{ row.commission_rate }}%
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="showEditDialog(row)">
              编辑
            </el-button>
            <el-button type="primary" link @click="showDetailDialog(row)">
              详情
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
              :disabled="row.status === 'active'"
            >
              删除
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

    <!-- 创建/编辑活动对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑活动' : '创建活动'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入活动名称" />
        </el-form-item>

        <el-form-item label="活动时间" prop="time">
          <el-date-picker
            v-model="form.time"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="佣金比例" prop="commission_rate">
          <el-input-number
            v-model="form.commission_rate"
            :min="0"
            :max="100"
            :precision="2"
          />
          <span class="unit">%</span>
        </el-form-item>

        <el-form-item label="活动说明" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入活动说明"
          />
        </el-form-item>

        <el-form-item label="活动规则" prop="rules">
          <el-input
            v-model="form.rules"
            type="textarea"
            :rows="4"
            placeholder="请输入活动规则"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 活动详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="活动详情"
      width="800px"
    >
      <div v-if="currentActivity" class="activity-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动名称">
            {{ currentActivity.name }}
          </el-descriptions-item>
          <el-descriptions-item label="活动状态">
            <el-tag :type="getStatusType(currentActivity.status)">
              {{ getStatusText(currentActivity.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ currentActivity.start_time }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间">
            {{ currentActivity.end_time }}
          </el-descriptions-item>
          <el-descriptions-item label="佣金比例">
            {{ currentActivity.commission_rate }}%
          </el-descriptions-item>
          <el-descriptions-item label="参与人数">
            {{ currentActivity.participants }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>活动说明</h4>
          <p>{{ currentActivity.description }}</p>
        </div>

        <div class="detail-section">
          <h4>活动规则</h4>
          <p>{{ currentActivity.rules }}</p>
        </div>

        <div class="detail-section">
          <h4>活动数据</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="总销售额">
              ¥{{ currentActivity.total_sales }}
            </el-descriptions-item>
            <el-descriptions-item label="总佣金">
              ¥{{ currentActivity.total_commission }}
            </el-descriptions-item>
            <el-descriptions-item label="订单数">
              {{ currentActivity.order_count }}
            </el-descriptions-item>
            <el-descriptions-item label="转化率">
              {{ currentActivity.conversion_rate }}%
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useProductStore } from '@/stores/product'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

const productStore = useProductStore()

// 活动列表
const activities = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框控制
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const currentActivity = ref(null)

// 表单
const formRef = ref<FormInstance>()
const form = reactive({
  name: '',
  time: [] as string[],
  commission_rate: 0,
  description: '',
  rules: ''
})

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' }
  ],
  time: [
    { required: true, message: '请选择活动时间', trigger: 'change' }
  ],
  commission_rate: [
    { required: true, message: '请设置佣金比例', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入活动说明', trigger: 'blur' }
  ],
  rules: [
    { required: true, message: '请输入活动规则', trigger: 'blur' }
  ]
})

// 获取活动列表
const getActivities = async () => {
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    const response = await productStore.getDistributionActivities(params)
    activities.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('获取活动列表失败:', error)
    ElMessage.error('获取活动列表失败，请重试')
  }
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getActivities()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getActivities()
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  form.name = ''
  form.time = []
  form.commission_rate = 0
  form.description = ''
  form.rules = ''
  dialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (activity: any) => {
  isEdit.value = true
  form.name = activity.name
  form.time = [activity.start_time, activity.end_time]
  form.commission_rate = activity.commission_rate
  form.description = activity.description
  form.rules = activity.rules
  currentActivity.value = activity
  dialogVisible.value = true
}

// 显示详情对话框
const showDetailDialog = (activity: any) => {
  currentActivity.value = activity
  detailDialogVisible.value = true
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          name: form.name,
          start_time: form.time[0],
          end_time: form.time[1],
          commission_rate: form.commission_rate,
          description: form.description,
          rules: form.rules
        }
        
        if (isEdit.value && currentActivity.value) {
          await productStore.updateDistributionActivity({
            id: currentActivity.value.id,
            ...data
          })
          ElMessage.success('活动已更新')
        } else {
          await productStore.createDistributionActivity(data)
          ElMessage.success('活动已创建')
        }
        
        dialogVisible.value = false
        getActivities()
      } catch (error) {
        console.error('保存活动失败:', error)
        ElMessage.error('保存失败，请重试')
      }
    }
  })
}

// 处理删除
const handleDelete = (activity: any) => {
  ElMessageBox.confirm(
    '确定要删除该活动吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await productStore.deleteDistributionActivity(activity.id)
      ElMessage.success('活动已删除')
      getActivities()
    } catch (error) {
      console.error('删除活动失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  })
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    pending: 'warning',
    ended: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '进行中',
    pending: '未开始',
    ended: '已结束'
  }
  return textMap[status] || status
}

// 初始化
getActivities()
</script>

<style scoped>
.distribution-activities {
  padding: 20px;
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.unit {
  margin-left: 5px;
  color: #606266;
}

.activity-detail {
  padding: 20px;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #303133;
}

.detail-section p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 