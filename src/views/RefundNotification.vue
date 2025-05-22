<template>
  <div class="refund-notification-page">
    <div class="page-header">
      <h2>退款通知设置</h2>
    </div>

    <div class="notification-content">
      <el-card class="notification-settings">
        <template #header>
          <div class="card-header">
            <span>通知方式</span>
          </div>
        </template>

        <el-form
          ref="settingsFormRef"
          :model="settings"
          label-width="120px"
        >
          <el-form-item label="邮件通知">
            <el-switch v-model="settings.email_notification" />
          </el-form-item>

          <el-form-item label="短信通知">
            <el-switch v-model="settings.sms_notification" />
          </el-form-item>

          <el-form-item label="微信通知">
            <el-switch v-model="settings.wechat_notification" />
          </el-form-item>

          <el-form-item label="通知事件">
            <el-checkbox-group v-model="settings.notification_events">
              <el-checkbox label="refund_submitted">退款申请提交</el-checkbox>
              <el-checkbox label="refund_approved">退款申请通过</el-checkbox>
              <el-checkbox label="refund_rejected">退款申请拒绝</el-checkbox>
              <el-checkbox label="refund_completed">退款完成</el-checkbox>
              <el-checkbox label="return_required">需要退货</el-checkbox>
              <el-checkbox label="return_received">退货已收到</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="saving"
              @click="saveSettings"
            >
              保存设置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="notification-history">
        <template #header>
          <div class="card-header">
            <span>通知记录</span>
            <el-button
              type="primary"
              link
              @click="loadHistory"
            >
              刷新
            </el-button>
          </div>
        </template>

        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>

        <template v-else>
          <div v-if="history.length === 0" class="empty-state">
            <el-empty description="暂无通知记录" />
          </div>

          <div v-else class="history-list">
            <div
              v-for="item in history"
              :key="item.id"
              class="history-item"
            >
              <div class="history-header">
                <span class="event-type">{{ getEventTypeText(item.event_type) }}</span>
                <span class="notification-time">{{ formatDate(item.created_at) }}</span>
              </div>
              <div class="history-content">
                <p class="notification-content">{{ item.content }}</p>
                <div class="notification-channels">
                  <el-tag
                    v-if="item.email_sent"
                    size="small"
                    type="success"
                  >
                    邮件已发送
                  </el-tag>
                  <el-tag
                    v-if="item.sms_sent"
                    size="small"
                    type="success"
                  >
                    短信已发送
                  </el-tag>
                  <el-tag
                    v-if="item.wechat_sent"
                    size="small"
                    type="success"
                  >
                    微信已发送
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { useOrderStore } from '../stores/order';
import { formatDate } from '../utils/date';

const orderStore = useOrderStore();
const settingsFormRef = ref<FormInstance>();
const loading = ref(false);
const saving = ref(false);
const history = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const settings = ref({
  email_notification: false,
  sms_notification: false,
  wechat_notification: false,
  notification_events: [],
});

// 获取事件类型文本
const getEventTypeText = (type: string) => {
  const typeMap = {
    refund_submitted: '退款申请提交',
    refund_approved: '退款申请通过',
    refund_rejected: '退款申请拒绝',
    refund_completed: '退款完成',
    return_required: '需要退货',
    return_received: '退货已收到',
  };
  return typeMap[type] || type;
};

// 加载通知设置
const loadSettings = async () => {
  try {
    const response = await orderStore.getRefundNotificationSettings();
    settings.value = response.data;
  } catch (error) {
    ElMessage.error('加载通知设置失败');
  }
};

// 保存通知设置
const saveSettings = async () => {
  saving.value = true;
  try {
    await orderStore.updateRefundNotificationSettings(settings.value);
    ElMessage.success('设置保存成功');
  } catch (error) {
    ElMessage.error('设置保存失败');
  } finally {
    saving.value = false;
  }
};

// 加载通知记录
const loadHistory = async () => {
  loading.value = true;
  try {
    const response = await orderStore.getRefundNotificationHistory({
      page: currentPage.value,
      page_size: pageSize.value,
    });
    history.value = response.data.results;
    total.value = response.data.count;
  } catch (error) {
    ElMessage.error('加载通知记录失败');
  } finally {
    loading.value = false;
  }
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  loadHistory();
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadHistory();
};

onMounted(() => {
  loadSettings();
  loadHistory();
});
</script>

<style scoped>
.refund-notification-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #2e7d32;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-state {
  padding: 20px;
}

.empty-state {
  padding: 40px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.event-type {
  font-weight: bold;
  color: #2e7d32;
}

.notification-time {
  color: #999;
  font-size: 14px;
}

.notification-content {
  margin: 10px 0;
  color: #666;
}

.notification-channels {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .refund-notification-page {
    padding: 10px;
  }

  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .notification-time {
    font-size: 12px;
  }

  .notification-channels {
    flex-wrap: wrap;
  }
}
</style> 