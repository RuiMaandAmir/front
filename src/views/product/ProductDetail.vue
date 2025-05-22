<template>
  <div class="product-detail-container" :class="{ 'is-mobile': isMobileDevice }">
    <!-- 移动端头部 -->
    <div v-if="isMobileDevice" class="mobile-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="header-title">商品详情</div>
      <div class="header-right">
        <el-button text @click="handleShare">
          <el-icon><Share /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 商品图片轮播 -->
    <div class="product-images" :class="{ 'mobile-images': isMobileDevice }">
      <el-carousel :height="isMobileDevice ? '300px' : '500px'">
        <el-carousel-item v-for="image in product.images" :key="image">
          <el-image :src="image" fit="cover" />
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 商品信息 -->
    <div class="product-info" :class="{ 'mobile-info': isMobileDevice }">
      <h1 class="product-name">{{ product.name }}</h1>
      <div class="product-price">
        <span class="current-price">¥{{ product.price }}</span>
        <span v-if="product.originalPrice" class="original-price">
          ¥{{ product.originalPrice }}
        </span>
      </div>
      <div class="product-meta">
        <span>销量: {{ product.sales }}</span>
        <span>库存: {{ product.stock }}</span>
      </div>
    </div>

    <!-- 商品规格 -->
    <div class="product-specs" :class="{ 'mobile-specs': isMobileDevice }">
      <h2>商品规格</h2>
      <el-form :model="specForm" label-width="80px">
        <el-form-item
          v-for="spec in product.specs"
          :key="spec.name"
          :label="spec.name"
        >
          <el-radio-group v-model="specForm[spec.name]">
            <el-radio
              v-for="option in spec.options"
              :key="option"
              :label="option"
            >
              {{ option }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number
            v-model="quantity"
            :min="1"
            :max="product.stock"
            size="small"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 商品详情 -->
    <div class="product-detail" :class="{ 'mobile-detail': isMobileDevice }">
      <el-tabs>
        <el-tab-pane label="商品详情">
          <div v-html="product.description"></div>
        </el-tab-pane>
        <el-tab-pane label="规格参数">
          <el-descriptions :column="isMobileDevice ? 1 : 2" border>
            <el-descriptions-item
              v-for="param in product.params"
              :key="param.name"
              :label="param.name"
            >
              {{ param.value }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar" :class="{ 'mobile-bottom-bar': isMobileDevice }">
      <div class="left-actions">
        <el-button text @click="router.push('/')">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-button>
        <el-button text @click="router.push('/cart')">
          <el-icon><ShoppingCart /></el-icon>
          <span>购物车</span>
        </el-button>
      </div>
      <div class="right-actions">
        <el-button type="warning" @click="handleAddToCart">
          加入购物车
        </el-button>
        <el-button type="danger" @click="handleBuyNow">
          立即购买
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Share,
  HomeFilled,
  ShoppingCart
} from '@element-plus/icons-vue'
import { isMobile, onResize, offResize } from '@/utils/responsive'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types/product'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

// 响应式状态
const isMobileDevice = ref(isMobile())
const product = ref<Product>({
  id: 0,
  name: '',
  price: 0,
  images: [],
  description: '',
  specs: [],
  params: [],
  stock: 0,
  sales: 0
})
const quantity = ref(1)
const specForm = ref({})

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = isMobile()
}

// 处理分享
const handleShare = () => {
  // TODO: 实现分享功能
  ElMessage.success('分享功能开发中')
}

// 处理加入购物车
const handleAddToCart = () => {
  // 验证规格是否选择完整
  const missingSpecs = product.value.specs.filter(
    spec => !specForm.value[spec.name]
  )
  if (missingSpecs.length > 0) {
    ElMessage.warning('请选择商品规格')
    return
  }

  cartStore.addItem({
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    quantity: quantity.value,
    specs: specForm.value
  })
  ElMessage.success('已加入购物车')
}

// 处理立即购买
const handleBuyNow = () => {
  // 验证规格是否选择完整
  const missingSpecs = product.value.specs.filter(
    spec => !specForm.value[spec.name]
  )
  if (missingSpecs.length > 0) {
    ElMessage.warning('请选择商品规格')
    return
  }

  // 加入购物车并跳转到结算页面
  handleAddToCart()
  router.push('/checkout')
}

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    const productId = route.params.id
    // TODO: 实现商品详情获取逻辑
    // const response = await api.getProductDetail(productId)
    // product.value = response.data
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  }
}

onMounted(() => {
  fetchProductDetail()
  onResize(handleResize)
})

onUnmounted(() => {
  offResize(handleResize)
})
</script>

<style scoped>
.product-detail-container {
  padding-bottom: 60px;
}

.product-images {
  margin-bottom: 20px;
}

.product-info {
  padding: 20px;
  background: #fff;
  margin-bottom: 20px;
}

.product-name {
  margin: 0 0 10px;
  font-size: 20px;
  color: #303133;
}

.product-price {
  margin-bottom: 10px;
}

.current-price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: bold;
  margin-right: 10px;
}

.original-price {
  font-size: 16px;
  color: #909399;
  text-decoration: line-through;
}

.product-meta {
  color: #909399;
  font-size: 14px;
}

.product-meta span {
  margin-right: 20px;
}

.product-specs {
  padding: 20px;
  background: #fff;
  margin-bottom: 20px;
}

.product-specs h2 {
  margin: 0 0 20px;
  font-size: 18px;
  color: #303133;
}

.product-detail {
  padding: 20px;
  background: #fff;
}

/* 移动端样式 */
.is-mobile {
  padding-bottom: 50px;
}

.mobile-images {
  margin-bottom: 12px;
}

.mobile-info {
  padding: 16px;
  margin-bottom: 12px;
}

.mobile-info .product-name {
  font-size: 18px;
}

.mobile-info .current-price {
  font-size: 20px;
}

.mobile-info .original-price {
  font-size: 14px;
}

.mobile-specs {
  padding: 16px;
  margin-bottom: 12px;
}

.mobile-specs h2 {
  font-size: 16px;
  margin-bottom: 16px;
}

.mobile-detail {
  padding: 16px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.left-actions {
  display: flex;
  margin-right: 20px;
}

.left-actions .el-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10px;
}

.left-actions .el-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.left-actions span {
  font-size: 12px;
}

.right-actions {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.mobile-bottom-bar {
  padding: 0 12px;
}

.mobile-bottom-bar .left-actions {
  margin-right: 12px;
}

.mobile-bottom-bar .left-actions .el-button {
  padding: 0 8px;
}

.mobile-bottom-bar .right-actions {
  gap: 8px;
}

.mobile-bottom-bar .el-button {
  padding: 8px 16px;
}
</style> 