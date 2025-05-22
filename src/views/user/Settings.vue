<template>
    <div class="settings-container" :class="{ 'is-mobile': isMobileDevice }">
      <!-- 移动端头部 -->
      <div v-if="isMobileDevice" class="mobile-header">
        <div class="header-left">
          <el-button text @click="router.back()">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </div>
        <div class="header-title">账户设置</div>
      </div>
  
      <!-- 设置列表 -->
      <div class="settings-list">
        <!-- 基本信息 -->
        <div class="settings-group">
          <div class="group-title">基本信息</div>
          <div class="group-content">
            <div class="setting-item" @click="handleEditAvatar">
              <span class="item-label">头像</span>
              <div class="item-value">
                <el-avatar :size="40" :src="userInfo.avatar" />
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
            <div class="setting-item" @click="handleEditNickname">
              <span class="item-label">昵称</span>
              <div class="item-value">
                <span>{{ userInfo.nickname }}</span>
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
            <div class="setting-item" @click="handleEditPhone">
              <span class="item-label">手机号</span>
              <div class="item-value">
                <span>{{ formatPhone(userInfo.phone) }}</span>
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 安全设置 -->
        <div class="settings-group">
          <div class="group-title">安全设置</div>
          <div class="group-content">
            <div class="setting-item" @click="handleChangePassword">
              <span class="item-label">修改密码</span>
              <div class="item-value">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
            <div class="setting-item" @click="handleBindEmail">
              <span class="item-label">绑定邮箱</span>
              <div class="item-value">
                <span>{{ userInfo.email || '未绑定' }}</span>
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 其他设置 -->
        <div class="settings-group">
          <div class="group-title">其他设置</div>
          <div class="group-content">
            <div class="setting-item">
              <span class="item-label">消息通知</span>
              <div class="item-value">
                <el-switch v-model="settings.notification" />
              </div>
            </div>
            <div class="setting-item">
              <span class="item-label">隐私设置</span>
              <div class="item-value">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 退出登录 -->
        <div class="logout-button" @click="handleLogout">
          退出登录
        </div>
      </div>
  
      <!-- 编辑弹窗 -->
      <el-dialog
        v-model="showDialog"
        :title="dialogTitle"
        width="400px"
        :class="{ 'mobile-dialog': isMobileDevice }"
      >
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="80px"
        >
          <el-form-item
            v-if="dialogType === 'nickname'"
            label="昵称"
            prop="nickname"
          >
            <el-input v-model="formData.nickname" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item
            v-if="dialogType === 'phone'"
            label="手机号"
            prop="phone"
          >
            <el-input v-model="formData.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item
            v-if="dialogType === 'email'"
            label="邮箱"
            prop="email"
          >
            <el-input v-model="formData.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item
            v-if="dialogType === 'password'"
            label="原密码"
            prop="oldPassword"
          >
            <el-input
              v-model="formData.oldPassword"
              type="password"
              placeholder="请输入原密码"
              show-password
            />
          </el-form-item>
          <el-form-item
            v-if="dialogType === 'password'"
            label="新密码"
            prop="newPassword"
          >
            <el-input
              v-model="formData.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
            />
          </el-form-item>
          <el-form-item
            v-if="dialogType === 'password'"
            label="确认密码"
            prop="confirmPassword"
          >
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            />
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
  import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
  import { isMobile, onResize, offResize } from '@/utils/responsive'
  import type { FormInstance } from 'element-plus'
  
  interface UserInfo {
    id: number
    username: string
    nickname: string
    avatar: string
    phone: string
    email: string
  }
  
  interface Settings {
    notification: boolean
  }
  
  const router = useRouter()
  
  // 响应式状态
  const isMobileDevice = ref(isMobile())
  const userInfo = ref<UserInfo>({
    id: 0,
    username: '',
    nickname: '',
    avatar: '',
    phone: '',
    email: ''
  })
  const settings = ref<Settings>({
    notification: true
  })
  
  // 弹窗相关
  const showDialog = ref(false)
  const dialogType = ref<'nickname' | 'phone' | 'email' | 'password'>('nickname')
  const dialogTitle = ref('')
  const formRef = ref<FormInstance>()
  const formData = ref({
    nickname: '',
    phone: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // 表单验证规则
  const formRules = {
    nickname: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    oldPassword: [
      { required: true, message: '请输入原密码', trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能小于 6 个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: Function) => {
          if (value !== formData.value.newPassword) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }
  
  // 监听窗口大小变化
  const handleResize = () => {
    isMobileDevice.value = isMobile()
  }
  
  // 格式化手机号
  const formatPhone = (phone: string) => {
    if (!phone) return '未绑定'
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
  
  // 处理编辑头像
  const handleEditAvatar = () => {
    // TODO: 实现头像上传逻辑
  }
  
  // 处理编辑昵称
  const handleEditNickname = () => {
    dialogType.value = 'nickname'
    dialogTitle.value = '修改昵称'
    formData.value.nickname = userInfo.value.nickname
    showDialog.value = true
  }
  
  // 处理编辑手机号
  const handleEditPhone = () => {
    dialogType.value = 'phone'
    dialogTitle.value = '修改手机号'
    formData.value.phone = userInfo.value.phone
    showDialog.value = true
  }
  
  // 处理修改密码
  const handleChangePassword = () => {
    dialogType.value = 'password'
    dialogTitle.value = '修改密码'
    formData.value = {
      nickname: '',
      phone: '',
      email: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    showDialog.value = true
  }
  
  // 处理绑定邮箱
  const handleBindEmail = () => {
    dialogType.value = 'email'
    dialogTitle.value = '绑定邮箱'
    formData.value.email = userInfo.value.email
    showDialog.value = true
  }
  
  // 处理保存
  const handleSave = async () => {
    if (!formRef.value) return
  
    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          switch (dialogType.value) {
            case 'nickname':
              // TODO: 实现修改昵称逻辑
              userInfo.value.nickname = formData.value.nickname
              break
            case 'phone':
              // TODO: 实现修改手机号逻辑
              userInfo.value.phone = formData.value.phone
              break
            case 'email':
              // TODO: 实现绑定邮箱逻辑
              userInfo.value.email = formData.value.email
              break
            case 'password':
              // TODO: 实现修改密码逻辑
              break
          }
          showDialog.value = false
          ElMessage.success('保存成功')
        } catch (error) {
          console.error('保存失败:', error)
          ElMessage.error('保存失败')
        }
      }
    })
  }
  
  // 处理退出登录
  const handleLogout = () => {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        // TODO: 实现退出登录逻辑
        // await api.logout()
        router.push('/login')
        ElMessage.success('退出成功')
      } catch (error) {
        console.error('退出失败:', error)
        ElMessage.error('退出失败')
      }
    })
  }
  
  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      // TODO: 实现获取用户信息逻辑
      // const response = await api.getUserInfo()
      // userInfo.value = response.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      ElMessage.error('获取用户信息失败')
    }
  }
  
  onMounted(() => {
    fetchUserInfo()
    onResize(handleResize)
  })
  
  onUnmounted(() => {
    offResize(handleResize)
  })
  </script>
  
  <style scoped>
  .settings-container {
    padding: 20px;
    padding-bottom: 40px;
  }
  
  .settings-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .settings-group {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  .group-title {
    padding: 12px 16px;
    font-size: 14px;
    color: #909399;
    background: #f5f7fa;
  }
  
  .group-content {
    display: flex;
    flex-direction: column;
  }
  
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .setting-item:hover {
    background-color: #f5f7fa;
  }
  
  .item-label {
    font-size: 14px;
    color: #303133;
  }
  
  .item-value {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #909399;
    font-size: 14px;
  }
  
  .logout-button {
    margin-top: 20px;
    padding: 12px;
    text-align: center;
    background: #fff;
    border-radius: 8px;
    color: #f56c6c;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
  }
  
  .logout-button:hover {
    background-color: #fef0f0;
  }
  
  /* 移动端样式 */
  .is-mobile {
    padding: 0;
  }
  
  .mobile-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #ebeef5;
  }
  
  .header-left {
    flex: 1;
  }
  
  .header-title {
    flex: 2;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
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
  </style>