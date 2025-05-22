<template>
  <div class="withdrawal-container">
    <el-card class="withdrawal-card">
      <template #header>
        <div class="card-header">
          <span>提现申请</span>
        </div>
      </template>
      
      <!-- 提现表单 -->
      <el-form 
        ref="withdrawalForm"
        :model="withdrawalForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="提现金额" prop="amount">
          <el-input-number 
            v-model="withdrawalForm.amount"
            :min="10"
            :max="20000"
            :precision="2"
            :step="100"
          />
          <div class="balance-info">
            可提现余额: ¥{{ distributorInfo.balance }}
          </div>
        </el-form-item>
        
        <el-form-item label="提现方式" prop="payment_method">
          <el-radio-group v-model="withdrawalForm.payment_method">
            <el-radio label="wechat">微信钱包</el-radio>
            <el-radio label="alipay">支付宝</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 支付宝信息 -->
        <template v-if="withdrawalForm.payment_method === 'alipay'">
          <el-form-item label="支付宝账号" prop="alipay_account">
            <el-input v-model="withdrawalForm.alipay_account" />
          </el-form-item>
          <el-form-item label="支付宝姓名" prop="alipay_name">
            <el-input v-model="withdrawalForm.alipay_name" />
          </el-form-item>
        </template>
        
        <el-form-item>
          <el-button type="primary" @click="submitWithdrawal" :loading="submitting">
            提交申请
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 提现记录 -->
    <el-card class="withdrawal-records">
      <template #header>
        <div class="card-header">
          <span>提现记录</span>
        </div>
      </template>
      
      <el-table :data="withdrawalRecords" style="width: 100%">
        <el-table-column prop="created_at" label="申请时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="提现金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="payment_method" label="提现方式" width="120">
          <template #default="scope">
            {{ getPaymentMethodName(scope.row.payment_method) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="processed_at" label="处理时间" width="180">
          <template #default="scope">
            {{ scope.row.processed_at ? formatDate(scope.row.processed_at) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="reject_reason" label="备注">
          <template #default="scope">
            {{ scope.row.reject_reason || '-' }}
          </template>
        </el-table-column>
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

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/date'
import { getWithdrawalRecords, createWithdrawal } from '@/api/withdrawal'

const userStore = useUserStore()
const distributorInfo = ref({
  balance: 0
})

// 提现表单
const withdrawalForm = ref({
  amount: 100,
  payment_method: 'wechat',
  alipay_account: '',
  alipay_name: ''
})

// 表单验证规则
const rules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    { type: 'number', min: 10, max: 20000, message: '提现金额必须在10-20000元之间', trigger: 'blur' }
  ],
  payment_method: [
    { required: true, message: '请选择提现方式', trigger: 'change' }
  ],
  alipay_account: [
    { required: true, message: '请输入支付宝账号', trigger: 'blur' }
  ],
  alipay_name: [
    { required: true, message: '请输入支付宝姓名', trigger: 'blur' }
  ]
}

// 提现记录
const withdrawalRecords = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const submitting = ref(false)

// 获取分销商信息
const getDistributorInfo = async () => {
  try {
    const res = await userStore.getDistributorInfo()
    distributorInfo.value = res.data
  } catch (error) {
    ElMessage.error('获取分销商信息失败')
  }
}

// 获取提现记录
const getRecords = async () => {
  try {
    const res = await getWithdrawalRecords({
      page: currentPage.value,
      page_size: pageSize.value
    })
    withdrawalRecords.value = res.data.results
    total.value = res.data.count
  } catch (error) {
    ElMessage.error('获取提现记录失败')
  }
}

// 提交提现申请
const submitWithdrawal = async () => {
  submitting.value = true
  try {
    await createWithdrawal(withdrawalForm.value)
    ElMessage.success('提现申请已提交')
    // 刷新分销商信息和提现记录
    await getDistributorInfo()
    await getRecords()
  } catch (error) {
    ElMessage.error(error.message || '提现申请失败')
  } finally {
    submitting.value = false
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getRecords()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getRecords()
}

// 工具函数
const getPaymentMethodName = (method) => {
  const methods = {
    wechat: '微信钱包',
    alipay: '支付宝'
  }
  return methods[method] || method
}

const getStatusName = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    success: '提现成功',
    failed: '提现失败'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    processing: 'info',
    success: 'success',
    failed: 'danger'
  }
  return typeMap[status] || 'info'
}

onMounted(() => {
  getDistributorInfo()
  getRecords()
})
</script>

<style scoped>
.withdrawal-container {
  padding: 20px;
}

.withdrawal-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-info {
  margin-top: 5px;
  color: #666;
  font-size: 14px;
}

.withdrawal-records {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 