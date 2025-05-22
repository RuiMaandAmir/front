<template>
  <div class="favorite-container" :class="{ 'is-mobile': isMobileDevice }">
    <!-- 移动端头部 -->
    <div v-if="isMobileDevice" class="mobile-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="header-title">我的收藏</div>
      <div class="header-right">
        <el-button
          v-if="selectedItems.length > 0"
          text
          type="danger"
          @click="handleBatchDelete"
        >
          删除
        </el-button>
      </div>
    </div>

    <!-- 收藏列表 -->
    <div class="favorite-list">
      <el-empty
        v-if="favorites.length === 0"
        description="暂无收藏商品"
      >
        <el-button type="primary" @click="router.push('/')">
          去逛逛
        </el-button>
      </el-empty>
      <template v-else>
        <div
          v-for="item in favorites"
          :key="item.id"
          class="favorite-item"
          :class="{ 'mobile-item': isMobileDevice }"
        >
          <el-checkbox
            v-model="item.selected"
            @change="handleSelectChange"
          />
          <div
            class="item-content"
            @click="router.push(`/product/${item.id}`)"
          >
            <el-image
              :src="item.image"
              fit="cover"
              class="item-image"
            />
            <div class="item-info">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-price">¥{{ item.price }}</p>
            </div>
          </div>
          <div class="item-actions">
            <el-button
              type="primary"
              size="small"
              @click="handleAddToCart(item)"
            >
              加入购物车
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(item)"
            >
              删除
            </el-button>
          </div>
        </div>
      </template>
    </div>

    <!-- 底部操作栏 -->
    <div
      v-if="favorites.length > 0"
      class="bottom-bar"
      :class="{ 'mobile-bottom-bar': isMobileDevice }"
    >
      <div class="select-all">
        <el-checkbox
          v-model="selectAll"
          @change="handleSelectAllChange"
        >
          全选
        </el-checkbox>
      </div>
      <div class="action-buttons">
        <el-button
          type="danger"
          :disabled="selectedItems.length === 0"
          @click="handleBatchDelete"
        >
          删除({{ selectedItems.length }})
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { isMobile, onResize, offResize } from '@/utils/responsive'
import type { Product } from '@/types/user'

const router = useRouter()

// 响应式状态
const isMobileDevice = ref(isMobile())
const favorites = ref<(Product & { selected: boolean })[]>([])

// 计算属性
const selectAll = computed({
  get: () => favorites.value.length > 0 && favorites.value.every(item => item.selected),
  set: (value) => {
    favorites.value.forEach(item => {
      item.selected = value
    })
  }
})

const selectedItems = computed(() => {
  return favorites.value.filter(item => item.selected)
})

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = isMobile()
}

// 处理选择变化
const handleSelectChange = () => {
  // 可以在这里添加选择变化时的逻辑
}

// 处理全选变化
const handleSelectAllChange = (value: boolean) => {
  favorites.value.forEach(item => {
    item.selected = value
  })
}

// 处理加入购物车
const handleAddToCart = async (item: Product) => {
  try {
    // TODO: 实现加入购物车逻辑
    // await api.addToCart(item.id)
    ElMessage.success('已加入购物车')
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败')
  }
}

// 处理删除
const handleDelete = (item: Product) => {
  ElMessageBox.confirm('确定要删除该收藏商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // TODO: 实现删除收藏逻辑
      // await api.deleteFavorite(item.id)
      favorites.value = favorites.value.filter(f => f.id !== item.id)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 处理批量删除
const handleBatchDelete = () => {
  if (selectedItems.value.length === 0) return

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedItems.value.length} 个收藏商品吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // TODO: 实现批量删除逻辑
      // await api.batchDeleteFavorites(selectedItems.value.map(item => item.id))
      favorites.value = favorites.value.filter(item => !item.selected)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 获取收藏列表
const fetchFavorites = async () => {
  try {
    // TODO: 实现收藏列表获取逻辑
    // const response = await api.getFavorites()
    // favorites.value = response.data.map(item => ({ ...item, selected: false }))
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.error('获取收藏列表失败')
  }
}

onMounted(() => {
  fetchFavorites()
  onResize(handleResize)
})

onUnmounted(() => {
  offResize(handleResize)
})
</script>

<style scoped>
.favorite-container {
  padding: 20px;
  padding-bottom: 80px;
}

.favorite-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.item-content {
  flex: 1;
  display: flex;
  gap: 16px;
  cursor: pointer;
}

.item-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  margin: 0;
  font-size: 16px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-price {
  margin: 0;
  color: #f56c6c;
  font-size: 18px;
  font-weight: 500;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

/* 移动端样式 */
.is-mobile {
  padding: 0;
  padding-bottom: 60px;
}

.mobile-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.header-left,
.header-right {
  flex: 1;
}

.header-title {
  flex: 2;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.mobile-item {
  margin: 0 12px;
  padding: 12px;
  border-radius: 4px;
}

.mobile-item .item-image {
  width: 80px;
  height: 80px;
}

.mobile-item .item-name {
  font-size: 14px;
}

.mobile-item .item-price {
  font-size: 16px;
}

.mobile-item .item-actions {
  flex-direction: row;
}

.mobile-item .el-button {
  padding: 6px 12px;
  font-size: 12px;
}

.mobile-bottom-bar {
  padding: 8px 16px;
}

.mobile-bottom-bar .el-button {
  padding: 8px 16px;
  font-size: 14px;
}
</style> 