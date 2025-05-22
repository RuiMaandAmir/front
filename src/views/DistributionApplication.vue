<template>
  <div class="application-page">
    <el-card class="application-form">
      <template #header>
        <div class="card-header">
          <span>申请成为分销商</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="身份证号" prop="id_card">
          <el-input v-model="form.id_card" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitApplication" :loading="loading">
            提交申请
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 申请记录 -->
    <el-card class="application-history" v-if="application">
      <template #header>
        <div class="card-header">
          <span>申请记录</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="申请状态">
          <el-tag :type="getStatusType(application.status)">
            {{ getStatusText(application.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">
          {{ application.created_at }}
        </el-descriptions-item>
        <el-descriptions-item label="审核时间" v-if="application.updated_at">
          {{ application.updated_at }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" v-if="application.remark">
          {{ application.remark }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()
const loading = ref(false)
const application = ref<any>(null)

const formRef = ref<FormInstance>()
const form = ref({
  name: '',
  phone: '',
  id_card: '',
  remark: ''
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  id_card: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ]
}

// 获取申请记录
const loadApplication = async () => {
  try {
    loading.value = true
    const response = await productStore.getDistributionApplication()
    application.value = response
  } catch (error) {
    ElMessage.error('获取申请记录失败')
  } finally {
    loading.value = false
  }
}

// 提交申请
const submitApplication = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await productStore.createDistributionApplication(form.value)
        ElMessage.success('申请已提交')
        loadApplication()
      } catch (error) {
        ElMessage.error('申请提交失败')
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
    rejected: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

onMounted(() => {
  loadApplication()
})
</script>

<style scoped>
.application-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.application-form {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.application-history {
  margin-top: 20px;
}
</style> 