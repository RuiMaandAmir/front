<template>
  <div class="settings-page">
    <div class="page-header">
      <h2>分销设置</h2>
    </div>

    <!-- 分销规则设置 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <span>分销规则设置</span>
        </div>
      </template>
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="ruleRules"
        label-width="120px"
      >
        <el-form-item label="分销等级" prop="level">
          <el-select v-model="ruleForm.level" placeholder="请选择分销等级">
            <el-option label="一级分销" value="1" />
            <el-option label="二级分销" value="2" />
            <el-option label="三级分销" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="佣金比例" prop="commission_rate">
          <el-input-number
            v-model="ruleForm.commission_rate"
            :min="0"
            :max="100"
            :precision="2"
            :step="0.1"
          />
          <span class="unit">%</span>
        </el-form-item>

        <el-form-item label="团队奖励比例" prop="team_rate">
          <el-input-number
            v-model="ruleForm.team_rate"
            :min="0"
            :max="100"
            :precision="2"
            :step="0.1"
          />
          <span class="unit">%</span>
        </el-form-item>

        <el-form-item label="升级条件" prop="upgrade_condition">
          <el-input
            v-model="ruleForm.upgrade_condition"
            type="textarea"
            :rows="3"
            placeholder="请输入升级条件"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSaveRules">
            保存设置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提现设置 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <span>提现设置</span>
        </div>
      </template>
      <el-form
        ref="withdrawFormRef"
        :model="withdrawForm"
        :rules="withdrawRules"
        label-width="120px"
      >
        <el-form-item label="最低提现金额" prop="min_amount">
          <el-input-number
            v-model="withdrawForm.min_amount"
            :min="0"
            :precision="2"
            :step="10"
          />
          <span class="unit">元</span>
        </el-form-item>

        <el-form-item label="提现手续费率" prop="fee_rate">
          <el-input-number
            v-model="withdrawForm.fee_rate"
            :min="0"
            :max="100"
            :precision="2"
            :step="0.1"
          />
          <span class="unit">%</span>
        </el-form-item>

        <el-form-item label="结算周期" prop="settlement_cycle">
          <el-select v-model="withdrawForm.settlement_cycle" placeholder="请选择结算周期">
            <el-option label="T+1" value="T+1" />
            <el-option label="T+3" value="T+3" />
            <el-option label="T+7" value="T+7" />
          </el-select>
        </el-form-item>

        <el-form-item label="提现方式" prop="withdraw_methods">
          <el-checkbox-group v-model="withdrawForm.withdraw_methods">
            <el-checkbox label="alipay">支付宝</el-checkbox>
            <el-checkbox label="wechat">微信</el-checkbox>
            <el-checkbox label="bank">银行卡</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSaveWithdraw">
            保存设置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 其他设置 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <span>其他设置</span>
        </div>
      </template>
      <el-form
        ref="otherFormRef"
        :model="otherForm"
        :rules="otherRules"
        label-width="120px"
      >
        <el-form-item label="分销海报" prop="poster">
          <el-upload
            class="poster-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handlePosterSuccess"
            :before-upload="beforePosterUpload"
          >
            <img v-if="otherForm.poster" :src="otherForm.poster" class="poster" />
            <el-icon v-else class="poster-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸：750x1334px，支持jpg、png格式</div>
        </el-form-item>

        <el-form-item label="分销说明" prop="description">
          <el-input
            v-model="otherForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分销说明"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSaveOther">
            保存设置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProductStore } from '@/stores/product'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, UploadProps } from 'element-plus'

const productStore = useProductStore()

// 分销规则表单
const ruleFormRef = ref<FormInstance>()
const ruleForm = ref({
  level: '1',
  commission_rate: 10,
  team_rate: 5,
  upgrade_condition: ''
})

const ruleRules = {
  level: [{ required: true, message: '请选择分销等级', trigger: 'change' }],
  commission_rate: [{ required: true, message: '请输入佣金比例', trigger: 'blur' }],
  team_rate: [{ required: true, message: '请输入团队奖励比例', trigger: 'blur' }],
  upgrade_condition: [{ required: true, message: '请输入升级条件', trigger: 'blur' }]
}

// 提现设置表单
const withdrawFormRef = ref<FormInstance>()
const withdrawForm = ref({
  min_amount: 100,
  fee_rate: 0.6,
  settlement_cycle: 'T+1',
  withdraw_methods: ['alipay', 'wechat']
})

const withdrawRules = {
  min_amount: [{ required: true, message: '请输入最低提现金额', trigger: 'blur' }],
  fee_rate: [{ required: true, message: '请输入提现手续费率', trigger: 'blur' }],
  settlement_cycle: [{ required: true, message: '请选择结算周期', trigger: 'change' }],
  withdraw_methods: [{ required: true, message: '请选择提现方式', trigger: 'change' }]
}

// 其他设置表单
const otherFormRef = ref<FormInstance>()
const otherForm = ref({
  poster: '',
  description: ''
})

const otherRules = {
  description: [{ required: true, message: '请输入分销说明', trigger: 'blur' }]
}

// 上传相关
const uploadUrl = '/api/upload'
const beforePosterUpload: UploadProps['beforeUpload'] = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('上传海报图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传海报图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handlePosterSuccess: UploadProps['onSuccess'] = (response) => {
  otherForm.value.poster = response.url
}

// 保存分销规则
const handleSaveRules = async () => {
  if (!ruleFormRef.value) return
  await ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await productStore.updateDistributionRule(ruleForm.value)
        ElMessage.success('保存成功')
      } catch (error) {
        console.error('保存分销规则失败:', error)
        ElMessage.error('保存失败，请重试')
      }
    }
  })
}

// 保存提现设置
const handleSaveWithdraw = async () => {
  if (!withdrawFormRef.value) return
  await withdrawFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await productStore.updateWithdrawSettings(withdrawForm.value)
        ElMessage.success('保存成功')
      } catch (error) {
        console.error('保存提现设置失败:', error)
        ElMessage.error('保存失败，请重试')
      }
    }
  })
}

// 保存其他设置
const handleSaveOther = async () => {
  if (!otherFormRef.value) return
  await otherFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await productStore.updateOtherSettings(otherForm.value)
        ElMessage.success('保存成功')
      } catch (error) {
        console.error('保存其他设置失败:', error)
        ElMessage.error('保存失败，请重试')
      }
    }
  })
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unit {
  margin-left: 10px;
  color: #909399;
}

.poster-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.poster-uploader:hover {
  border-color: #409EFF;
}

.poster-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.poster {
  width: 178px;
  height: 178px;
  display: block;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .el-form-item {
    margin-bottom: 20px;
  }
}
</style> 