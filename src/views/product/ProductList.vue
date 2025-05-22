<template>
  <div class="product-list-container" :class="{ 'is-mobile': isMobileDevice }">
    <!-- 移动端头部 -->
    <div v-if="isMobileDevice" class="mobile-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="header-title">商品列表</div>
      <div class="header-right">
        <el-button text @click="showFilter = true">
          <el-icon><Filter /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar" :class="{ 'mobile-search': isMobileDevice }">
      <el-input
        v-model="searchQuery"
        placeholder="搜索商品"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <!-- 筛选条件 -->
    <div v-if="!isMobileDevice" class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="分类">
          <el-select v-model="filterForm.category" placeholder="选择分类" clearable>
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格区间">
          <el-input-number
            v-model="filterForm.minPrice"
            :min="0"
            placeholder="最低价"
          />
          <span class="separator">-</span>
          <el-input-number
            v-model="filterForm.maxPrice"
            :min="0"
            placeholder="最高价"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 商品列表 -->
    <div class="product-list" :class="{ 'mobile-list': isMobileDevice }">
      <el-row :gutter="isMobileDevice ? 8 : 20">
        <el-col
          v-for="product in products"
          :key="product.id"
          :xs="12"
          :sm="8"
          :md="6"
          :lg="6"
          :xl="4"
        >
          <el-card
            class="product-card"
            :body-style="{ padding: isMobileDevice ? '8px' : '20px' }"
            @click="handleProductClick(product)"
          >
            <el-image
              :src="product.image"
              fit="cover"
              :style="{
                height: isMobileDevice ? '120px' : '200px',
                width: '100%'
              }"
            />
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-price">¥{{ product.price }}</p>
              <div class="product-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click.stop="handleAddToCart(product)"
                >
                  加入购物车
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination" :class="{ 'mobile-pagination': isMobileDevice }">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 移动端筛选抽屉 -->
    <el-drawer
      v-model="showFilter"
      title="筛选条件"
      direction="rtl"
      size="80%"
      :class="{ 'mobile-dialog': isMobileDevice }"
    >
      <el-form :model="filterForm" label-position="top">
        <el-form-item label="分类">
          <el-select v-model="filterForm.category" placeholder="选择分类" clearable>
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格区间">
          <el-input-number
            v-model="filterForm.minPrice"
            :min="0"
            placeholder="最低价"
            style="width: 100%"
          />
          <div class="separator">-</div>
          <el-input-number
            v-model="filterForm.maxPrice"
            :min="0"
            placeholder="最高价"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="mobile-btn" @click="handleFilter">
            确定
          </el-button>
          <el-button class="mobile-btn" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Filter, ArrowLeft } from '@element-plus/icons-vue'
import { isMobile, onResize, offResize } from '@/utils/responsive'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types/product'

const router = useRouter()
const cartStore = useCartStore()

// 响应式状态
const isMobileDevice = ref(isMobile())
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const products = ref<Product[]>([])
const categories = ref([])
const showFilter = ref(false)

const filterForm = ref({
  category: '',
  minPrice: 0,
  maxPrice: 0
})

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = isMobile()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
}

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1
  showFilter.value = false
  fetchProducts()
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    category: '',
    minPrice: 0,
    maxPrice: 0
  }
  handleFilter()
}

// 处理商品点击
const handleProductClick = (product: Product) => {
  router.push(`/product/${product.id}`)
}

// 处理加入购物车
const handleAddToCart = (product: Product) => {
  cartStore.addItem({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: 1
  })
  ElMessage.success('已加入购物车')
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchProducts()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchProducts()
}

// 获取商品列表
const fetchProducts = async () => {
  try {
    // TODO: 实现商品列表获取逻辑
    // const response = await api.getProducts({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   search: searchQuery.value,
    //   ...filterForm.value
    // })
    // products.value = response.data.items
    // total.value = response.data.total
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    // TODO: 实现分类列表获取逻辑
    // const response = await api.getCategories()
    // categories.value = response.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
  onResize(handleResize)
})

onUnmounted(() => {
  offResize(handleResize)
})
</script>

<style scoped>
.product-list-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.separator {
  margin: 0 10px;
  color: #909399;
}

.product-list {
  margin-bottom: 20px;
}

.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.product-info {
  margin-top: 10px;
}

.product-name {
  margin: 0;
  font-size: 16px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  margin: 5px 0;
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.product-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

/* 移动端样式 */
.is-mobile {
  padding: 0;
}

.is-mobile .search-bar {
  margin: 0;
  padding: 12px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.is-mobile .product-card {
  margin-bottom: 8px;
}

.is-mobile .product-name {
  font-size: 14px;
}

.is-mobile .product-price {
  font-size: 16px;
}

.is-mobile .product-actions {
  margin-top: 8px;
}

.is-mobile .product-actions .el-button {
  width: 100%;
}
</style> 