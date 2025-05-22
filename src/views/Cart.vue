<template>
  <div class="cart-container" v-loading="loading">
    <el-card class="cart-card">
      <template #header>
        <div class="card-header">
          <h2>我的购物车</h2>
        </div>
      </template>

      <!-- 购物车为空时显示 -->
      <el-empty
        v-if="!cartItems.length"
        description="购物车是空的"
      >
        <el-button type="primary" @click="$router.push('/')">
          去购物
        </el-button>
      </el-empty>

      <!-- 购物车列表 -->
      <template v-else>
        <div class="cart-list">
          <el-table :data="cartItems" style="width: 100%">
            <el-table-column width="50">
              <template #default="{ row }">
                <el-checkbox
                  v-model="row.selected"
                  @change="handleSelectChange"
                />
              </template>
            </el-table-column>

            <el-table-column label="商品信息" min-width="400">
              <template #default="{ row }">
                <div class="product-info">
                  <img :src="row.product.images[0]" class="product-image" />
                  <div class="product-details">
                    <h3 class="product-name" @click="goToDetail(row.product.id)">
                      {{ row.product.name }}
                    </h3>
                    <div class="product-price">¥{{ row.product.price }}</div>
                  </div>
                </div>
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
                  @click="removeItem(row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 购物车底部 -->
        <div class="cart-footer">
          <div class="select-all">
            <el-checkbox
              v-model="selectAll"
              @change="handleSelectAllChange"
            >
              全选
            </el-checkbox>
          </div>
          <div class="cart-total">
            <span>已选择 {{ selectedCount }} 件商品</span>
            <span class="total-price">
              合计：<em>¥{{ totalPrice.toFixed(2) }}</em>
            </span>
          </div>
          <el-button
            type="danger"
            size="large"
            :disabled="!selectedCount"
            @click="checkout"
          >
            结算
          </el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCartStore } from '../stores/cart';
import type { CartItem } from '../types';

const router = useRouter();
const cartStore = useCartStore();

const loading = ref(false);
const cartItems = ref<CartItem[]>([]);
const selectAll = ref(false);

// 计算选中的商品数量
const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length;
});

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
});

// 加载购物车数据
const loadCartItems = async () => {
  try {
    loading.value = true;
    const response = await cartStore.getCartItems();
    cartItems.value = response.data.map(item => ({
      ...item,
      selected: false
    }));
  } catch (error) {
    ElMessage.error('加载购物车失败');
  } finally {
    loading.value = false;
  }
};

// 处理商品选择变化
const handleSelectChange = () => {
  selectAll.value = cartItems.value.every(item => item.selected);
};

// 处理全选变化
const handleSelectAllChange = (val: boolean) => {
  cartItems.value.forEach(item => {
    item.selected = val;
  });
};

// 处理数量变化
const handleQuantityChange = async (item: CartItem) => {
  try {
    await cartStore.updateCartItemQuantity(item.id, item.quantity);
    ElMessage.success('更新成功');
  } catch (error) {
    ElMessage.error('更新失败');
    // 恢复原数量
    await loadCartItems();
  }
};

// 删除商品
const removeItem = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
      type: 'warning'
    });
    
    await cartStore.removeCartItem(id);
    ElMessage.success('删除成功');
    await loadCartItems();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 跳转到商品详情
const goToDetail = (id: number) => {
  router.push(`/product/${id}`);
};

// 结算
const checkout = () => {
  const selectedItems = cartItems.value.filter(item => item.selected);
  if (selectedItems.length === 0) {
    ElMessage.warning('请选择要结算的商品');
    return;
  }
  
  // TODO: 跳转到结算页面
  router.push({
    name: 'Checkout',
    query: {
      items: selectedItems.map(item => item.id).join(',')
    }
  });
};

onMounted(() => {
  loadCartItems();
});
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.product-details {
  flex: 1;
}

.product-name {
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
}

.product-name:hover {
  color: #409eff;
}

.product-price {
  color: #f56c6c;
  font-size: 16px;
}

.subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.cart-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.cart-total {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-price {
  font-size: 16px;
}

.total-price em {
  color: #f56c6c;
  font-style: normal;
  font-size: 24px;
  font-weight: bold;
}
</style> 