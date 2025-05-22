<template>
  <div class="customer-service-container" :class="{ 'is-mobile': isMobileDevice }">
    <!-- 移动端头部 -->
    <div v-if="isMobileDevice" class="mobile-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="header-title">客服中心</div>
    </div>

    <!-- 客服卡片 -->
    <div class="service-card">
      <div class="service-header">
        <el-avatar :size="60" :src="serviceInfo.avatar" />
        <div class="service-info">
          <h3 class="service-name">{{ serviceInfo.name }}</h3>
          <p class="service-status">
            <el-tag size="small" type="success">在线</el-tag>
            <span class="status-text">工作时间：{{ serviceInfo.workTime }}</span>
          </p>
        </div>
      </div>
      <div class="service-actions">
        <el-button type="primary" @click="handleStartChat">
          <el-icon><ChatDotRound /></el-icon>
          在线咨询
        </el-button>
        <el-button @click="handleCall">
          <el-icon><Phone /></el-icon>
          电话咨询
        </el-button>
      </div>
    </div>

    <!-- 常见问题 -->
    <div class="faq-section">
      <h3 class="section-title">常见问题</h3>
      <el-collapse v-model="activeFaqs">
        <el-collapse-item
          v-for="faq in faqList"
          :key="faq.id"
          :title="faq.question"
          :name="faq.id"
        >
          <div class="faq-answer">{{ faq.answer }}</div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 联系方式 -->
    <div class="contact-section">
      <h3 class="section-title">联系方式</h3>
      <div class="contact-list">
        <div class="contact-item">
          <el-icon><Phone /></el-icon>
          <span>客服电话：{{ serviceInfo.phone }}</span>
        </div>
        <div class="contact-item">
          <el-icon><Message /></el-icon>
          <span>客服邮箱：{{ serviceInfo.email }}</span>
        </div>
        <div class="contact-item">
          <el-icon><Location /></el-icon>
          <span>公司地址：{{ serviceInfo.address }}</span>
        </div>
      </div>
    </div>

    <!-- 在线客服弹窗 -->
    <el-dialog
      v-model="showChatDialog"
      title="在线客服"
      width="400px"
      :class="{ 'mobile-dialog': isMobileDevice }"
    >
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessagesRef">
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            class="message-item"
            :class="{ 'message-self': message.isSelf }"
          >
            <el-avatar
              :size="32"
              :src="message.isSelf ? userInfo.avatar : serviceInfo.avatar"
            />
            <div class="message-content">
              {{ message.content }}
            </div>
          </div>
        </div>
        <div class="chat-input">
          <el-input
            v-model="messageInput"
            placeholder="请输入消息"
            @keyup.enter="handleSendMessage"
          >
            <template #append>
              <el-button @click="handleSendMessage">发送</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  ChatDotRound,
  Phone,
  Message,
  Location
} from '@element-plus/icons-vue'
import { isMobile, onResize, offResize } from '@/utils/responsive'

interface ServiceInfo {
  name: string
  avatar: string
  workTime: string
  phone: string
  email: string
  address: string
}

interface UserInfo {
  avatar: string
}

interface Faq {
  id: number
  question: string
  answer: string
}

interface ChatMessage {
  content: string
  isSelf: boolean
  timestamp: number
}

const router = useRouter()

// 响应式状态
const isMobileDevice = ref(isMobile())
const showChatDialog = ref(false)
const activeFaqs = ref<number[]>([])
const messageInput = ref('')
const chatMessages = ref<ChatMessage[]>([])
const chatMessagesRef = ref<HTMLElement>()

// 客服信息
const serviceInfo = ref<ServiceInfo>({
  name: '客服小美',
  avatar: '/images/service-avatar.png',
  workTime: '周一至周日 9:00-18:00',
  phone: '400-123-4567',
  email: 'service@example.com',
  address: '北京市朝阳区xxx大厦'
})

// 用户信息
const userInfo = ref<UserInfo>({
  avatar: '/images/user-avatar.png'
})

// 常见问题列表
const faqList = ref<Faq[]>([
  {
    id: 1,
    question: '如何修改收货地址？',
    answer: '您可以在"我的-收货地址"中修改或添加新的收货地址。'
  },
  {
    id: 2,
    question: '订单发货后多久能收到？',
    answer: '一般情况下，订单发货后3-5天可以收到商品。具体时间以物流信息为准。'
  },
  {
    id: 3,
    question: '如何申请退款？',
    answer: '您可以在订单详情页面点击"申请退款"，填写退款原因后提交申请。'
  }
])

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = isMobile()
}

// 处理开始聊天
const handleStartChat = () => {
  showChatDialog.value = true
  // 添加欢迎消息
  chatMessages.value.push({
    content: '您好，我是客服小美，很高兴为您服务！',
    isSelf: false,
    timestamp: Date.now()
  })
}

// 处理发送消息
const handleSendMessage = async () => {
  if (!messageInput.value.trim()) return

  // 添加用户消息
  chatMessages.value.push({
    content: messageInput.value,
    isSelf: true,
    timestamp: Date.now()
  })

  // 清空输入框
  messageInput.value = ''

  // 滚动到底部
  await nextTick()
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }

  // 模拟客服回复
  setTimeout(() => {
    chatMessages.value.push({
      content: '感谢您的咨询，我们会尽快处理您的问题。',
      isSelf: false,
      timestamp: Date.now()
    })
    // 滚动到底部
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  }, 1000)
}

// 处理电话咨询
const handleCall = () => {
  ElMessage.success(`正在拨打客服电话：${serviceInfo.value.phone}`)
}

onMounted(() => {
  onResize(handleResize)
})

onUnmounted(() => {
  offResize(handleResize)
})
</script>

<style scoped>
.customer-service-container {
  padding: 20px;
  padding-bottom: 40px;
}

.service-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.service-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.service-info {
  flex: 1;
}

.service-name {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 500;
}

.service-status {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.service-actions {
  display: flex;
  gap: 12px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 500;
}

.faq-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.faq-answer {
  color: #606266;
  line-height: 1.6;
}

.contact-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

/* 聊天相关样式 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 8px;
  max-width: 80%;
}

.message-self {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message-content {
  background: #f4f4f5;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.4;
}

.message-self .message-content {
  background: #ecf5ff;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #ebeef5;
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
  padding: 0;
}

.mobile-dialog .chat-container {
  height: 60vh;
}

.mobile-dialog .chat-input {
  padding: 12px;
}

.mobile-dialog .el-input__wrapper {
  font-size: 14px;
}
</style> 