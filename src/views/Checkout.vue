<template>
  <div class="checkout-container" v-loading="loading">
    <el-card class="checkout-card">
      <template #header>
        <div class="card-header">
          <h2>确认订单</h2>
        </div>
      </template>

      <!-- 收货地址 -->
      <div class="section address-section">
        <h3 class="section-title">收货地址</h3>
        <div v-if="addresses.length" class="address-list">
          <el-radio-group v-model="selectedAddressId">
            <el-radio
              v-for="address in addresses"
              :key="address.id"
              :label="address.id"
              class="address-item"
            >
              <div class="address-content">
                <div class="address-info">
                  <span class="name">{{ address.name }}</span>
                  <span class="phone">{{ address.phone }}</span>
                </div>
                <div class="address-detail">
                  {{ address.province }} {{ address.city }} {{ address.district }}
                  {{ address.detail }}
                </div>
              </div>
            </el-radio>
          </el-radio-group>
        </div>
        <el-button
          v-else
          type="primary"
          plain
          @click="showAddressDialog = true"
        >
          添加收货地址
        </el-button>
      </div>

      <!-- 商品列表 -->
      <div class="section order-section">
        <h3 class="section-title">商品信息</h3>
        <el-table :data="orderItems" style="width: 100%">
          <el-table-column label="商品信息" min-width="400">
            <template #default="{ row }">
              <div class="product-info">
                <img :src="row.product.images[0]" class="product-image" />
                <div class="product-details">
                  <h3 class="product-name">{{ row.product.name }}</h3>
                  <div class="product-price">¥{{ row.product.price }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="数量" width="100">
            <template #default="{ row }">
              {{ row.quantity }}
            </template>
          </el-table-column>

          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              <span class="subtotal">¥{{ (row.product.price * row.quantity).toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 订单备注 -->
      <div class="section remark-section">
        <h3 class="section-title">订单备注</h3>
        <el-input
          v-model="remark"
          type="textarea"
          :rows="3"
          placeholder="请输入订单备注（选填）"
        />
      </div>

      <!-- 订单金额 -->
      <div class="section amount-section">
        <div class="amount-item">
          <span>商品总额：</span>
          <span>¥{{ totalAmount.toFixed(2) }}</span>
        </div>
        <div class="amount-item">
          <span>运费：</span>
          <span>¥{{ shippingFee.toFixed(2) }}</span>
        </div>
        <div class="amount-item total">
          <span>实付金额：</span>
          <span class="final-amount">¥{{ finalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 提交订单 -->
      <div class="submit-section">
        <el-button
          type="danger"
          size="large"
          :loading="submitting"
          :disabled="!selectedAddressId"
          @click="submitOrder"
        >
          提交订单
        </el-button>
      </div>
    </el-card>

    <!-- 添加地址对话框 -->
    <el-dialog
      v-model="showAddressDialog"
      title="添加收货地址"
      width="500px"
    >
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressRules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="addressForm.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addressForm.phone" />
        </el-form-item>
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="addressForm.region"
            :options="regionOptions"
            placeholder="请选择省/市/区"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="addressForm.detail"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useOrderStore } from '../stores/order';
import { useAddressStore } from '../stores/address';
import type { Address, OrderItem } from '../types';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const addressStore = useAddressStore();

const loading = ref(false);
const submitting = ref(false);
const orderItems = ref<OrderItem[]>([]);
const addresses = ref<Address[]>([]);
const selectedAddressId = ref<number>();
const remark = ref('');

// 地址表单相关
const showAddressDialog = ref(false);
const addressFormRef = ref();
const addressForm = ref({
  name: '',
  phone: '',
  region: [],
  detail: '',
});

const addressRules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'change' },
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
  ],
};

// 计算订单金额
const totalAmount = computed(() => {
  return orderItems.value.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
});

const shippingFee = computed(() => {
  // 这里可以根据实际情况计算运费
  return 10;
});

const finalAmount = computed(() => {
  return totalAmount.value + shippingFee.value;
});

// 加载订单商品
const loadOrderItems = async () => {
  try {
    loading.value = true;
    const itemIds = (route.query.items as string).split(',');
    const response = await orderStore.getOrderItems(itemIds);
    orderItems.value = response.data;
  } catch (error) {
    ElMessage.error('加载订单信息失败');
  } finally {
    loading.value = false;
  }
};

// 加载收货地址
const loadAddresses = async () => {
  try {
    const response = await addressStore.getAddresses();
    addresses.value = response.data;
    if (addresses.value.length > 0) {
      selectedAddressId.value = addresses.value[0].id;
    }
  } catch (error) {
    ElMessage.error('加载收货地址失败');
  }
};

// 保存收货地址
const saveAddress = async () => {
  if (!addressFormRef.value) return;

  try {
    await addressFormRef.value.validate();
    const [province, city, district] = addressForm.value.region;
    
    await addressStore.addAddress({
      name: addressForm.value.name,
      phone: addressForm.value.phone,
      province,
      city,
      district,
      detail: addressForm.value.detail,
    });

    ElMessage.success('添加地址成功');
    showAddressDialog.value = false;
    await loadAddresses();
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error('添加地址失败');
    }
  }
};

// 提交订单
const submitOrder = async () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址');
    return;
  }

  try {
    submitting.value = true;
    const response = await orderStore.createOrder({
      address_id: selectedAddressId.value,
      items: orderItems.value.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      remark: remark.value,
    });

    ElMessage.success('订单提交成功');
    // 跳转到支付页面
    router.push({
      name: 'Payment',
      params: { orderId: response.data.id }
    });
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error('提交订单失败');
    }
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadOrderItems();
  loadAddresses();
});
</script>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-card {
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

.section {
  margin-bottom: 30px;
}

.section-title {
  margin: 0 0 20px;
  font-size: 16px;
  color: #333;
}

.address-list {
  margin-bottom: 20px;
}

.address-item {
  display: block;
  margin-bottom: 10px;
}

.address-content {
  padding: 10px;
}

.address-info {
  margin-bottom: 5px;
}

.address-info .name {
  margin-right: 10px;
  font-weight: bold;
}

.address-detail {
  color: #666;
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
}

.product-price {
  color: #f56c6c;
  font-size: 16px;
}

.subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.amount-section {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
}

.amount-item {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.amount-item.total {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
  font-size: 16px;
}

.final-amount {
  color: #f56c6c;
  font-size: 24px;
  font-weight: bold;
}

.submit-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
}
</style> 