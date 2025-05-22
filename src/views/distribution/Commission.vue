<template>
  <div class="commission-management">
    <!-- 佣金概览 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="commission-card">
          <template #header>
            <div class="card-header">
              <span>可提现佣金</span>
            </div>
          </template>
          <div class="card-value">¥{{ commissionInfo.available || 0 }}</div>
          <el-button type="primary" @click="showWithdrawDialog">申请提现</el-button>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="commission-card">
          <template #header>
            <div class="card-header">
              <span>待结算佣金</span>
            </div>
          </template>
          <div class="card-value">¥{{ commissionInfo.pending || 0 }}</div>
          <div class="card-desc">订单完成后自动结算</div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="commission-card">
          <template #header>
            <div class="card-header">
              <span>已结算佣金</span>
            </div>
          </template>
          <div class="card-value">¥{{ commissionInfo.settled || 0 }}</div>
          <div class="card-desc">累计已结算佣金</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 提现记录 -->
    <div class="withdrawal-records">
      <div class="section-header">
        <h3>提现记录</h3>
        <el-button type="primary" link @click="refreshWithdrawals">
          刷新
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
      <el-table :data="withdrawals" style="width: 100%">
        <el-table-column prop="withdrawal_no" label="提现单号" width="180" />
        <el-table-column prop="amount" label="提现金额" width="120">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="bank_name" label="银行" width="120" />
        <el-table-column prop="bank_account" label="账号" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getWithdrawalStatusType(row.status)">
              {{ getWithdrawalStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" />
        <el-table-column prop="settled_at" label="结算时间" />
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="withdrawalPage"
          v-model:page-size="withdrawalPageSize"
          :total="totalWithdrawals"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleWithdrawalSizeChange"
          @current-change="handleWithdrawalPageChange"
        />
      </div>
    </div>

    <!-- 佣金明细 -->
    <div class="commission-details">
      <div class="section-header">
        <h3>佣金明细</h3>
        <div class="filter-section">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateRangeChange"
          />
          <el-select v-model="statusFilter" placeholder="状态" @change="handleStatusChange">
            <el-option label="全部" value="" />
            <el-option label="待结算" value="pending" />
            <el-option label="已结算" value="settled" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </div>
      </div>
      <el-table :data="commissionDetails" style="width: 100%">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="amount" label="订单金额" width="120">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="commission" label="佣金" width="120">
          <template #default="{ row }">
            ¥{{ row.commission }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getCommissionStatusType(row.status)">
              {{ getCommissionStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" />
        <el-table-column prop="settled_at" label="结算时间" />
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="commissionPage"
          v-model:page-size="commissionPageSize"
          :total="totalCommissions"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleCommissionSizeChange"
          @current-change="handleCommissionPageChange"
        />
      </div>
    </div>

    <!-- 提现对话框 -->
    <el-dialog
      v-model="withdrawDialogVisible"
      title="申请提现"
      width="500px"
    >
      <el-form
        ref="withdrawFormRef"
        :model="withdrawForm"
        :rules="withdrawRules"
        label-width="100px"
      >
        <el-form-item label="提现金额" prop="amount">
          <el-input-number
            v-model="withdrawForm.amount"
            :min="100"
            :max="commissionInfo.available"
            :precision="2"
            :step="100"
          />
          <div class="form-tip">可提现金额：¥{{ commissionInfo.available }}</div>
        </el-form-item>
        <el-form-item label="银行名称" prop="bank_name">
          <el-input v-model="withdrawForm.bank_name" placeholder="请输入银行名称" />
        </el-form-item>
        <el-form-item label="银行账号" prop="bank_account">
          <el-input v-model="withdrawForm.bank_account" placeholder="请输入银行账号" />
        </el-form-item>
        <el-form-item label="开户人姓名" prop="account_name">
          <el-input v-model="withdrawForm.account_name" placeholder="请输入开户人姓名" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="withdrawForm.remark"
            type="textarea"
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="withdrawDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitWithdraw" :loading="submitting">
            确认提现
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const productStore = useProductStore()

// 佣金信息
const commissionInfo = ref({
  available: 0,
  pending: 0,
  settled: 0
})

// 提现记录相关
const withdrawals = ref([])
const withdrawalPage = ref(1)
const withdrawalPageSize = ref(10)
const totalWithdrawals = ref(0)

// 佣金明细相关
const commissionDetails = ref([])
const commissionPage = ref(1)
const commissionPageSize = ref(10)
const totalCommissions = ref(0)
const dateRange = ref<[Date, Date] | null>(null)
const statusFilter = ref('')

// 提现对话框相关
const withdrawDialogVisible = ref(false)
const submitting = ref(false)
const withdrawFormRef = ref<FormInstance>()
const withdrawForm = ref({
  amount: 100,
  bank_name: '',
  bank_account: '',
  account_name: '',
  remark: ''
})

// 表单验证规则
const withdrawRules: FormRules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    { type: 'number', min: 100, message: '提现金额不能小于100元', trigger: 'blur' }
  ],
  bank_name: [
    { required: true, message: '请输入银行名称', trigger: 'blur' }
  ],
  bank_account: [
    { required: true, message: '请输入银行账号', trigger: 'blur' }
  ],
  account_name: [
    { required: true, message: '请输入开户人姓名', trigger: 'blur' }
  ]
}

// 获取佣金信息
const getCommissionInfo = async () => {
  try {
    const response = await productStore.getDistributionUser()
    commissionInfo.value = response
  } catch (error) {
    console.error('获取佣金信息失败:', error)
  }
}

// 获取提现记录
const getWithdrawals = async () => {
  try {
    const response = await productStore.getWithdrawals({
      page: withdrawalPage.value,
      page_size: withdrawalPageSize.value
    })
    withdrawals.value = response.items
    totalWithdrawals.value = response.total
  } catch (error) {
    console.error('获取提现记录失败:', error)
  }
}

// 获取佣金明细
const getCommissionDetails = async () => {
  try {
    const params: any = {
      page: commissionPage.value,
      page_size: commissionPageSize.value
    }
    if (dateRange.value) {
      params.start_date = dateRange.value[0].toISOString().split('T')[0]
      params.end_date = dateRange.value[1].toISOString().split('T')[0]
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    const response = await productStore.getCommissionSettlements(params)
    commissionDetails.value = response.items
    totalCommissions.value = response.total
  } catch (error) {
    console.error('获取佣金明细失败:', error)
  }
}

// 刷新提现记录
const refreshWithdrawals = () => {
  getWithdrawals()
}

// 处理提现记录分页
const handleWithdrawalSizeChange = (val: number) => {
  withdrawalPageSize.value = val
  getWithdrawals()
}

const handleWithdrawalPageChange = (val: number) => {
  withdrawalPage.value = val
  getWithdrawals()
}

// 处理佣金明细分页
const handleCommissionSizeChange = (val: number) => {
  commissionPageSize.value = val
  getCommissionDetails()
}

const handleCommissionPageChange = (val: number) => {
  commissionPage.value = val
  getCommissionDetails()
}

// 处理日期范围变化
const handleDateRangeChange = () => {
  commissionPage.value = 1
  getCommissionDetails()
}

// 处理状态筛选变化
const handleStatusChange = () => {
  commissionPage.value = 1
  getCommissionDetails()
}

// 显示提现对话框
const showWithdrawDialog = () => {
  withdrawForm.value = {
    amount: 100,
    bank_name: '',
    bank_account: '',
    account_name: '',
    remark: ''
  }
  withdrawDialogVisible.value = true
}

// 提交提现申请
const submitWithdraw = async () => {
  if (!withdrawFormRef.value) return
  
  await withdrawFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        await productStore.createWithdrawal(withdrawForm.value)
        ElMessage.success('提现申请已提交')
        withdrawDialogVisible.value = false
        getCommissionInfo()
        getWithdrawals()
      } catch (error) {
        console.error('提交提现申请失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 获取提现状态类型
const getWithdrawalStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    rejected: 'danger',
    cancelled: 'info'
  }
  return statusMap[status] || 'info'
}

// 获取提现状态文本
const getWithdrawalStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    rejected: '已拒绝',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取佣金状态类型
const getCommissionStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    settled: 'success',
    cancelled: 'info'
  }
  return statusMap[status] || 'info'
}

// 获取佣金状态文本
const getCommissionStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待结算',
    settled: '已结算',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

onMounted(() => {
  getCommissionInfo()
  getWithdrawals()
  getCommissionDetails()
})
</script>

<style scoped>
.commission-management {
  padding: 20px;
}

.commission-card {
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

.filter-section {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .el-col {
    width: 100%;
  }
  
  .filter-section {
    flex-direction: column;
  }
}
</style> 