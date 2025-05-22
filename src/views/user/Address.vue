<template>
  <div class="address-container" :class="{ 'is-mobile': isMobileDevice }">
    <!-- 移动端头部 -->
    <div v-if="isMobileDevice" class="mobile-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="header-title">收货地址</div>
      <div class="header-right">
        <el-button text @click="handleAdd">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 地址列表 -->
    <div class="address-list">
      <el-empty
        v-if="addresses.length === 0"
        description="暂无收货地址"
      >
        <el-button type="primary" @click="handleAdd">
          添加地址
        </el-button>
      </el-empty>
      <template v-else>
        <div
          v-for="address in addresses"
          :key="address.id"
          class="address-item"
          :class="{ 'mobile-item': isMobileDevice }"
        >
          <div class="address-content" @click="handleEdit(address)">
            <div class="address-header">
              <div class="contact">
                <span class="name">{{ address.name }}</span>
                <span class="phone">{{ address.phone }}</span>
                <el-tag
                  v-if="address.is_default"
                  size="small"
                  type="success"
                >
                  默认
                </el-tag>
              </div>
            </div>
            <div class="address-detail">
              {{ address.full_address }}
            </div>
          </div>
          <div class="address-actions">
            <el-button
              v-if="!address.is_default"
              text
              type="primary"
              @click="handleSetDefault(address)"
            >
              设为默认
            </el-button>
            <el-button
              text
              type="danger"
              @click="handleDelete(address)"
            >
              删除
            </el-button>
          </div>
        </div>
      </template>
    </div>

    <!-- 底部操作栏 -->
    <div
      v-if="!isMobileDevice && addresses.length > 0"
      class="bottom-bar"
    >
      <el-button type="primary" @click="handleAdd">
        添加新地址
      </el-button>
    </div>

    <!-- 地址编辑弹窗 -->
    <el-dialog
      v-model="showDialog"
      :title="editingAddress ? '编辑地址' : '新增地址'"
      width="500px"
      :class="{ 'mobile-dialog': isMobileDevice }"
    >
      <el-form
        ref="formRef"
        :model="addressForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="addressForm.region"
            :options="regionOptions"
            placeholder="请选择所在地区"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="addressForm.detail"
            type="textarea"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="addressForm.is_default">
            设为默认收货地址
          </el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSave">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { isMobile, onResize, offResize } from '@/utils/responsive'
import type { FormInstance } from 'element-plus'

interface Address {
  id: number
  name: string
  phone: string
  region: string[]
  detail: string
  full_address: string
  is_default: boolean
}

const router = useRouter()

// 响应式状态
const isMobileDevice = ref(isMobile())
const addresses = ref<Address[]>([])
const showDialog = ref(false)
const editingAddress = ref<Address | null>(null)
const formRef = ref<FormInstance>()

// 表单数据
const addressForm = ref({
  name: '',
  phone: '',
  region: [] as string[],
  detail: '',
  is_default: false
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'change' }
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ]
}

// 地区选项（示例数据）
const regionOptions = [
  {
    value: 'beijing',
    label: '北京市',
    children: [
      {
        value: 'chaoyang',
        label: '朝阳区'
      }
    ]
  }
]

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = isMobile()
}

// 处理添加地址
const handleAdd = () => {
  editingAddress.value = null
  addressForm.value = {
    name: '',
    phone: '',
    region: [],
    detail: '',
    is_default: false
  }
  showDialog.value = true
}

// 处理编辑地址
const handleEdit = (address: Address) => {
  editingAddress.value = address
  addressForm.value = {
    name: address.name,
    phone: address.phone,
    region: address.region,
    detail: address.detail,
    is_default: address.is_default
  }
  showDialog.value = true
}

// 处理保存地址
const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const fullAddress = `${addressForm.value.region.join(' ')} ${addressForm.value.detail}`
        const addressData = {
          ...addressForm.value,
          full_address: fullAddress
        }

        if (editingAddress.value) {
          // TODO: 实现更新地址逻辑
          // await api.updateAddress(editingAddress.value.id, addressData)
          const index = addresses.value.findIndex(a => a.id === editingAddress.value?.id)
          if (index !== -1) {
            addresses.value[index] = {
              ...addresses.value[index],
              ...addressData
            }
          }
        } else {
          // TODO: 实现添加地址逻辑
          // const response = await api.addAddress(addressData)
          // addresses.value.push(response.data)
        }

        showDialog.value = false
        ElMessage.success(editingAddress.value ? '地址更新成功' : '地址添加成功')
      } catch (error) {
        console.error('保存地址失败:', error)
        ElMessage.error('保存地址失败')
      }
    }
  })
}

// 处理设置默认地址
const handleSetDefault = async (address: Address) => {
  try {
    // TODO: 实现设置默认地址逻辑
    // await api.setDefaultAddress(address.id)
    addresses.value.forEach(a => {
      a.is_default = a.id === address.id
    })
    ElMessage.success('设置默认地址成功')
  } catch (error) {
    console.error('设置默认地址失败:', error)
    ElMessage.error('设置默认地址失败')
  }
}

// 处理删除地址
const handleDelete = (address: Address) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // TODO: 实现删除地址逻辑
      // await api.deleteAddress(address.id)
      addresses.value = addresses.value.filter(a => a.id !== address.id)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 获取地址列表
const fetchAddresses = async () => {
  try {
    // TODO: 实现地址列表获取逻辑
    // const response = await api.getAddresses()
    // addresses.value = response.data
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
  }
}

onMounted(() => {
  fetchAddresses()
  onResize(handleResize)
})

onUnmounted(() => {
  offResize(handleResize)
})
</script>

<style scoped>
.address-container {
  padding: 20px;
  padding-bottom: 80px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-item {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.address-content {
  padding: 16px;
  cursor: pointer;
}

.address-header {
  margin-bottom: 8px;
}

.contact {
  display: flex;
  align-items: center;
  gap: 12px;
}

.name {
  font-size: 16px;
  font-weight: 500;
}

.phone {
  color: #606266;
}

.address-detail {
  color: #606266;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 20px;
  display: flex;
  justify-content: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

/* 移动端样式 */
.is-mobile {
  padding: 0;
  padding-bottom: 60px;
}

.mobile-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.header-left,
.header-right {
  flex: 1;
}

.header-title {
  flex: 2;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.mobile-item {
  margin: 0 12px;
  border-radius: 4px;
}

.mobile-item .address-content {
  padding: 12px;
}

.mobile-item .name {
  font-size: 15px;
}

.mobile-item .address-detail {
  font-size: 13px;
}

.mobile-item .address-actions {
  padding: 8px 12px;
}

.mobile-dialog :deep(.el-dialog__body) {
  padding: 16px;
}

.mobile-dialog :deep(.el-form-item__label) {
  font-size: 14px;
}

.mobile-dialog :deep(.el-input__wrapper) {
  font-size: 14px;
}

.mobile-dialog :deep(.el-checkbox__label) {
  font-size: 14px;
}
</style> 