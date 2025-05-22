<template>
  <div class="help-center-container" :class="{ 'is-mobile': isMobileDevice }">
    <!-- 移动端头部 -->
    <div v-if="isMobileDevice" class="mobile-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="header-title">帮助中心</div>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索问题"
        :prefix-icon="Search"
        clearable
        @input="handleSearch"
      />
    </div>

    <!-- 帮助分类 -->
    <div class="help-categories">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-item"
        @click="handleCategoryClick(category)"
      >
        <el-icon :size="24" class="category-icon">
          <component :is="category.icon" />
        </el-icon>
        <span class="category-name">{{ category.name }}</span>
      </div>
    </div>

    <!-- 热门问题 -->
    <div class="hot-questions">
      <h3 class="section-title">热门问题</h3>
      <el-collapse v-model="activeQuestions">
        <el-collapse-item
          v-for="question in filteredQuestions"
          :key="question.id"
          :title="question.title"
          :name="question.id"
        >
          <div class="question-content">
            <div class="answer">{{ question.answer }}</div>
            <div class="helpful">
              <span>此回答是否对您有帮助？</span>
              <div class="helpful-actions">
                <el-button
                  text
                  :type="question.isHelpful ? 'primary' : 'default'"
                  @click="handleHelpful(question, true)"
                >
                  <el-icon><StarFilled /></el-icon>
                  有帮助
                </el-button>
                <el-button
                  text
                  :type="question.isNotHelpful ? 'primary' : 'default'"
                  @click="handleHelpful(question, false)"
                >
                  <el-icon><Star /></el-icon>
                  没帮助
                </el-button>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 联系客服 -->
    <div class="contact-section">
      <p class="contact-text">没有找到您需要的答案？</p>
      <el-button type="primary" @click="handleContactService">
        联系客服
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  CreditCard,
  Van,
  Goods,
  Service,
  Star,
  StarFilled
} from '@element-plus/icons-vue'

interface Category {
  id: number
  name: string
  icon: string
}

interface Question {
  id: number
  title: string
  answer: string
  category: number
  isHelpful?: boolean
  isNotHelpful?: boolean
}

const router = useRouter()

// 响应式状态
const isMobileDevice = ref(false)
const searchQuery = ref('')
const activeQuestions = ref<number[]>([])

// 帮助分类
const categories = ref<Category[]>([
  { id: 1, name: '购物指南', icon: 'ShoppingBag' },
  { id: 2, name: '支付问题', icon: 'CreditCard' },
  { id: 3, name: '配送说明', icon: 'Van' },
  { id: 4, name: '商品相关', icon: 'Goods' },
  { id: 5, name: '售后服务', icon: 'Service' }
])

// 问题列表
const questions = ref<Question[]>([
  {
    id: 1,
    title: '如何修改收货地址？',
    answer: '您可以在"我的-收货地址"中修改或添加新的收货地址。在提交订单时，也可以选择或修改收货地址。',
    category: 1
  },
  {
    id: 2,
    title: '支持哪些支付方式？',
    answer: '我们支持支付宝、微信支付、银联等多种支付方式。您可以在提交订单时选择您偏好的支付方式。',
    category: 2
  },
  {
    id: 3,
    title: '订单发货后多久能收到？',
    answer: '一般情况下，订单发货后3-5天可以收到商品。具体时间以物流信息为准。',
    category: 3
  },
  {
    id: 4,
    title: '如何申请退款？',
    answer: '您可以在订单详情页面点击"申请退款"，填写退款原因后提交申请。我们会在1-3个工作日内处理您的退款申请。',
    category: 5
  }
])

// 根据搜索关键词过滤问题
const filteredQuestions = computed(() => {
  if (!searchQuery.value) return questions.value
  const query = searchQuery.value.toLowerCase()
  return questions.value.filter(q => 
    q.title.toLowerCase().includes(query) || 
    q.answer.toLowerCase().includes(query)
  )
})

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = window.innerWidth <= 768
}

// 处理搜索
const handleSearch = () => {
  // 可以在这里添加搜索逻辑
}

// 处理分类点击
const handleCategoryClick = (category: Category) => {
  const categoryQuestions = questions.value.filter(q => q.category === category.id)
  if (categoryQuestions.length > 0) {
    activeQuestions.value = [categoryQuestions[0].id]
  }
}

// 处理有帮助/没帮助
const handleHelpful = (question: Question, isHelpful: boolean) => {
  if (isHelpful) {
    question.isHelpful = !question.isHelpful
    question.isNotHelpful = false
  } else {
    question.isNotHelpful = !question.isNotHelpful
    question.isHelpful = false
  }
  ElMessage.success('感谢您的反馈！')
}

// 处理联系客服
const handleContactService = () => {
  router.push('/customer-service')
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.help-center-container {
  padding: 20px;
  padding-bottom: 40px;
}

.search-section {
  margin-bottom: 24px;
}

.help-categories {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.category-icon {
  color: #409eff;
}

.category-name {
  font-size: 14px;
  color: #303133;
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 500;
}

.hot-questions {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.question-content {
  color: #606266;
  line-height: 1.6;
}

.helpful {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.helpful-actions {
  display: flex;
  gap: 16px;
}

.contact-section {
  text-align: center;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.contact-text {
  margin: 0 0 16px;
  color: #606266;
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

.is-mobile .help-categories {
  grid-template-columns: repeat(3, 1fr);
  padding: 0 12px;
}

.is-mobile .category-item {
  padding: 12px;
}

.is-mobile .hot-questions {
  margin: 0 12px 24px;
}

.is-mobile .contact-section {
  margin: 0 12px;
}

.is-mobile .helpful {
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.is-mobile .helpful-actions {
  width: 100%;
  justify-content: space-between;
}
</style> 