<template>
  <div class="coupons-page">
    <div class="page-header">
      <h2>我的优惠券</h2>
      <div class="header-actions">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="可使用" name="available" />
          <el-tab-pane label="已使用" name="used" />
          <el-tab-pane label="已过期" name="expired" />
        </el-tabs>
      </div>
    </div>

    <div class="coupons-container">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>

      <template v-else>
        <div v-if="coupons.length === 0" class="empty-state">
          <el-empty :description="getEmptyText()" />
        </div>

        <div v-else class="coupon-list">
          <div
            v-for="coupon in coupons"
            :key="coupon.id"
            class="coupon-card"
            :class="{
              'is-used': coupon.status === 'used',
              'is-expired': coupon.status === 'expired',
            }"
          >
            <div class="coupon-left">
              <div class="coupon-amount">
                <span class="currency">¥</span>
                <span class="number">{{ coupon.amount }}</span>
              </div>
              <div class="coupon-condition">
                满{{ coupon.min_amount }}元可用
              </div>
            </div>
            <div class="coupon-right">
              <div class="coupon-info">
                <h3 class="coupon-name">{{ coupon.name }}</h3>
                <p class="coupon-desc">{{ coupon.description }}</p>
                <p class="coupon-time">
                  有效期至：{{ formatDate(coupon.expire_time) }}
                </p>
              </div>
              <div class="coupon-actions">
                <el-button
                  v-if="coupon.status === 'available'"
                  type="primary"
                  @click="useCoupon(coupon)"
                >
                  立即使用
                </el-button>
                <el-tag
                  v-else
                  :type="coupon.status === 'used' ? 'info' : 'danger'"
                >
                  {{ coupon.status === 'used' ? '已使用' : '已过期' }}
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
    </div>

    <!-- 优惠券使用弹窗 -->
    <el-dialog
      v-model="useDialogVisible"
      title="使用优惠券"
      width="500px"
    >
      <div v-if="selectedCoupon" class="use-coupon-content">
        <div class="coupon-info">
          <h3>{{ selectedCoupon.name }}</h3>
          <p>{{ selectedCoupon.description }}</p>
          <p>优惠金额：¥{{ selectedCoupon.amount }}</p>
          <p>使用条件：满{{ selectedCoupon.min_amount }}元可用</p>
          <p>有效期至：{{ formatDate(selectedCoupon.expire_time) }}</p>
        </div>
        <div class="use-actions">
          <el-button @click="useDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUseCoupon">
            确认使用
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useCouponStore } from '../stores/coupon';
import { formatDate } from '../utils/date';

const router = useRouter();
const couponStore = useCouponStore();

const loading = ref(false);
const coupons = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const activeTab = ref('available');
const useDialogVisible = ref(false);
const selectedCoupon = ref(null);

// 获取空状态文本
const getEmptyText = () => {
  const textMap = {
    available: '暂无可用优惠券',
    used: '暂无已使用优惠券',
    expired: '暂无已过期优惠券',
  };
  return textMap[activeTab.value] || '暂无优惠券';
};

// 加载优惠券列表
const loadCoupons = async () => {
  loading.value = true;
  try {
    const response = await couponStore.getCoupons({
      page: currentPage.value,
      page_size: pageSize.value,
      status: activeTab.value,
    });
    coupons.value = response.data.results;
    total.value = response.data.count;
  } catch (error) {
    ElMessage.error('加载优惠券失败');
  } finally {
    loading.value = false;
  }
};

// 处理标签页切换
const handleTabChange = () => {
  currentPage.value = 1;
  loadCoupons();
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  loadCoupons();
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadCoupons();
};

// 使用优惠券
const useCoupon = (coupon: any) => {
  selectedCoupon.value = coupon;
  useDialogVisible.value = true;
};

// 确认使用优惠券
const confirmUseCoupon = () => {
  if (!selectedCoupon.value) return;
  
  router.push({
    path: '/products',
    query: {
      coupon_id: selectedCoupon.value.id,
    },
  });
  useDialogVisible.value = false;
};

onMounted(() => {
  loadCoupons();
});
</script>

<style scoped>
.coupons-page {
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

.coupons-container {
  min-height: 400px;
}

.loading-state {
  padding: 20px;
}

.empty-state {
  padding: 40px 0;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.coupon-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.coupon-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: #2e7d32;
}

.coupon-card.is-used::before,
.coupon-card.is-expired::before {
  background: #909399;
}

.coupon-left {
  width: 200px;
  padding: 20px;
  background: #f0f9eb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.coupon-card.is-used .coupon-left,
.coupon-card.is-expired .coupon-left {
  background: #f4f4f5;
}

.coupon-amount {
  color: #2e7d32;
  margin-bottom: 10px;
}

.coupon-card.is-used .coupon-amount,
.coupon-card.is-expired .coupon-amount {
  color: #909399;
}

.currency {
  font-size: 20px;
  font-weight: bold;
}

.number {
  font-size: 36px;
  font-weight: bold;
}

.coupon-condition {
  color: #666;
  font-size: 14px;
}

.coupon-right {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-info {
  flex: 1;
}

.coupon-name {
  margin: 0 0 10px;
  font-size: 18px;
  color: #333;
}

.coupon-desc {
  margin: 0 0 10px;
  color: #666;
  font-size: 14px;
}

.coupon-time {
  margin: 0;
  color: #999;
  font-size: 12px;
}

.coupon-actions {
  margin-left: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.use-coupon-content {
  padding: 20px;
}

.use-coupon-content h3 {
  margin: 0 0 20px;
  color: #333;
}

.use-coupon-content p {
  margin: 10px 0;
  color: #666;
}

.use-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .coupons-page {
    padding: 10px;
  }

  .coupon-card {
    flex-direction: column;
  }

  .coupon-left {
    width: 100%;
    padding: 15px;
  }

  .coupon-right {
    padding: 15px;
  }

  .coupon-actions {
    margin-left: 0;
    margin-top: 15px;
  }
}
</style> 