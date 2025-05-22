<template>
  <div class="profile-container" v-loading="loading">
    <el-row :gutter="20">
      <!-- 左侧导航 -->
      <el-col :span="6">
        <el-card class="menu-card">
          <div class="user-info">
            <el-avatar :size="80" :src="userInfo.avatar || defaultAvatar" />
            <h3 class="username">{{ userInfo.username }}</h3>
          </div>
          <el-menu
            :default-active="activeMenu"
            class="profile-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="orders">
              <el-icon><Document /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="addresses">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </el-menu-item>
            <el-menu-item index="affiliate">
              <el-icon><Share /></el-icon>
              <span>分销中心</span>
            </el-menu-item>
            <el-menu-item index="settings">
              <el-icon><Setting /></el-icon>
              <span>账号设置</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 右侧内容 -->
      <el-col :span="18">
        <!-- 订单列表 -->
        <el-card v-if="activeMenu === 'orders'" class="content-card">
          <template #header>
            <div class="card-header">
              <h3>我的订单</h3>
              <el-radio-group v-model="orderStatus" size="small">
                <el-radio-button label="">全部</el-radio-button>
                <el-radio-button label="pending">待付款</el-radio-button>
                <el-radio-button label="paid">待发货</el-radio-button>
                <el-radio-button label="shipped">待收货</el-radio-button>
                <el-radio-button label="completed">已完成</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <el-table :data="orders" style="width: 100%" v-loading="ordersLoading">
            <el-table-column prop="order_no" label="订单编号" width="180" />
            <el-table-column label="商品信息" min-width="300">
              <template #default="{ row }">
                <div class="order-products">
                  <div v-for="item in row.items" :key="item.id" class="product-item">
                    <img :src="item.product.images[0]" class="product-image" />
                    <div class="product-info">
                      <div class="product-name">{{ item.product.name }}</div>
                      <div class="product-price">¥{{ item.product.price }} × {{ item.quantity }}</div>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="total_amount" label="订单金额" width="120">
              <template #default="{ row }">
                ¥{{ row.total_amount }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="订单状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getOrderStatusType(row.status)">
                  {{ getOrderStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'pending'"
                  type="primary"
                  link
                  @click="handlePay(row)"
                >
                  去支付
                </el-button>
                <el-button
                  v-if="row.status === 'shipped'"
                  type="success"
                  link
                  @click="handleConfirmReceive(row)"
                >
                  确认收货
                </el-button>
                <el-button
                  v-if="row.status === 'completed'"
                  type="primary"
                  link
                  @click="handleReview(row)"
                >
                  评价
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>

        <!-- 收货地址 -->
        <el-card v-if="activeMenu === 'addresses'" class="content-card">
          <template #header>
            <div class="card-header">
              <h3>收货地址</h3>
              <el-button type="primary" @click="showAddressDialog = true">
                添加新地址
              </el-button>
            </div>
          </template>

          <div class="address-list">
            <el-card
              v-for="address in addresses"
              :key="address.id"
              class="address-card"
              shadow="hover"
            >
              <div class="address-content">
                <div class="address-info">
                  <span class="name">{{ address.name }}</span>
                  <span class="phone">{{ address.phone }}</span>
                  <el-tag v-if="address.is_default" size="small" type="success">默认</el-tag>
                </div>
                <div class="address-detail">
                  {{ address.province }} {{ address.city }} {{ address.district }}
                  {{ address.detail }}
                </div>
              </div>
              <div class="address-actions">
                <el-button
                  v-if="!address.is_default"
                  type="primary"
                  link
                  @click="setDefaultAddress(address)"
                >
                  设为默认
                </el-button>
                <el-button type="primary" link @click="editAddress(address)">
                  编辑
                </el-button>
                <el-button type="danger" link @click="deleteAddress(address)">
                  删除
                </el-button>
              </div>
            </el-card>
          </div>
        </el-card>

        <!-- 分销中心 -->
        <el-card v-if="activeMenu === 'affiliate'" class="content-card">
          <template #header>
            <div class="card-header">
              <h3>分销中心</h3>
            </div>
          </template>

          <div class="affiliate-stats">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card shadow="hover" class="stat-card">
                  <div class="stat-title">总佣金</div>
                  <div class="stat-value">¥{{ affiliateStats.total_commission }}</div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover" class="stat-card">
                  <div class="stat-title">待结算佣金</div>
                  <div class="stat-value">¥{{ affiliateStats.pending_commission }}</div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover" class="stat-card">
                  <div class="stat-title">已结算佣金</div>
                  <div class="stat-value">¥{{ affiliateStats.settled_commission }}</div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <div class="affiliate-links">
            <h4>我的推广链接</h4>
            <el-table :data="affiliateLinks" style="width: 100%">
              <el-table-column prop="product.name" label="商品名称" />
              <el-table-column prop="clicks" label="点击次数" width="100" />
              <el-table-column prop="conversions" label="转化次数" width="100" />
              <el-table-column label="推广链接" min-width="300">
                <template #default="{ row }">
                  <el-input
                    v-model="row.link"
                    readonly
                    class="link-input"
                  >
                    <template #append>
                      <el-button @click="copyLink(row.link)">复制</el-button>
                    </template>
                  </el-input>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <!-- 账号设置 -->
        <el-card v-if="activeMenu === 'settings'" class="content-card">
          <template #header>
            <div class="card-header">
              <h3>账号设置</h3>
            </div>
          </template>

          <el-form
            ref="settingsFormRef"
            :model="settingsForm"
            :rules="settingsRules"
            label-width="100px"
          >
            <el-form-item label="头像">
              <el-upload
                class="avatar-uploader"
                :action="uploadUrl"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="settingsForm.avatar" :src="settingsForm.avatar" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>

            <el-form-item label="用户名" prop="username">
              <el-input v-model="settingsForm.username" />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="settingsForm.phone" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="settingsForm.email" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveSettings">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 地址编辑对话框 -->
    <el-dialog
      v-model="showAddressDialog"
      :title="editingAddress ? '编辑地址' : '添加地址'"
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
        <el-form-item>
          <el-checkbox v-model="addressForm.is_default">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">确定</el-button>
      </template>
    </el-dialog>

    <!-- 评价对话框 -->
    <el-dialog
      v-model="showReviewDialog"
      title="商品评价"
      width="500px"
    >
      <el-form
        ref="reviewFormRef"
        :model="reviewForm"
        :rules="reviewRules"
        label-width="80px"
      >
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="reviewForm.rating" />
        </el-form-item>
        <el-form-item label="评价内容" prop="content">
          <el-input
            v-model="reviewForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入您的评价内容"
          />
        </el-form-item>
        <el-form-item label="上传图片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleReviewImageChange"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReviewDialog = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交评价</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Location, Share, Setting, Plus } from '@element-plus/icons-vue';
import { useUserStore } from '../stores/user';
import { useOrderStore } from '../stores/order';
import { useAddressStore } from '../stores/address';
import { useAffiliateStore } from '../stores/affiliate';
import type { User, Order, Address, AffiliateStats, AffiliateLink } from '../types';

const router = useRouter();
const userStore = useUserStore();
const orderStore = useOrderStore();
const addressStore = useAddressStore();
const affiliateStore = useAffiliateStore();

// 状态变量
const loading = ref(false);
const activeMenu = ref('orders');
const userInfo = ref<User>({} as User);
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 订单相关
const orders = ref<Order[]>([]);
const ordersLoading = ref(false);
const orderStatus = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 地址相关
const addresses = ref<Address[]>([]);
const showAddressDialog = ref(false);
const editingAddress = ref<Address | null>(null);
const addressFormRef = ref();
const addressForm = ref({
  name: '',
  phone: '',
  region: [],
  detail: '',
  is_default: false,
});

// 分销相关
const affiliateStats = ref<AffiliateStats>({} as AffiliateStats);
const affiliateLinks = ref<AffiliateLink[]>([]);

// 设置相关
const settingsFormRef = ref();
const settingsForm = ref({
  username: '',
  phone: '',
  email: '',
  avatar: '',
});

// 评价相关
const showReviewDialog = ref(false);
const reviewFormRef = ref();
const reviewForm = ref({
  rating: 5,
  content: '',
  images: [] as File[],
});
const currentOrder = ref<Order | null>(null);

// 表单验证规则
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

const settingsRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
};

const reviewRules = {
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' },
  ],
  content: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' },
  ],
};

