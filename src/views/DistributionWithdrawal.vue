<template>
  <div class="withdrawal-page">
    <el-card class="balance-card">
      <template #header>
        <div class="card-header">
          <span>可提现余额</span>
        </div>
      </template>
      <div class="balance-content">
        <div class="amount">¥{{ distributionUser?.available_commission || '0.00' }}</div>
        <el-button type="primary" @click="showWithdrawalDialog = true" :disabled="!canWithdraw">
          申请提现
        </el-button>
      </div>
    </el-card>

    <el-card class="withdrawal-list">
      <template #header>
        <div class="card-header">
          <span>提现记录</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="withdrawals"
        style="width: 100%"
      >
        <el-table-column prop="amount" label="提现金额" width="120">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="bank_name" label="银行" width="120" />
        <el-table-column prop="bank_account" label="账号" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" width="180" />
        <el-table-column prop="remark" label="备注" />
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

    <!-- 提现对话框 -->
    <el-dialog
      v-model="showWithdrawalDialog"
      title="申请提现"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="withdrawalForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="提现金额" prop="amount">
          <el-input-number
            v-model="withdrawalForm.amount"
            :min="minWithdrawal"
            :max="distributionUser?.available_commission"
            :precision="2"
            :step="100"
          />
          <div class="form-tip">
            最低提现金额：¥{{ minWithdrawal }}
          </div>
        </el-form-item>
        <el-form-item label="银行名称" prop="bank_name">
          <el-input v-model="withdrawalForm.bank_name" />
        </el-form-item>
        <el-form-item label="银行账号" prop="bank_account">
          <el-input v-model="withdrawalForm.bank_account" />
        </el-form-item>
        <el-form-item label="开户名" prop="account_name">
          <el-input v-model="withdrawalForm.account_name" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="withdrawalForm.remark"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showWithdrawalDialog = false">取消</el-button>
          <el-button type="primary" @click="submitWithdrawal">
            确认提现
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()
const loading = ref(false)
const showWithdrawalDialog = ref(false)
const distributionUser = ref<any>(null)
const withdrawals = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const minWithdrawal = 100 // 最低提现金额

const formRef = ref<FormInstance>()
const withdrawalForm = ref({
  amount: 0,
  bank_name: '',
  bank_account: '',
  account_name: '',
  remark: ''
})

const rules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    { type: 'number', min: minWithdrawal, message: `提现金额不能低于¥${minWithdrawal}`, trigger: 'blur' }
  ],
  bank_name: [
    { required: true, message: '请输入银行名称', trigger: 'blur' }
  ],
  bank_account: [
    { required: true, message: '请输入银行账号', trigger: 'blur' }
  ],
  account_name: [
    { required: true, message: '请输入开户名', trigger: 'blur' }
  ]
}

const canWithdraw = computed(() => {
  return distributionUser.value?.available_commission >= minWithdrawal
})

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

// 加载提现记录
const loadWithdrawals = async () => {
  try {
    loading.value = true
    const response = await productStore.getWithdrawals({
      page: currentPage.value,
      page_size: pageSize.value
    })
    withdrawals.value = response.items
    total.value = response.total
  } catch (error) {
    ElMessage.error('获取提现记录失败')
  } finally {
    loading.value = false
  }
}

// 提交提现申请
const submitWithdrawal = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await productStore.createWithdrawal(withdrawalForm.value)
        ElMessage.success('提现申请已提交')
        showWithdrawalDialog.value = false
        loadWithdrawals()
        loadDistributionUser()
      } catch (error) {
        ElMessage.error('提现申请失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    completed: 'success'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    completed: '已完成'
  }
  return texts[status] || status
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadWithdrawals()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadWithdrawals()
}

onMounted(() => {
  loadDistributionUser()
  loadWithdrawals()
})
</script>

<style scoped>
.withdrawal-page {
  padding: 20px;
}

.balance-card {
  margin-bottom: 20px;
}

.balance-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.amount {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}

.withdrawal-list {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .balance-content {
    flex-direction: column;
    gap: 20px;
  }
}
</style> 