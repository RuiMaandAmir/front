<template>
  <div class="product-detail">
    <!-- loading 状态 -->
    <el-skeleton v-if="loading" rows="10" animated />
    <template v-else>
      <!-- 商品基本信息 -->
      <div class="product-info" v-if="product && product.id">
        <el-row :gutter="20">
          <!-- 商品图片 -->
          <el-col :span="12">
            <div class="product-gallery">
              <el-carousel :interval="4000" type="card" height="400px">
                <el-carousel-item v-for="image in product.images" :key="image">
                  <img :src="image" :alt="product.name" class="product-image">
                </el-carousel-item>
              </el-carousel>
            </div>
          </el-col>

          <!-- 商品信息 -->
          <el-col :span="12">
            <div class="product-content">
              <h1 class="product-name">{{ product.name }}</h1>
              
              <div class="product-price">
                <span class="current-price">¥{{ product.price }}</span>
                <span v-if="product.original_price" class="original-price">¥{{ product.original_price }}</span>
              </div>

              <div class="product-stats">
                <div class="stat-item">
                  <span class="label">销量</span>
                  <span class="value">{{ product.sales_count }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">库存</span>
                  <span class="value">{{ product.stock }}</span>
                </div>
              </div>

              <div class="product-commission" v-if="isDistributor">
                <div class="commission-rate">
                  <span class="label">分销佣金比例</span>
                  <span class="value">{{ product.commission_rate }}%</span>
                </div>
                <div class="commission-amount">
                  <span class="label">预计佣金</span>
                  <span class="value">¥{{ (product.price * product.commission_rate / 100).toFixed(2) }}</span>
                </div>
              </div>

              <!-- 购买数量 -->
              <div class="product-quantity">
                <span class="label">数量</span>
                <el-input-number
                  v-model="quantity"
                  :min="1"
                  :max="product.stock"
                  @change="handleQuantityChange"
                />
              </div>

              <!-- 操作按钮 -->
              <div class="product-actions">
                <el-button type="primary" size="large" @click="addToCart" :loading="addCartLoading" :disabled="!canAddToCart">
                  加入购物车
                </el-button>
                <el-button type="danger" size="large" @click="buyNow" :loading="buyNowLoading" :disabled="!canBuy">
                  立即购买
                </el-button>
                <el-button
                  v-if="isDistributor"
                  type="success"
                  size="large"
                  @click="showShareDialog"
                  :disabled="!canDistribute"
                >
                  分销推广
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <el-empty v-else description="商品不存在或已下架" />

      <!-- 商品详情 -->
      <div class="product-detail-tabs" v-if="product && product.id">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="detail-content" v-html="product.description"></div>
          </el-tab-pane>
          <el-tab-pane label="规格参数" name="specs">
            <el-descriptions :column="2" border>
              <el-descriptions-item
                v-for="(value, key) in product.specifications"
                :key="key"
                :label="key"
              >
                {{ value }}
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="商品评价" name="reviews">
            <div v-if="reviews.length" class="reviews-list">
              <div
                v-for="review in reviews"
                :key="review.id"
                class="review-item"
              >
                <div class="review-header">
                  <el-avatar :src="review.user.avatar" />
                  <div class="review-info">
                    <div class="review-user">{{ review.user.nickname }}</div>
                    <div class="review-time">{{ formatTime(review.created_at) }}</div>
                  </div>
                  <div class="review-rating">
                    <el-rate
                      v-model="review.rating"
                      disabled
                      show-score
                      text-color="#ff9900"
                    />
                  </div>
                </div>
                <div class="review-content">{{ review.content }}</div>
                <div class="review-images" v-if="review.images && review.images.length">
                  <el-image
                    v-for="image in review.images"
                    :key="image"
                    :src="image"
                    :preview-src-list="review.images"
                    fit="cover"
                    class="review-image"
                  />
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无评价" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>

    <!-- 分销分享对话框 -->
    <el-dialog
      v-model="shareDialogVisible"
      title="分销推广"
      width="500px"
    >
      <div class="share-content">
        <div class="share-qrcode">
          <div ref="qrcodeRef" class="qrcode"></div>
        </div>
        <div class="share-link">
          <el-input
            v-model="shareLink"
            readonly
          >
            <template #append>
              <el-button @click="copyLink">复制链接</el-button>
            </template>
          </el-input>
        </div>
        <div class="share-tips">
          <p>分享提示：</p>
          <ul>
            <li>复制链接或保存二维码分享给好友</li>
            <li>好友通过您的链接购买商品，您将获得佣金</li>
            <li>佣金将在确认收货后{{ settlementDays }}天结算</li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import QRCode from 'qrcodejs2-fix'
import dayjs from 'dayjs'
import type { ProductReview } from '@/types/product'
import { requireLogin, requireDistributor, Permission, checkPermission } from '@/utils/auth'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const userStore = useUserStore()

// 商品信息
const product = ref<any>(null)
const loading = ref(false)
// 评价列表
const reviews = ref<ProductReview[]>([])
const reviewsLoading = ref(false)
// 购买数量
const quantity = ref(1)
// 标签页
const activeTab = ref('detail')
// 分销相关
const isDistributor = computed(() => userStore.isDistributor)
const shareDialogVisible = ref(false)
const shareLink = ref('')
const qrcodeRef = ref<HTMLElement | null>(null)
let qrcode: any = null
const settlementDays = ref(7) // 从配置中获取
// 按钮loading
const addCartLoading = ref(false)
const buyNowLoading = ref(false)

// 获取商品详情
const getProductDetail = async () => {
  loading.value = true
  try {
    const productId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    const response = await productStore.getProductDetail(productId)
    product.value = response.data || null
  } catch (error) {
    product.value = null
    ElMessage.error('获取商品详情失败，请重试')
  } finally {
    loading.value = false
  }
}
// 获取商品评价
const getProductReviews = async () => {
  reviewsLoading.value = true
  try {
    const productId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    const response = await productStore.getProductReviews({
      product_id: Number(productId)
    })
    reviews.value = response.items || []
  } catch (error) {
    reviews.value = []
  } finally {
    reviewsLoading.value = false
  }
}
// 处理数量变化
const handleQuantityChange = (value: number) => {
  quantity.value = value
}
// 加入购物车
const addToCart = async () => {
  if (!requireLogin()) return
  
  addCartLoading.value = true
  try {
    await productStore.addToCart({
      product_id: product.value.id,
      quantity: quantity.value
    })
    ElMessage.success('已加入购物车')
  } catch (error) {
    ElMessage.error('加入购物车失败，请重试')
  } finally {
    addCartLoading.value = false
  }
}
// 立即购买
const buyNow = async () => {
  if (!requireLogin()) return
  
  buyNowLoading.value = true
  try {
    router.push({
      path: '/checkout',
      query: {
        product_id: product.value.id,
        quantity: quantity.value
      }
    })
  } finally {
    buyNowLoading.value = false
  }
}
// 显示分享对话框
const showShareDialog = async () => {
  if (!requireDistributor()) return
  
  try {
    const response = await productStore.getDistributionLink(product.value.id)
    shareLink.value = response.link
    shareDialogVisible.value = true
    setTimeout(generateQrCode, 100)
  } catch (error) {
    console.error('获取分销链接失败:', error)
    ElMessage.error('获取分销链接失败，请重试')
  }
}

// 生成二维码
const generateQrCode = () => {
  if (!qrcodeRef.value || !shareLink.value) return
  
  // 清除旧的二维码
  if (qrcode) {
    qrcodeRef.value.innerHTML = ''
  }
  
  // 生成新的二维码
  qrcode = new QRCode(qrcodeRef.value, {
    text: shareLink.value,
    width: 200,
    height: 200,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  })
}

// 复制链接
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    console.error('复制链接失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 检查是否可以购买
const canBuy = computed(() => {
  return product.value && product.value.stock > 0
})

// 检查是否可以加入购物车
const canAddToCart = computed(() => {
  return product.value && product.value.stock > 0
})

// 检查是否可以分销
const canDistribute = computed(() => {
  return product.value && checkPermission(Permission.DISTRIBUTOR)
})

onMounted(() => {
  getProductDetail()
  getProductReviews()
})
</script>

<style scoped>
.product-detail {
  padding: 20px;
}

.product-info {
  margin-bottom: 40px;
}

.product-gallery {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-content {
  padding: 20px;
}

.product-name {
  font-size: 24px;
  color: #303133;
  margin: 0 0 20px;
}

.product-price {
  margin-bottom: 20px;
}

.current-price {
  font-size: 28px;
  color: #f56c6c;
  font-weight: bold;
  margin-right: 10px;
}

.original-price {
  font-size: 16px;
  color: #909399;
  text-decoration: line-through;
}

.product-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-item .label {
  font-size: 14px;
  color: #909399;
}

.stat-item .value {
  font-size: 16px;
  color: #303133;
  font-weight: bold;
}

.product-commission {
  background: #f0f9ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.commission-rate,
.commission-amount {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.commission-rate .label,
.commission-amount .label {
  color: #606266;
}

.commission-rate .value,
.commission-amount .value {
  color: #67c23a;
  font-weight: bold;
}

.product-quantity {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.product-quantity .label {
  margin-right: 10px;
  color: #606266;
}

.product-actions {
  display: flex;
  gap: 10px;
}

.product-detail-tabs {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.detail-content {
  padding: 20px 0;
}

.reviews-list {
  padding: 20px 0;
}

.review-item {
  padding: 20px 0;
  border-bottom: 1px solid #EBEEF5;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.review-info {
  margin-left: 10px;
  flex: 1;
}

.review-user {
  font-size: 16px;
  color: #303133;
}

.review-time {
  font-size: 12px;
  color: #909399;
}

.review-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 10px;
}

.review-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.review-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
}

.share-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.share-qrcode {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.qrcode {
  width: 200px;
  height: 200px;
}

.share-link {
  width: 100%;
}

.share-tips {
  width: 100%;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.share-tips p {
  margin: 0 0 10px;
  font-weight: bold;
  color: #303133;
}

.share-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.share-tips li {
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .product-actions {
    flex-direction: column;
  }
  
  .product-stats {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 