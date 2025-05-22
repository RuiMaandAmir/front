<template>
  <div class="distribution-products">
    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索商品名称"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select v-model="categoryId" placeholder="商品分类" clearable @change="handleSearch">
        <el-option
          v-for="category in categories"
          :key="category.id"
          :label="category.name"
          :value="category.id"
        />
      </el-select>
      
      <el-button type="primary" @click="handleSearch">
        搜索
        <el-icon><Search /></el-icon>
      </el-button>
    </div>

    <!-- 商品列表 -->
    <div class="products-grid">
      <el-row :gutter="20">
        <el-col
          v-for="product in products"
          :key="product.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card shadow="hover" class="product-card">
            <div class="product-image">
              <el-image
                :src="product.image"
                :alt="product.name"
                fit="cover"
                @click="goToDetail(product.id)"
              />
              <div class="commission-tag">
                佣金比例：{{ product.commission_rate }}%
              </div>
            </div>
            
            <div class="product-info">
              <h3 class="product-name" @click="goToDetail(product.id)">
                {{ product.name }}
              </h3>
              <div class="product-price">
                <span class="current-price">¥{{ product.price }}</span>
                <span class="original-price" v-if="product.original_price">
                  ¥{{ product.original_price }}
                </span>
              </div>
              <div class="product-stats">
                <span>销量：{{ product.sales_count }}</span>
                <span>库存：{{ product.stock }}</span>
              </div>
            </div>
            
            <div class="product-actions">
              <el-button
                type="primary"
                :loading="generatingLinks[product.id]"
                @click="generateLink(product)"
              >
                生成分销链接
              </el-button>
              <el-button
                type="success"
                :loading="generatingQrCodes[product.id]"
                @click="generateQrCode(product)"
              >
                生成二维码
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination">
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

    <!-- 分销链接对话框 -->
    <el-dialog
      v-model="linkDialogVisible"
      title="分销链接"
      width="500px"
    >
      <div class="link-dialog-content">
        <div class="link-input">
          <el-input
            v-model="currentLink"
            readonly
          >
            <template #append>
              <el-button @click="copyLink">复制</el-button>
            </template>
          </el-input>
        </div>
        <div class="qrcode-container" ref="qrcodeRef"></div>
        <div class="qrcode-actions">
          <el-button type="primary" @click="downloadQrCode">
            下载二维码
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import QRCode from 'qrcodejs2-fix'
import type { Category, Product, ProductListResponse } from '@/types/product'

const router = useRouter()
const productStore = useProductStore()

// 搜索和筛选
const searchKeyword = ref('')
const categoryId = ref<number | null>(null)
const categories = ref<Category[]>([])

// 商品列表
const products = ref<Product[]>([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 生成链接相关
const generatingLinks = ref<Record<number, boolean>>({})
const generatingQrCodes = ref<Record<number, boolean>>({})
const linkDialogVisible = ref(false)
const currentLink = ref('')
const qrcodeRef = ref<HTMLElement>()
let qrcode: QRCode | null = null

// 获取商品分类
const getCategories = async () => {
  try {
    const response = await productStore.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('获取商品分类失败:', error)
  }
}

// 获取商品列表
const getProducts = async () => {
  try {
    const params: any = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    if (categoryId.value) {
      params.category_id = categoryId.value
    }
    const response = await productStore.getDistributionProducts(params)
    products.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('获取商品列表失败:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getProducts()
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getProducts()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getProducts()
}

// 跳转到商品详情
const goToDetail = (productId: number) => {
  router.push(`/product/${productId}`)
}

// 生成分销链接
const generateLink = async (product: Product) => {
  try {
    generatingLinks.value[product.id] = true
    const response = await productStore.createDistributionLink(product.id)
    currentLink.value = response.link
    linkDialogVisible.value = true
    // 生成二维码
    generateQrCode(product, response.link)
  } catch (error) {
    console.error('生成分销链接失败:', error)
    ElMessage.error('生成分销链接失败')
  } finally {
    generatingLinks.value[product.id] = false
  }
}

// 生成二维码
const generateQrCode = async (product: Product, link?: string) => {
  try {
    generatingQrCodes.value[product.id] = true
    if (!link) {
      const response = await productStore.createDistributionLink(product.id)
      link = response.link
    }
    
    if (qrcodeRef.value) {
      qrcodeRef.value.innerHTML = ''
      qrcode = new QRCode(qrcodeRef.value, {
        text: link,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      })
    }
  } catch (error) {
    console.error('生成二维码失败:', error)
    ElMessage.error('生成二维码失败')
  } finally {
    generatingQrCodes.value[product.id] = false
  }
}

// 复制链接
const copyLink = () => {
  navigator.clipboard.writeText(currentLink.value)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

// 下载二维码
const downloadQrCode = () => {
  if (!qrcodeRef.value) return
  
  const canvas = qrcodeRef.value.querySelector('canvas')
  if (!canvas) return
  
  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  getCategories()
  getProducts()
})
</script>

<style scoped>
.distribution-products {
  padding: 20px;
}

.search-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.products-grid {
  margin-bottom: 20px;
}

.product-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image .el-image {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.commission-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(64, 158, 255, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.product-info {
  padding: 10px;
}

.product-name {
  margin: 0 0 10px;
  font-size: 16px;
  color: #303133;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  margin-bottom: 10px;
}

.current-price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
  margin-right: 10px;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.product-actions {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-top: 1px solid #ebeef5;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.link-dialog-content {
  text-align: center;
}

.link-input {
  margin-bottom: 20px;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qrcode-actions {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .product-actions {
    flex-direction: column;
  }
}
</style> 