// 加载用户信息
const loadUserInfo = async () => {
  try {
    loading.value = true;
    const response = await userStore.getUserInfo();
    userInfo.value = response.data;
    settingsForm.value = {
      username: response.data.username,
      phone: response.data.phone,
      email: response.data.email,
      avatar: response.data.avatar,
    };
  } catch (error) {
    ElMessage.error('加载用户信息失败');
  } finally {
    loading.value = false;
  }
};

// 加载订单列表
const loadOrders = async () => {
  try {
    ordersLoading.value = true;
    const response = await orderStore.getOrders({
      status: orderStatus.value,
      page: currentPage.value,
      page_size: pageSize.value,
    });
    orders.value = response.data.items;
    total.value = response.data.total;
  } catch (error) {
    ElMessage.error('加载订单列表失败');
  } finally {
    ordersLoading.value = false;
  }
};

// 加载收货地址
const loadAddresses = async () => {
  try {
    const response = await addressStore.getAddresses();
    addresses.value = response.data;
  } catch (error) {
    ElMessage.error('加载收货地址失败');
  }
};

// 加载分销数据
const loadAffiliateData = async () => {
  try {
    const [statsResponse, linksResponse] = await Promise.all([
      affiliateStore.getAffiliateStats(),
      affiliateStore.getAffiliateLinks(),
    ]);
    affiliateStats.value = statsResponse.data;
    affiliateLinks.value = linksResponse.data;
  } catch (error) {
    ElMessage.error('加载分销数据失败');
  }
};

