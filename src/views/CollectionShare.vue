<template>
  <div class="collection-share">
    <el-card class="share-info">
      <div class="info-header">
        <div class="folder-basic">
          <el-image
            :src="folder.cover_image || '/default-folder-cover.jpg'"
            class="folder-cover"
          >
            <template #error>
              <div class="image-placeholder">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div class="folder-detail">
            <h2>{{ folder.name }}</h2>
            <p>{{ folder.description || '暂无描述' }}</p>
            <div class="folder-meta">
              <span>{{ folder.collection_count }}个商品</span>
              <span>分享者：{{ folder.user.username }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <div class="collection-content">
      <div class="collection-header">
        <div class="left">
          <el-input
            v-model="searchQuery"
            placeholder="搜索商品"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="right">
          <el-select v-model="sortBy" placeholder="排序方式" @change="handleSort">
            <el-option label="收藏时间" value="created_at" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
          </el-select>
        </div>
      </div>

      <div class="product-grid">
        <el-card v-for="item in collections" :key="item.id" class="product-card">
          <div class="product-image" @click="viewProduct(item.product)">
            <el-image :src="item.product.image" fit="cover">
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="product-info">
            <h3 @click="viewProduct(item.product)">{{ item.product.name }}</h3>
            <p class="price">¥{{ item.product.price }}</p>
            <p class="note" v-if="item.note">{{ item.note }}</p>
          </div>
        </el-card>
      </div>

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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, Search } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

// 状态
const folder = ref({})
const collections = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const searchQuery = ref('')
const sortBy = ref('created_at')

// 方法
const loadFolder = async () => {
  try {
    const response = await productStore.getCollectionShareFolder(route.params.code)
    folder.value = response.data
  } catch (error) {
    ElMessage.error('加载收藏夹失败')
  }
}

const loadCollections = async () => {
  try {
    const params = {
      share_code: route.params.code,
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value,
      sort: sortBy.value
    }
    const response = await productStore.getShareCollections(params)
    collections.value = response.data.results
    total.value = response.data.count
  } catch (error) {
    ElMessage.error('加载收藏商品失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadCollections()
}

const handleSort = () => {
  currentPage.value = 1
  loadCollections()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadCollections()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadCollections()
}

const viewProduct = (product) => {
  router.push(`/product/${product.id}`)
}

onMounted(() => {
  loadFolder()
  loadCollections()
})
</script>

<style scoped>
.collection-share {
  padding: 20px;
}

.share-info {
  margin-bottom: 20px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.folder-basic {
  display: flex;
  gap: 20px;
}

.folder-cover {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
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

.folder-detail {
  flex: 1;
}

.folder-detail h2 {
  margin: 0 0 10px;
  font-size: 24px;
}

.folder-detail p {
  margin: 0 0 10px;
  color: #666;
}

.folder-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.collection-content {
  margin-top: 20px;
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.collection-header .left {
  width: 300px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.product-card {
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.product-image {
  cursor: pointer;
}

.product-image .el-image {
  width: 100%;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
}

.product-info {
  padding: 15px 0;
}

.product-info h3 {
  margin: 0 0 10px;
  font-size: 16px;
  cursor: pointer;
}

.product-info h3:hover {
  color: #409EFF;
}

.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px;
}

.note {
  color: #909399;
  font-size: 12px;
  margin: 0 0 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 