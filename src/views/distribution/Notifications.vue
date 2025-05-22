<template>
  <div class="distribution-notifications">
    <!-- 通知列表 -->
    <div class="notification-list">
      <div class="section-header">
        <h3>系统通知</h3>
        <div class="header-actions">
          <el-button type="primary" @click="markAllRead" :disabled="!hasUnread">
            全部标为已读
          </el-button>
          <el-button @click="clearAll" :disabled="!notifications.length">
            清空通知
          </el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all">
          <div class="notification-count">
            共 {{ total }} 条通知
          </div>
        </el-tab-pane>
        <el-tab-pane label="未读" name="unread">
          <div class="notification-count">
            未读 {{ unreadCount }} 条通知
          </div>
        </el-tab-pane>
        <el-tab-pane label="已读" name="read">
          <div class="notification-count">
            已读 {{ readCount }} 条通知
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="notification-items">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.is_read }"
          @click="showDetail(notification)"
        >
          <div class="notification-icon">
            <el-icon :size="24" :class="getIconClass(notification.type)">
              <component :is="getIcon(notification.type)" />
            </el-icon>
          </div>
          <div class="notification-content">
            <div class="notification-title">
              {{ notification.title }}
              <el-tag
                v-if="!notification.is_read"
                size="small"
                type="danger"
                class="unread-tag"
              >
                未读
              </el-tag>
            </div>
            <div class="notification-message">
              {{ notification.message }}
            </div>
            <div class="notification-time">
              {{ formatTime(notification.created_at) }}
            </div>
          </div>
          <div class="notification-actions">
            <el-button
              v-if="!notification.is_read"
              type="primary"
              link
              @click.stop="markAsRead(notification)"
            >
              标为已读
            </el-button>
            <el-button
              type="danger"
              link
              @click.stop="deleteNotification(notification)"
            >
              删除
            </el-button>
          </div>
        </div>

        <el-empty
          v-if="!notifications.length"
          description="暂无通知"
        />
      </div>

      <!-- 分页 -->
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
    </div>

    <!-- 通知详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="通知详情"
      width="600px"
    >
      <div v-if="currentNotification" class="notification-detail">
        <div class="detail-header">
          <h4>{{ currentNotification.title }}</h4>
          <div class="detail-meta">
            <span class="time">{{ formatTime(currentNotification.created_at) }}</span>
            <el-tag
              v-if="!currentNotification.is_read"
              size="small"
              type="danger"
            >
              未读
            </el-tag>
          </div>
        </div>
        
        <div class="detail-content">
          {{ currentNotification.message }}
        </div>

        <div v-if="currentNotification.data" class="detail-data">
          <h5>相关数据</h5>
          <el-descriptions :column="1" border>
            <el-descriptions-item
              v-for="(value, key) in currentNotification.data"
              :key="key"
              :label="formatDataKey(key)"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button
            v-if="currentNotification && !currentNotification.is_read"
            type="primary"
            @click="markAsRead(currentNotification)"
          >
            标为已读
          </el-button>
          <el-button
            v-if="currentNotification"
            type="danger"
            @click="deleteNotification(currentNotification)"
          >
            删除
          </el-button>
          <el-button @click="detailDialogVisible = false">
            关闭
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  Money,
  ShoppingCart,
  User,
  Star,
  Warning
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const productStore = useProductStore()

// 通知列表
const notifications = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const activeTab = ref('all')

// 对话框控制
const detailDialogVisible = ref(false)
const currentNotification = ref(null)

// 计算属性
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.is_read).length
})

const readCount = computed(() => {
  return notifications.value.filter(n => n.is_read).length
})

const hasUnread = computed(() => {
  return unreadCount.value > 0
})

// 获取通知列表
const getNotifications = async () => {
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      status: activeTab.value === 'all' ? '' : activeTab.value
    }
    const response = await productStore.getNotifications(params)
    notifications.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知列表失败，请重试')
  }
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getNotifications()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getNotifications()
}

// 处理标签页切换
const handleTabChange = () => {
  currentPage.value = 1
  getNotifications()
}

// 显示通知详情
const showDetail = (notification: any) => {
  currentNotification.value = notification
  detailDialogVisible.value = true
  
  // 如果未读，自动标记为已读
  if (!notification.is_read) {
    markAsRead(notification)
  }
}

// 标记为已读
const markAsRead = async (notification: any) => {
  try {
    await productStore.markNotificationRead(notification.id)
    notification.is_read = true
    ElMessage.success('已标记为已读')
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 全部标记为已读
const markAllRead = async () => {
  try {
    await productStore.markAllNotificationsRead()
    notifications.value.forEach(n => n.is_read = true)
    ElMessage.success('已全部标记为已读')
  } catch (error) {
    console.error('标记全部已读失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 删除通知
const deleteNotification = (notification: any) => {
  ElMessageBox.confirm(
    '确定要删除该通知吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await productStore.deleteNotification(notification.id)
      const index = notifications.value.findIndex(n => n.id === notification.id)
      if (index > -1) {
        notifications.value.splice(index, 1)
      }
      if (currentNotification.value?.id === notification.id) {
        detailDialogVisible.value = false
      }
      ElMessage.success('通知已删除')
    } catch (error) {
      console.error('删除通知失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  })
}

// 清空通知
const clearAll = () => {
  ElMessageBox.confirm(
    '确定要清空所有通知吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await productStore.clearAllNotifications()
      notifications.value = []
      total.value = 0
      ElMessage.success('通知已清空')
    } catch (error) {
      console.error('清空通知失败:', error)
      ElMessage.error('操作失败，请重试')
    }
  })
}

// 获取图标
const getIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    system: Bell,
    commission: Money,
    order: ShoppingCart,
    team: User,
    activity: Star,
    warning: Warning
  }
  return iconMap[type] || Bell
}

// 获取图标样式
const getIconClass = (type: string) => {
  const classMap: Record<string, string> = {
    system: 'system-icon',
    commission: 'commission-icon',
    order: 'order-icon',
    team: 'team-icon',
    activity: 'activity-icon',
    warning: 'warning-icon'
  }
  return classMap[type] || 'system-icon'
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}

// 格式化数据键名
const formatDataKey = (key: string) => {
  const keyMap: Record<string, string> = {
    order_no: '订单号',
    amount: '金额',
    commission: '佣金',
    team_member: '团队成员',
    activity_name: '活动名称'
  }
  return keyMap[key] || key
}

// 初始化
getNotifications()
</script>

<style scoped>
.distribution-notifications {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.notification-count {
  margin: 10px 0;
  color: #909399;
  font-size: 14px;
}

.notification-items {
  margin: 20px 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #F5F7FA;
}

.notification-item.unread {
  background-color: #F0F9FF;
}

.notification-icon {
  margin-right: 15px;
  color: #909399;
}

.system-icon {
  color: #909399;
}

.commission-icon {
  color: #67C23A;
}

.order-icon {
  color: #409EFF;
}

.team-icon {
  color: #E6A23C;
}

.activity-icon {
  color: #F56C6C;
}

.warning-icon {
  color: #F56C6C;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.unread-tag {
  margin-left: 10px;
}

.notification-message {
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.5;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-actions {
  margin-left: 15px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.notification-detail {
  padding: 20px;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-header h4 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #303133;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #909399;
  font-size: 14px;
}

.detail-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
}

.detail-data {
  margin-top: 20px;
}

.detail-data h5 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #303133;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .notification-item {
    flex-direction: column;
  }
  
  .notification-icon {
    margin-bottom: 10px;
  }
  
  .notification-actions {
    margin: 10px 0 0;
    display: flex;
    gap: 10px;
  }
}
</style> 