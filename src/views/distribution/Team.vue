<template>
  <div class="distribution-team">
    <!-- 团队概览 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="team-card">
          <template #header>
            <div class="card-header">
              <span>团队成员</span>
            </div>
          </template>
          <div class="card-value">{{ teamInfo.total_members || 0 }}</div>
          <div class="card-desc">总成员数</div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="team-card">
          <template #header>
            <div class="card-header">
              <span>本月新增</span>
            </div>
          </template>
          <div class="card-value">{{ teamInfo.new_members || 0 }}</div>
          <div class="card-desc">本月新增成员</div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="team-card">
          <template #header>
            <div class="card-header">
              <span>团队业绩</span>
            </div>
          </template>
          <div class="card-value">¥{{ teamInfo.total_sales || 0 }}</div>
          <div class="card-desc">累计销售额</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 团队管理 -->
    <div class="team-management">
      <div class="section-header">
        <h3>团队管理</h3>
        <div class="team-actions">
          <el-button type="primary" @click="showInviteDialog">
            邀请成员
            <el-icon><Plus /></el-icon>
          </el-button>
          <el-button type="success" @click="refreshTeam">
            刷新
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 成员列表 -->
      <el-table :data="teamMembers" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="level" label="等级">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
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
        <el-table-column prop="created_at" label="加入时间" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              type="danger"
              link
              @click="handleRemoveMember(row)"
              :disabled="row.level >= currentUserLevel"
            >
              移除
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

    <!-- 邀请成员对话框 -->
    <el-dialog
      v-model="inviteDialogVisible"
      title="邀请成员"
      width="500px"
    >
      <el-form
        ref="inviteFormRef"
        :model="inviteForm"
        :rules="inviteRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="inviteForm.username"
            placeholder="请输入要邀请的用户名"
          />
        </el-form-item>
        <el-form-item label="邀请说明" prop="message">
          <el-input
            v-model="inviteForm.message"
            type="textarea"
            placeholder="请输入邀请说明（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="inviteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitInvite" :loading="submitting">
            发送邀请
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const productStore = useProductStore()

// 团队信息
const teamInfo = ref({
  total_members: 0,
  new_members: 0,
  total_sales: 0
})

// 团队成员列表
const teamMembers = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentUserLevel = ref(0)

// 邀请对话框相关
const inviteDialogVisible = ref(false)
const submitting = ref(false)
const inviteFormRef = ref<FormInstance>()
const inviteForm = ref({
  username: '',
  message: ''
})

// 表单验证规则
const inviteRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ]
}

// 获取团队信息
const getTeamInfo = async () => {
  try {
    const response = await productStore.getDistributionTeamInfo()
    teamInfo.value = response
    currentUserLevel.value = response.level
  } catch (error) {
    console.error('获取团队信息失败:', error)
  }
}

// 获取团队成员列表
const getTeamMembers = async () => {
  try {
    const response = await productStore.getDistributionTeam({
      page: currentPage.value,
      page_size: pageSize.value
    })
    teamMembers.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('获取团队成员列表失败:', error)
  }
}

// 刷新团队信息
const refreshTeam = () => {
  getTeamInfo()
  getTeamMembers()
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getTeamMembers()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getTeamMembers()
}

// 显示邀请对话框
const showInviteDialog = () => {
  inviteForm.value = {
    username: '',
    message: ''
  }
  inviteDialogVisible.value = true
}

// 提交邀请
const submitInvite = async () => {
  if (!inviteFormRef.value) return
  
  await inviteFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        await productStore.inviteTeamMember(inviteForm.value)
        ElMessage.success('邀请已发送')
        inviteDialogVisible.value = false
        getTeamMembers()
      } catch (error) {
        console.error('发送邀请失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 移除成员
const handleRemoveMember = async (member: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除成员 ${member.nickname || member.username} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await productStore.removeTeamMember(member.id)
    ElMessage.success('成员已移除')
    getTeamMembers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除成员失败:', error)
    }
  }
}

// 获取等级类型
const getLevelType = (level: number) => {
  const typeMap: Record<number, string> = {
    1: 'info',
    2: 'success',
    3: 'warning',
    4: 'danger'
  }
  return typeMap[level] || 'info'
}

// 获取等级文本
const getLevelText = (level: number) => {
  const textMap: Record<number, string> = {
    1: '普通分销商',
    2: '高级分销商',
    3: '金牌分销商',
    4: '钻石分销商'
  }
  return textMap[level] || '未知等级'
}

onMounted(() => {
  getTeamInfo()
  getTeamMembers()
})
</script>

<style scoped>
.distribution-team {
  padding: 20px;
}

.team-card {
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

.team-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .el-col {
    width: 100%;
  }
  
  .team-actions {
    flex-direction: column;
  }
}
</style> 