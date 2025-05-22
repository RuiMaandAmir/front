<template>
  <div class="cart-container" :class="{ 'is-mobile': isMobileDevice }">
    <!-- 移动端头部 -->
    <div v-if="isMobileDevice" class="mobile-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="header-title">购物车</div>
      <div class="header-right">
        <el-button text @click="handleClearCart">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 购物车列表 -->
    <div class="cart-list" :class="{ 'mobile-list': isMobileDevice }">
      <el-empty
        v-if="cartStore.items.length === 0"
        description="购物车是空的"
        :class="{ 'mobile-empty': isMobileDevice }"
      >
        <el-button type="primary" @click="router.push('/')">
          去购物
        </el-button>
      </el-empty>

      <template v-else>
        <el-card
          v-for="item in cartStore.items"
          :key="item.id"
          class="cart-item"
        >
          <div class="item-content">
            <el-checkbox
              v-model="item.selected"
              @change="handleSelectChange"
            />
            <el-image
              :src="item.image"
              fit="cover"
              class="item-image"
              @click="router.push(`/product/${item.id}`)"
            />
            <div class="item-info">
              <h3 class="item-name" @click="router.push(`/product/${item.id}`)">
                {{ item.name }}
              </h3>
              <p class="item-price">¥{{ item.price }}</p>
              <div class="item-actions">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="99"
                  size="small"
                  @change="handleQuantityChange(item)"
                />
                <el-button
                  type="danger"
                  size="small"
                  @click="handleRemoveItem(item)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </template>
    </div>

    <!-- 底部结算栏 -->
    <div class="bottom-bar" :class="{ 'mobile-bottom-bar': isMobileDevice }">
      <div class="left-section">
        <el-checkbox
          v-model="selectAll"
          @change="handleSelectAllChange"
        >
          全选
        </el-checkbox>
      </div>
      <div class="right-section">
        <div class="total-info">
          <span>合计：</span>
          <span class="total-price">¥{{ totalPrice }}</span>
        </div>
        <el-button
          type="primary"
          :disabled="selectedCount === 0"
          @click="handleCheckout"
        >
          结算({{ selectedCount }})
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Delete } from '@element-plus/icons-vue'
import { isMobile, onResize, offResize } from '@/utils/responsive'
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/types/cart'

const router = useRouter()
const cartStore = useCartStore()

// 响应式状态
const isMobileDevice = ref(isMobile())
const selectAll = ref(false)

// 计算属性
const selectedCount = computed(() => {
  return cartStore.items.filter(item => item.selected).length
})

const totalPrice = computed(() => {
  return cartStore.items
    .filter(item => item.selected)
    .reduce((total, item) => total + item.price * item.quantity, 0)
    .toFixed(2)
})

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = isMobile()
}

// 处理全选变化
const handleSelectAllChange = (val: boolean) => {
  cartStore.items.forEach(item => {
    item.selected = val
  })
}

// 处理单个商品选择变化
const handleSelectChange = () => {
  selectAll.value = cartStore.items.every(item => item.selected)
}

// 处理数量变化
const handleQuantityChange = (item: CartItem) => {
  cartStore.updateItemQuantity(item.id, item.quantity)
}

// 处理删除商品
const handleRemoveItem = (item: CartItem) => {
  ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.removeItem(item.id)
    ElMessage.success('删除成功')
  })
}

// 处理清空购物车
const handleClearCart = () => {
  if (cartStore.items.length === 0) return
  
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.clearCart()
    ElMessage.success('购物车已清空')
  })
}

// 处理结算
const handleCheckout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  router.push('/checkout')
}

onMounted(() => {
  onResize(handleResize)
})

onUnmounted(() => {
  offResize(handleResize)
})
</script>

<style scoped>
.cart-container {
  padding-bottom: 60px;
}

.cart-list {
  padding: 20px;
}

.cart-item {
  margin-bottom: 20px;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  cursor: pointer;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0 0 10px;
  font-size: 16px;
  color: #303133;
  cursor: pointer;
}

.item-name:hover {
  color: #409eff;
}

.item-price {
  margin: 0 0 10px;
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
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
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-info {
  font-size: 14px;
  color: #606266;
}

.total-price {
  font-size: 20px;
  color: #f56c6c;
  font-weight: bold;
  margin-left: 5px;
}

/* 移动端样式 */
.is-mobile {
  padding-bottom: 50px;
}

.mobile-list {
  padding: 12px;
}

.mobile-list .cart-item {
  margin-bottom: 12px;
}

.mobile-list .item-content {
  gap: 12px;
}

.mobile-list .item-image {
  width: 80px;
  height: 80px;
}

.mobile-list .item-name {
  font-size: 14px;
  margin-bottom: 8px;
}

.mobile-list .item-price {
  font-size: 16px;
  margin-bottom: 8px;
}

.mobile-list .item-actions {
  gap: 8px;
}

.mobile-bottom-bar {
  padding: 0 12px;
}

.mobile-bottom-bar .right-section {
  gap: 12px;
}

.mobile-bottom-bar .total-info {
  font-size: 12px;
}

.mobile-bottom-bar .total-price {
  font-size: 18px;
}

.mobile-bottom-bar .el-button {
  padding: 8px 16px;
}
</style> 