// 处理菜单选择
const handleMenuSelect = (key: string) => {
  activeMenu.value = key;
  switch (key) {
    case 'orders':
      loadOrders();
      break;
    case 'addresses':
      loadAddresses();
      break;
    case 'affiliate':
      loadAffiliateData();
      break;
  }
};

// 处理订单状态变化
const handleOrderStatusChange = () => {
  currentPage.value = 1;
  loadOrders();
};

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  loadOrders();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loadOrders();
};

// 获取订单状态类型
const getOrderStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'success',
    completed: 'info',
    cancelled: 'danger',
  };
  return types[status] || 'info';
};

// 获取订单状态文本
const getOrderStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
  };
  return texts[status] || status;
};

// 处理支付
const handlePay = (order: Order) => {
  router.push({
    name: 'Payment',
    params: { orderId: order.id }
  });
};

// 处理确认收货
const handleConfirmReceive = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '提示', {
      type: 'warning'
    });
    
    await orderStore.confirmReceive(order.id);
    ElMessage.success('确认收货成功');
    loadOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('确认收货失败');
    }
  }
};

// 处理评价
const handleReview = (order: Order) => {
  currentOrder.value = order;
  showReviewDialog.value = true;
};

// 处理评价图片上传
const handleReviewImageChange = (file: File) => {
  reviewForm.value.images.push(file);
};

// 提交评价
const submitReview = async () => {
  if (!reviewFormRef.value || !currentOrder.value) return;

  try {
    await reviewFormRef.value.validate();
    await orderStore.createReview({
      order_id: currentOrder.value.id,
      rating: reviewForm.value.rating,
      content: reviewForm.value.content,
      images: reviewForm.value.images,
    });

    ElMessage.success('评价提交成功');
    showReviewDialog.value = false;
    loadOrders();
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error('评价提交失败');
    }
  }
};

// 编辑地址
const editAddress = (address: Address) => {
  editingAddress.value = address;
  addressForm.value = {
    name: address.name,
    phone: address.phone,
    region: [address.province, address.city, address.district],
    detail: address.detail,
    is_default: address.is_default,
  };
  showAddressDialog.value = true;
};

