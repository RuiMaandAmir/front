<template>
  <div class="after-sales-page">
    <div class="page-header">
      <h2>售后服务</h2>
      <div class="header-actions">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="退款/退货" name="refund" />
          <el-tab-pane label="售后记录" name="records" />
        </el-tabs>
      </div>
    </div>

    <div class="after-sales-content">
      <!-- 退款/退货申请表单 -->
      <template v-if="activeTab === 'refund'">
        <el-card class="refund-form">
          <template #header>
            <div class="card-header">
              <span>申请退款/退货</span>
            </div>
          </template>

          <el-form
            ref="refundFormRef"
            :model="refundForm"
            :rules="refundRules"
            label-width="100px"
          >
            <el-form-item label="订单号" prop="order_id">
              <el-input
                v-model="refundForm.order_id"
                placeholder="请输入订单号"
                :disabled="!!selectedOrder"
                @blur="handleOrderIdBlur"
              />
            </el-form-item>

            <el-form-item label="退款金额" prop="amount">
              <div class="refund-amount">
                <span class="amount-label">订单金额：</span>
                <span class="amount-value">¥{{ orderAmount }}</span>
                <el-input-number
                  v-model="refundForm.amount"
                  :min="0"
                  :max="orderAmount"
                  :precision="2"
                  :step="10"
                  @change="handleAmountChange"
                />
              </div>
              <div class="amount-tip">
                可退款金额：¥{{ orderAmount }}，请根据实际情况填写退款金额
              </div>
            </el-form-item>

            <el-form-item label="退款类型" prop="type">
              <el-radio-group v-model="refundForm.type">
                <el-radio label="refund">仅退款</el-radio>
                <el-radio label="return">退货退款</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="退款原因" prop="reason">
              <el-select v-model="refundForm.reason" placeholder="请选择退款原因">
                <el-option label="商品质量问题" value="quality" />
                <el-option label="商品与描述不符" value="description" />
                <el-option label="商品损坏" value="damaged" />
                <el-option label="尺寸不合适" value="size" />
                <el-option label="其他原因" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item label="问题描述" prop="description">
              <el-input
                v-model="refundForm.description"
                type="textarea"
                :rows="4"
                placeholder="请详细描述问题"
              />
            </el-form-item>

            <el-form-item label="上传凭证">
              <el-upload
                v-model:file-list="refundForm.images"
                action="/api/upload"
                list-type="picture-card"
                :limit="5"
                :on-success="handleUploadSuccess"
                :on-error="handleUploadError"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="submitRefund">
                提交申请
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </template>

      <!-- 售后记录列表 -->
      <template v-else>
        <el-card class="records-list">
          <template #header>
            <div class="card-header">
              <span>售后记录</span>
            </div>
          </template>

          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>

          <template v-else>
            <div v-if="records.length === 0" class="empty-state">
              <el-empty description="暂无售后记录" />
            </div>

            <div v-else class="records">
              <div
                v-for="record in records"
                :key="record.id"
                class="record-card"
              >
                <div class="record-header">
                  <div class="order-info">
                    <span class="order-no">订单号：{{ record.order_no }}</span>
                    <el-tag :type="getStatusType(record.status)">
                      {{ getStatusText(record.status) }}
                    </el-tag>
                  </div>
                  <span class="record-time">
                    {{ formatDate(record.created_at) }}
                  </span>
                </div>

                <div class="record-content">
                  <div class="record-type">
                    <el-tag size="small">
                      {{ record.type === 'refund' ? '仅退款' : '退货退款' }}
                    </el-tag>
                  </div>
                  <div class="record-reason">
                    <p><strong>退款原因：</strong>{{ record.reason }}</p>
                    <p><strong>问题描述：</strong>{{ record.description }}</p>
                    <p><strong>退款金额：</strong>¥{{ record.amount }}</p>
                  </div>
                  <div v-if="record.images?.length" class="record-images">
                    <el-image
                      v-for="(image, index) in record.images"
                      :key="index"
                      :src="image"
                      :preview-src-list="record.images"
                      fit="cover"
                      class="record-image"
                    />
                  </div>
                  <!-- 退款进度 -->
                  <div v-if="record.status !== 'cancelled'" class="refund-progress">
                    <el-steps :active="getProgressStep(record.status)" finish-status="success">
                      <el-step title="申请提交" :description="formatDate(record.created_at)" />
                      <el-step title="商家处理" :description="record.processed_at ? formatDate(record.processed_at) : '待处理'" />
                      <el-step title="退款完成" :description="record.completed_at ? formatDate(record.completed_at) : '待完成'" />
                    </el-steps>
                  </div>
                  <!-- 退款评价 -->
                  <div v-if="record.status === 'completed' && !record.rating" class="refund-rating">
                    <p class="rating-title">服务评价</p>
                    <el-rate
                      v-model="record.rating"
                      :texts="['很差', '较差', '一般', '较好', '很好']"
                      show-text
                      @change="handleRatingChange(record)"
                    />
                  </div>
                  <div v-if="record.rating" class="rating-display">
                    <p class="rating-title">服务评价</p>
                    <el-rate
                      v-model="record.rating"
                      disabled
                      show-score
                      text-color="#ff9900"
                    />
                    <p v-if="record.rating_comment" class="rating-comment">
                      {{ record.rating_comment }}
                    </p>
                  </div>
                </div>

                <div class="record-footer">
                  <el-button
                    v-if="record.status === 'pending'"
                    type="primary"
                    link
                    @click="cancelRefund(record.id)"
                  >
                    取消申请
                  </el-button>
                  <el-button
                    v-if="record.status === 'approved' && record.type === 'return'"
                    type="primary"
                    link
                    @click="viewReturnInfo(record.id)"
                  >
                    查看退货信息
                  </el-button>
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
      </template>
    </div>

    <!-- 退货信息弹窗 -->
    <el-dialog
      v-model="returnDialogVisible"
      title="退货信息"
      width="500px"
    >
      <div v-if="selectedRecord" class="return-info">
        <p><strong>退货地址：</strong>{{ selectedRecord.return_address }}</p>
        <p><strong>联系人：</strong>{{ selectedRecord.return_contact }}</p>
        <p><strong>联系电话：</strong>{{ selectedRecord.return_phone }}</p>
        <p><strong>物流公司：</strong>{{ selectedRecord.logistics_company }}</p>
        <p><strong>物流单号：</strong>{{ selectedRecord.tracking_no }}</p>
        <p><strong>退货说明：</strong>{{ selectedRecord.return_instructions }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance, UploadProps } from 'element-plus';
