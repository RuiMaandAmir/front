<template>
  <div class="team-page">
    <!-- 团队信息 -->
    <el-card class="team-info" v-if="team">
      <template #header>
        <div class="card-header">
          <span>团队信息</span>
          <el-button type="primary" link @click="showEditDialog = true">
            编辑团队
          </el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="团队名称">
          {{ team.name }}
        </el-descriptions-item>
        <el-descriptions-item label="团队长">
          {{ team.leader.user.username }}
        </el-descriptions-item>
        <el-descriptions-item label="团队销售额">
          ¥{{ team.total_sales }}
        </el-descriptions-item>
        <el-descriptions-item label="团队佣金">
          ¥{{ team.total_commission }}
        </el-descriptions-item>
        <el-descriptions-item label="团队成员数">
          {{ team.members.length }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ team.created_at }}
        </el-descriptions-item>
        <el-descriptions-item label="团队描述" :span="2">
          {{ team.description }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 团队成员列表 -->
    <el-card class="team-members">
      <template #header>
        <div class="card-header">
          <span>团队成员</span>
          <el-button type="primary" @click="showInviteDialog = true">
            邀请成员
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="team?.members"
        style="width: 100%"
      >
        <el-table-column prop="user.username" label="用户名" />
        <el-table-column prop="level.name" label="等级" />
        <el-table-column prop="total_sales" label="销售额">
          <template #default="{ row }">
            ¥{{ row.total_sales }}
          </template>
        </el-table-column>
        <el-table-column prop="total_commission" label="佣金">
          <template #default="{ row }">
            ¥{{ row.total_commission }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              type="danger"
              link
              @click="removeMember(row)"
              :disabled="row.id === team?.leader.id"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑团队对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑团队"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item label="团队名称" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="团队描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="updateTeam">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 邀请成员对话框 -->
    <el-dialog
      v-model="showInviteDialog"
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
          <el-input v-model="inviteForm.username" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showInviteDialog = false">取消</el-button>
          <el-button type="primary" @click="inviteMember">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()
const loading = ref(false)
const team = ref<any>(null)
const showEditDialog = ref(false)
const showInviteDialog = ref(false)

const editFormRef = ref<FormInstance>()
const editForm = ref({
  name: '',
  description: ''
})

const inviteFormRef = ref<FormInstance>()
const inviteForm = ref({
  username: ''
})

const editRules = {
  name: [
    { required: true, message: '请输入团队名称', trigger: 'blur' }
  ]
}

const inviteRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ]
}

// 加载团队信息
const loadTeam = async () => {
  try {
    loading.value = true
    const response = await productStore.getDistributionTeam()
    team.value = response
    editForm.value = {
      name: response.name,
      description: response.description
    }
  } catch (error) {
    ElMessage.error('获取团队信息失败')
  } finally {
    loading.value = false
  }
}

// 更新团队信息
const updateTeam = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await productStore.updateDistributionTeam(editForm.value)
        ElMessage.success('团队信息已更新')
        showEditDialog.value = false
        loadTeam()
      } catch (error) {
        ElMessage.error('更新团队信息失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 邀请成员
const inviteMember = async () => {
  if (!inviteFormRef.value) return
  
  await inviteFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await productStore.inviteTeamMember(inviteForm.value)
        ElMessage.success('邀请已发送')
        showInviteDialog.value = false
        loadTeam()
      } catch (error) {
        ElMessage.error('邀请失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 移除成员
const removeMember = async (member: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除成员 ${member.user.username} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    await productStore.removeTeamMember(member.id)
    ElMessage.success('成员已移除')
    loadTeam()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除成员失败')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTeam()
})
</script>

<style scoped>
.team-page {
  padding: 20px;
}

.team-info {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-members {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 