// 删除地址
const deleteAddress = async (address: Address) => {
  try {
    await ElMessageBox.confirm('确定要删除这个地址吗？', '提示', {
      type: 'warning'
    });
    
    await addressStore.deleteAddress(address.id);
    ElMessage.success('删除成功');
    loadAddresses();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 设置默认地址
const setDefaultAddress = async (address: Address) => {
  try {
    await addressStore.setDefaultAddress(address.id);
    ElMessage.success('设置成功');
    loadAddresses();
  } catch (error) {
    ElMessage.error('设置失败');
  }
};

// 保存地址
const saveAddress = async () => {
  if (!addressFormRef.value) return;

  try {
    await addressFormRef.value.validate();
    const [province, city, district] = addressForm.value.region;
    
    if (editingAddress.value) {
      await addressStore.updateAddress(editingAddress.value.id, {
        name: addressForm.value.name,
        phone: addressForm.value.phone,
        province,
        city,
        district,
        detail: addressForm.value.detail,
        is_default: addressForm.value.is_default,
      });
    } else {
      await addressStore.addAddress({
        name: addressForm.value.name,
        phone: addressForm.value.phone,
        province,
        city,
        district,
        detail: addressForm.value.detail,
        is_default: addressForm.value.is_default,
      });
    }

    ElMessage.success(editingAddress.value ? '修改成功' : '添加成功');
    showAddressDialog.value = false;
    loadAddresses();
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error(editingAddress.value ? '修改失败' : '添加失败');
    }
  }
};

// 保存设置
const saveSettings = async () => {
  if (!settingsFormRef.value) return;

  try {
    await settingsFormRef.value.validate();
    await userStore.updateUserInfo(settingsForm.value);
    ElMessage.success('保存成功');
    loadUserInfo();
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error('保存失败');
    }
  }
};

// 复制链接
const copyLink = (link: string) => {
  navigator.clipboard.writeText(link).then(() => {
    ElMessage.success('复制成功');
  }).catch(() => {
    ElMessage.error('复制失败');
  });
};

onMounted(() => {
  loadUserInfo();
  loadOrders();
});
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.menu-card {
  margin-bottom: 20px;
}

.user-info {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.username {
  margin: 10px 0 0;
  font-size: 16px;
  color: #333;
}

.profile-menu {
  border-right: none;
}

.content-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
}

.order-products {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.product-info {
  flex: 1;
}

.product-name {
  margin: 0 0 5px;
  font-size: 14px;
  color: #333;
}

.product-price {
  font-size: 12px;
  color: #999;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.address-card {
  margin-bottom: 0;
}

.address-content {
  margin-bottom: 10px;
}

.address-info {
  margin-bottom: 5px;
}

.address-info .name {
  margin-right: 10px;
  font-weight: bold;
}

.address-info .phone {
  color: #666;
}

.address-detail {
  color: #666;
  font-size: 14px;
}

.address-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.affiliate-stats {
  margin-bottom: 30px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-title {
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  color: #f56c6c;
  font-weight: bold;
}

.affiliate-links {
  margin-top: 30px;
}

.affiliate-links h4 {
  margin: 0 0 20px;
  font-size: 16px;
  color: #333;
}

.link-input {
  width: 100%;
}

.avatar-uploader {
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
}

.avatar-uploader-icon:hover {
  border-color: #409eff;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }

  .el-row {
    margin: 0 !important;
  }

  .el-col {
    padding: 0 !important;
  }

  .menu-card {
    margin-bottom: 10px;
  }

  .user-info {
    padding: 15px 0;
  }

  .username {
    font-size: 14px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .card-header h3 {
    font-size: 16px;
  }

  .el-radio-group {
    width: 100%;
    display: flex;
    overflow-x: auto;
    padding-bottom: 5px;
  }

  .el-radio-button {
    flex-shrink: 0;
  }

  .address-list {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 15px;
  }

  .stat-value {
    font-size: 20px;
  }

  .el-form-item {
    margin-bottom: 15px;
  }

  .el-dialog {
    width: 90% !important;
    margin: 0 auto;
  }
}

/* 小屏幕手机适配 */
@media screen and (max-width: 375px) {
  .profile-container {
    padding: 5px;
  }

  .user-info {
    padding: 10px 0;
  }

  .el-avatar {
    width: 60px !important;
    height: 60px !important;
  }

  .username {
    font-size: 12px;
  }

  .product-image {
    width: 40px;
    height: 40px;
  }

  .product-name {
    font-size: 12px;
  }

  .product-price {
    font-size: 10px;
  }

  .stat-card {
    padding: 10px;
  }

  .stat-title {
    font-size: 12px;
  }

  .stat-value {
    font-size: 18px;
  }

  .el-form-item__label {
    font-size: 12px;
  }

  .el-input__inner {
    font-size: 12px;
  }

  .el-button {
    font-size: 12px;
  }
}
</style> 