import { useOrderStore } from '../stores/order';
import { formatDate } from '../utils/date';

const orderStore = useOrderStore();

const activeTab = ref('refund');
const loading = ref(false);
const submitting = ref(false);
const records = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const returnDialogVisible = ref(false);
const selectedRecord = ref(null);
const orderAmount = ref(0);

const refundFormRef = ref<FormInstance>();
const refundForm = ref({
  order_id: '',
  type: 'refund',
  reason: '',
  description: '',
  images: [],
  amount: 0,
});

const refundRules = {
  order_id: [
    { required: true, message: '请输入订单号', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择退款类型', trigger: 'change' },
  ],
  reason: [
    { required: true, message: '请选择退款原因', trigger: 'change' },
  ],
  description: [
    { required: true, message: '请输入问题描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' },
  ],
};

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    completed: 'success',
    cancelled: 'info',
  };
  return statusMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    pending: '待处理',
    approved: '已同意',
    rejected: '已拒绝',
    completed: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
};

// 处理标签页切换
const handleTabChange = () => {
  if (activeTab.value === 'records') {
    loadRecords();
  }
};

// 加载售后记录
const loadRecords = async () => {
  loading.value = true;
  try {
    const response = await orderStore.getRefundRecords({
      page: currentPage.value,
      page_size: pageSize.value,
    });
    records.value = response.data.results;
    total.value = response.data.count;
  } catch (error) {
    ElMessage.error('加载售后记录失败');
  } finally {
  loading.value = false;
  }
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  loadRecords();
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadRecords();
};

