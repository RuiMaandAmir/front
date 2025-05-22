<template>
  <div class="product-detail" v-loading="loading">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <div v-else-if="product" class="product-content">
      <div class="product-header">
        <div class="product-image">
          <el-image :src="product.image" fit="cover" />
        </div>
        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          <div class="product-price">
            <span class="current-price">¥{{ product.price }}</span>
            <span class="original-price">¥{{ product.original_price }}</span>
          </div>
          <div class="product-stats">
            <span>销量：{{ product.sales }}</span>
            <span>库存：{{ product.stock }}</span>
          </div>
          <div class="product-actions">
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="product.stock"
              size="large"
            />
            <el-button type="primary" size="large" @click="addToCart">
              加入购物车
            </el-button>
            <el-button type="danger" size="large" @click="buyNow">
              立即购买
            </el-button>
          </div>
          <DistributionLink
            v-if="isLoggedIn"
            :product-id="product.id"
          />
        </div>
      </div>

      <div class="product-tabs">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="product-description" v-html="product.description" />
          </el-tab-pane>
          <el-tab-pane label="分销统计" name="stats" v-if="isLoggedIn">
            <DistributionStats :product-id="product.id" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 相关商品 -->
    <div class="related-products">
      <h2>相关商品</h2>
      <div class="product-grid">
        <el-card v-for="product in relatedProducts" :key="product.id" class="product-card">
          <div class="product-image" @click="viewProduct(product)">
            <el-image :src="product.image" fit="cover">
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="product-info">
            <h3 @click="viewProduct(product)">{{ product.name }}</h3>
            <p class="price">¥{{ product.price }}</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import DistributionLink from '@/components/DistributionLink.vue'
import DistributionStats from '@/components/DistributionStats.vue'
import { Picture } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(false)
const product = ref<any>(null)
const quantity = ref(1)
const activeTab = ref('detail')
const relatedProducts = ref([])

const isLoggedIn = computed(() => userStore.isLoggedIn)

const loadProduct = async () => {
  try {
    loading.value = true
    const productId = Number(route.params.id)
    const response = await productStore.getProductDetail(productId)
    product.value = response
  } catch (error) {
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

const addToCart = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    await cartStore.addToCart({
      product_id: product.value.id,
      quantity: quantity.value
    })
    ElMessage.success('已加入购物车')
  } catch (error) {
    ElMessage.error('加入购物车失败')
  }
}

const buyNow = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    await cartStore.addToCart({
      product_id: product.value.id,
      quantity: quantity.value
    })
    router.push('/checkout')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 加载相关商品
const loadRelatedProducts = async () => {
  try {
    const productId = Number(route.params.id)
    const response = await productStore.getRelatedProducts(productId)
    relatedProducts.value = response
  } catch (error) {
    console.error('加载相关商品失败:', error)
  }
}

// 记录浏览行为
const recordViewBehavior = async () => {
  try {
    const productId = Number(route.params.id)
    await productStore.recordUserBehavior(productId, 'view')
  } catch (error) {
    console.error('记录浏览行为失败:', error)
  }
}

const viewProduct = (product) => {
  router.push(`/product/${product.id}`)
}

onMounted(() => {
  loadProduct()
  loadRelatedProducts()
  recordViewBehavior()
})
</script>

<style scoped>
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  padding: 40px;
}

.product-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.product-header {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.product-image {
  width: 400px;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.product-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
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
  color: #999;
  text-decoration: line-through;
}

.product-stats {
  display: flex;
  gap: 20px;
  color: #666;
  margin-bottom: 30px;
}

.product-actions {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.product-tabs {
  margin-top: 40px;
}

.product-description {
  padding: 20px 0;
  line-height: 1.8;
}

.related-products {
  margin-top: 40px;
}

.related-products h2 {
  margin-bottom: 20px;
  font-size: 24px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.product-card {
  transition: all 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image .el-image {
  width: 100%;
  height: 100%;
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 10px;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 30px;
}

@media (max-width: 768px) {
  .product-header {
    flex-direction: column;
  }

  .product-image {
    width: 100%;
    height: 300px;
  }

  .product-actions {
    flex-direction: column;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .product-image {
    height: 150px;
  }

  .product-info h3 {
    font-size: 14px;
  }

  .price {
    font-size: 16px;
  }
}
</style> 