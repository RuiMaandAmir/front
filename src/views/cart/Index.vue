<template>
  <div class="cart-page">
    <div class="cart-header">
      <h2>购物车</h2>
    </div>

    <div v-if="cartItems.length" class="cart-content">
      <!-- 购物车列表 -->
      <div class="cart-list">
        <el-table
          :data="cartItems"
          style="width: 100%"
        >
          <el-table-column width="50">
            <template #default="{ row }">
              <el-checkbox
                v-model="row.selected"
                @change="handleSelectChange"
              />
            </template>
          </el-table-column>

          <el-table-column label="商品信息">
            <template #default="{ row }">
              <div class="product-info">
                <el-image
                  :src="row.product.image"
                  :alt="row.product.name"
                  class="product-image"
                />
                <div class="product-detail">
                  <div class="product-name">{{ row.product.name }}</div>
                  <div class="product-specs" v-if="row.specifications">
                    {{ formatSpecifications(row.specifications) }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="单价" width="120">
            <template #default="{ row }">
              <span class="price">¥{{ row.product.price }}</span>
            </template>
          </el-table-column>

          <el-table-column label="数量" width="150">
            <template #default="{ row }">
              <el-input-number
                v-model="row.quantity"
                :min="1"
                :max="row.product.stock"
                @change="handleQuantityChange(row)"
              />
            </template>
          </el-table-column>

          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              <span class="subtotal">¥{{ (row.product.price * row.quantity).toFixed(2) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button
                type="danger"
                link
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 购物车底部 -->
      <div class="cart-footer">
        <div class="footer-left">
          <el-checkbox
            v-model="selectAll"
            @change="handleSelectAllChange"
          >
            全选
          </el-checkbox>
          <el-button
            type="danger"
            link
            @click="handleDeleteSelected"
            :disabled="!hasSelected"
          >
            删除选中
          </el-button>
        </div>

        <div class="footer-right">
          <div class="total-info">
            <span>已选择 {{ selectedCount }} 件商品</span>
            <span class="total-price">
              合计：<em>¥{{ totalPrice.toFixed(2) }}</em>
            </span>
          </div>
          <el-button
            type="primary"
            size="large"
            @click="handleCheckout"
            :disabled="!hasSelected"
          >
            结算
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空购物车 -->
    <el-empty
      v-else
      description="购物车是空的"
    >
      <el-button type="primary" @click="goShopping">
        去购物
      </el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const productStore = useProductStore()

// 购物车商品列表
const cartItems = ref([])

// 全选状态
const selectAll = ref(false)

// 计算属性
const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length
})

const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((total, item) => {
      return total + item.product.price * item.quantity
    }, 0)
})

const hasSelected = computed(() => {
  return selectedCount.value > 0
})

// 获取购物车列表
const getCartItems = async () => {
  try {
    const response = await productStore.getCartItems()
    cartItems.value = response.items.map(item => ({
      ...item,
      selected: false
    }))
  } catch (error) {
    console.error('获取购物车列表失败:', error)
    ElMessage.error('获取购物车列表失败，请重试')
  }
}

// 处理选择变化
const handleSelectChange = () => {
  selectAll.value = cartItems.value.every(item => item.selected)
}

// 处理全选变化
const handleSelectAllChange = (val: boolean) => {
  cartItems.value.forEach(item => {
    item.selected = val
  })
}

// 处理数量变化
const handleQuantityChange = async (item: any) => {
  try {
    await productStore.updateCartItem({
      id: item.id,
      quantity: item.quantity
    })
  } catch (error) {
    console.error('更新购物车失败:', error)
    ElMessage.error('更新失败，请重试')
    // 恢复原数量
    getCartItems()
  }
}

// 处理删除
const handleDelete = (item: any) => {
  ElMessageBox.confirm(
    '确定要删除该商品吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await productStore.deleteCartItem(item.id)
      const index = cartItems.value.findIndex(i => i.id === item.id)
      if (index > -1) {
        cartItems.value.splice(index, 1)
      }
      ElMessage.success('商品已删除')
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  })
}

// 处理删除选中
const handleDeleteSelected = () => {
  if (!hasSelected.value) return
  
  ElMessageBox.confirm(
    '确定要删除选中的商品吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const selectedIds = cartItems.value
        .filter(item => item.selected)
        .map(item => item.id)
      
      await productStore.deleteCartItems(selectedIds)
      cartItems.value = cartItems.value.filter(item => !item.selected)
      ElMessage.success('商品已删除')
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  })
}

// 处理结算
const handleCheckout = () => {
  const selectedItems = cartItems.value.filter(item => item.selected)
  if (selectedItems.length === 0) return
  
  router.push({
    path: '/checkout',
    query: {
      items: selectedItems.map(item => item.id).join(',')
    }
  })
}

// 去购物
const goShopping = () => {
  router.push('/products')
}

// 格式化规格
const formatSpecifications = (specs: Record<string, string>) => {
  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

onMounted(() => {
  getCartItems()
})
</script>

<style scoped>
.cart-page {
  padding: 20px;
}

.cart-header {
  margin-bottom: 20px;
}

.cart-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.cart-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.cart-list {
  padding: 20px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.product-detail {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 16px;
  color: #303133;
  margin-bottom: 5px;
}

.product-specs {
  font-size: 14px;
  color: #909399;
}

.price,
.subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #EBEEF5;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-info {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-right: 20px;
}

.total-price {
  font-size: 16px;
}

.total-price em {
  font-size: 24px;
  color: #f56c6c;
  font-style: normal;
  font-weight: bold;
}

@media (max-width: 768px) {
  .cart-footer {
    flex-direction: column;
    gap: 20px;
  }
  
  .footer-right {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .total-info {
    justify-content: space-between;
    margin-right: 0;
  }
}
</style> 