<template>
  <div class="order-list-container" :class="{ 'is-mobile': isMobileDevice }">
    <!-- 移动端头部 -->
    <div v-if="isMobileDevice" class="mobile-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="header-title">我的订单</div>
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
        placeholder="搜索订单号、商品名称"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <!-- 订单状态标签页 -->
    <el-tabs v-model="activeTab" class="order-tabs" :class="{ 'mobile-tabs': isMobileDevice }">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待付款" name="pending" />
      <el-tab-pane label="待发货" name="paid" />
      <el-tab-pane label="待收货" name="shipped" />
      <el-tab-pane label="已完成" name="completed" />
    </el-tabs>

    <!-- 订单列表 -->
    <div class="order-list" :class="{ 'mobile-list': isMobileDevice }">
      <el-empty
        v-if="orders.length === 0"
        description="暂无订单"
        :class="{ 'mobile-empty': isMobileDevice }"
      >
        <el-button type="primary" @click="router.push('/')">
          去购物
        </el-button>
      </el-empty>

      <template v-else>
        <el-card
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <div class="order-header">
            <span class="order-no">订单号：{{ order.order_no }}</span>
            <span class="order-status">{{ getStatusText(order.status) }}</span>
          </div>

          <div class="order-items">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="order-item"
              @click="router.push(`/product/${item.product_id}`)"
            >
              <el-image
                :src="item.image"
                fit="cover"
                class="item-image"
              />
              <div class="item-info">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-specs">{{ item.specs }}</p>
                <div class="item-price-qty">
                  <span class="item-price">¥{{ item.price }}</span>
                  <span class="item-quantity">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span>共{{ getTotalQuantity(order.items) }}件商品</span>
              <span>实付款：<em>¥{{ order.total_amount }}</em></span>
            </div>
            <div class="order-actions">
              <template v-if="order.status === 'pending'">
                <el-button size="small" @click="handleCancelOrder(order)">取消订单</el-button>
                <el-button type="primary" size="small" @click="handlePayOrder(order)">立即付款</el-button>
              </template>
              <template v-else-if="order.status === 'shipped'">
                <el-button size="small" @click="handleViewLogistics(order)">查看物流</el-button>
                <el-button type="primary" size="small" @click="handleConfirmReceive(order)">确认收货</el-button>
              </template>
              <template v-else-if="order.status === 'completed'">
                <el-button size="small" @click="handleDeleteOrder(order)">删除订单</el-button>
                <el-button type="primary" size="small" @click="handleBuyAgain(order)">再次购买</el-button>
              </template>
            </div>
          </div>
        </el-card>
      </template>
    </div>

    <!-- 分页 -->
    <div class="pagination" :class="{ 'mobile-pagination': isMobileDevice }">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
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
        <el-form-item label="订单状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Filter, Search } from '@element-plus/icons-vue'
import { isMobile, onResize, offResize } from '@/utils/responsive'
import type { Order, OrderItem } from '@/types/order'

const router = useRouter()

// 响应式状态
const isMobileDevice = ref(isMobile())
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const orders = ref<Order[]>([])
const activeTab = ref('all')
const showFilter = ref(false)

const filterForm = ref({
  status: '',
  dateRange: []
})

const statusOptions = [
  { label: '待付款', value: 'pending' },
  { label: '待发货', value: 'paid' },
  { label: '待收货', value: 'shipped' },
  { label: '已完成', value: 'completed' }
]

// 监听窗口大小变化
const handleResize = () => {
  isMobileDevice.value = isMobile()
}

// 获取状态文本
const getStatusText = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option ? option.label : status
}

// 获取商品总数量
const getTotalQuantity = (items: OrderItem[]) => {
  return items.reduce((total, item) => total + item.quantity, 0)
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1
  showFilter.value = false
  fetchOrders()
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    status: '',
    dateRange: []
  }
  handleFilter()
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchOrders()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchOrders()
}

// 处理订单操作
const handleCancelOrder = (order: Order) => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 实现取消订单逻辑
    ElMessage.success('订单已取消')
  })
}

const handlePayOrder = (order: Order) => {
  router.push(`/payment/${order.id}`)
}

const handleViewLogistics = (order: Order) => {
  router.push(`/logistics/${order.id}`)
}

const handleConfirmReceive = (order: Order) => {
  ElMessageBox.confirm('确认已收到商品？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 实现确认收货逻辑
    ElMessage.success('确认收货成功')
  })
}

const handleDeleteOrder = (order: Order) => {
  ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 实现删除订单逻辑
    ElMessage.success('订单已删除')
  })
}

const handleBuyAgain = (order: Order) => {
  // TODO: 实现再次购买逻辑
  router.push('/cart')
}

// 获取订单列表
const fetchOrders = async () => {
  try {
    // TODO: 实现订单列表获取逻辑
    // const response = await api.getOrders({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   search: searchQuery.value,
    //   status: activeTab.value === 'all' ? '' : activeTab.value,
    //   ...filterForm.value
    // })
    // orders.value = response.data.items
    // total.value = response.data.total
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  }
}

onMounted(() => {
  fetchOrders()
  onResize(handleResize)
})

onUnmounted(() => {
  offResize(handleResize)
})
</script>

<style scoped>
.order-list-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.order-tabs {
  margin-bottom: 20px;
}

.order-list {
  margin-bottom: 20px;
}

.order-card {
  margin-bottom: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.order-no {
  color: #606266;
  font-size: 14px;
}

.order-status {
  color: #f56c6c;
  font-weight: 500;
}

.order-items {
  padding: 12px 0;
}

.order-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  cursor: pointer;
}

.order-item:not(:last-child) {
  border-bottom: 1px solid #ebeef5;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0 0 8px;
  font-size: 14px;
  color: #303133;
}

.item-specs {
  margin: 0 0 8px;
  font-size: 12px;
  color: #909399;
}

.item-price-qty {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  color: #f56c6c;
  font-weight: 500;
}

.item-quantity {
  color: #909399;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.order-total {
  color: #606266;
  font-size: 14px;
}

.order-total em {
  color: #f56c6c;
  font-style: normal;
  font-weight: 500;
  margin-left: 8px;
}

.order-actions {
  display: flex;
  gap: 8px;
}

/* 移动端样式 */
.is-mobile {
  padding: 0;
}

.mobile-search {
  margin: 0;
  padding: 12px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.mobile-list {
  padding: 12px;
}

.mobile-list .order-card {
  margin-bottom: 12px;
}

.mobile-list .order-item {
  padding: 8px 0;
}

.mobile-list .item-image {
  width: 60px;
  height: 60px;
}

.mobile-list .item-name {
  font-size: 13px;
  margin-bottom: 6px;
}

.mobile-list .item-specs {
  font-size: 11px;
  margin-bottom: 6px;
}

.mobile-list .order-footer {
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.mobile-list .order-total {
  font-size: 12px;
}

.mobile-list .order-actions {
  width: 100%;
  justify-content: flex-end;
}

.mobile-list .order-actions .el-button {
  padding: 6px 12px;
  font-size: 12px;
}
</style> 