// 处理图片上传成功
const handleUploadSuccess: UploadProps['onSuccess'] = (response) => {
  refundForm.value.images.push(response.data.url);
  ElMessage.success('上传成功');
};

// 处理图片上传失败
const handleUploadError: UploadProps['onError'] = () => {
  ElMessage.error('上传失败');
};

// 提交退款申请
const submitRefund = async () => {
  if (!refundFormRef.value) return;

  await refundFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        await orderStore.requestRefund(refundForm.value.order_id, {
          type: refundForm.value.type,
          reason: refundForm.value.reason,
          description: refundForm.value.description,
          images: refundForm.value.images,
        });
        ElMessage.success('申请提交成功');
        refundForm.value = {
          order_id: '',
          type: 'refund',
          reason: '',
          description: '',
          images: [],
          amount: 0,
        };
        activeTab.value = 'records';
        loadRecords();
      } catch (error) {
        ElMessage.error('申请提交失败');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 取消退款申请
const cancelRefund = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要取消该退款申请吗？', '提示', {
      type: 'warning',
    });
    
    await orderStore.cancelRefund(id);
    ElMessage.success('申请已取消');
    loadRecords();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消申请失败');
    }
  }
};

// 查看退货信息
const viewReturnInfo = async (id: number) => {
  try {
    const response = await orderStore.getRefundDetail(id);
    selectedRecord.value = response.data;
    returnDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取退货信息失败');
  }
};

// 处理订单号失焦
const handleOrderIdBlur = async () => {
  if (!refundForm.value.order_id) return;
  
  try {
    const response = await orderStore.getOrderDetail(refundForm.value.order_id);
    orderAmount.value = response.data.total_amount;
    refundForm.value.amount = orderAmount.value;
  } catch (error) {
    ElMessage.error('获取订单信息失败');
  }
};

// 处理退款金额变化
const handleAmountChange = (value: number) => {
  if (value > orderAmount.value) {
    refundForm.value.amount = orderAmount.value;
    ElMessage.warning('退款金额不能超过订单金额');
  }
};

// 获取进度步骤
const getProgressStep = (status: string) => {
  const stepMap = {
    pending: 1,
    approved: 2,
    completed: 3,
    rejected: 2,
  };
  return stepMap[status] || 0;
};

// 处理评价变化
const handleRatingChange = async (record: any) => {
  try {
    await orderStore.submitRefundRating(record.id, {
      rating: record.rating,
      comment: record.rating_comment,
    });
    ElMessage.success('评价提交成功');
  } catch (error) {
    ElMessage.error('评价提交失败');
    record.rating = 0;
  }
};

onMounted(() => {
  if (activeTab.value === 'records') {
    loadRecords();
  }
});
</script>

<style scoped>
.after-sales-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 20px;
  color: #2e7d32;
}

.after-sales-content {
  min-height: 400px;
}

.refund-form {
  margin-bottom: 20px;
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

.records {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.record-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.record-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-no {
  color: #666;
}

.record-time {
  color: #999;
  font-size: 14px;
}

.record-content {
  padding: 20px;
}

.record-type {
  margin-bottom: 15px;
}

.record-reason {
  margin-bottom: 15px;
}

.record-reason p {
  margin: 5px 0;
  color: #666;
}

.record-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.record-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
}

.record-footer {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
}

.return-info {
  padding: 20px;
}

.return-info p {
  margin: 10px 0;
  color: #666;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.refund-amount {
  display: flex;
  align-items: center;
  gap: 10px;
}

.amount-label {
  color: #666;
}

.amount-value {
  color: #f56c6c;
  font-weight: bold;
}

.amount-tip {
  margin-top: 5px;
  color: #999;
  font-size: 12px;
}

.refund-progress {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
}

.refund-rating {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
}

.rating-title {
  margin: 0 0 10px;
  font-weight: bold;
  color: #333;
}

.rating-display {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
}

.rating-comment {
  margin: 10px 0 0;
  color: #666;
  font-size: 14px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .after-sales-page {
    padding: 10px;
  }

  .record-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .record-time {
    font-size: 12px;
  }

  .record-image {
    width: 80px;
    height: 80px;
  }
}
</style> 