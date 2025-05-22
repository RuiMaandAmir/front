<template>
  <div class="order-page">
    <div class="order-header">
      <h2>我的订单</h2>
    </div>

    <!-- 订单状态标签页 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待付款" name="pending" />
      <el-tab-pane label="待发货" name="paid" />
      <el-tab-pane label="待收货" name="shipped" />
      <el-tab-pane label="已完成" name="completed" />
      <el-tab-pane label="已取消" name="cancelled" />
    </el-tabs>

    <!-- 订单列表 -->
    <div class="order-list">
      <div
        v-for="order in orders"
        :key="order.id"
        class="order-item"
      >
        <div class="order-header">
          <div class="order-info">
            <span class="order-no">订单号：{{ order.order_no }}</span>
            <span class="order-time">{{ formatTime(order.created_at) }}</span>
          </div>
          <div class="order-status">
            <el-tag :type="getStatusType(order.status)">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>
        </div>

        <div class="order-content">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="order-product"
          >
            <el-image
              :src="item.product.image"
              :alt="item.product.name"
              class="product-image"
            />
            <div class="product-info">
              <div class="product-name">{{ item.product.name }}</div>
              <div class="product-specs" v-if="item.specifications">
                {{ formatSpecifications(item.specifications) }}
              </div>
              <div class="product-price">
                <span class="price">¥{{ item.price }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            共 {{ getTotalQuantity(order) }} 件商品
            合计：<span class="total-price">¥{{ order.total_amount }}</span>
          </div>
          <div class="order-actions">
            <el-button
              v-if="order.status === 'pending'"
              type="primary"
              @click="handlePay(order)"
            >
              立即付款
            </el-button>
            <el-button
              v-if="order.status === 'shipped'"
              type="success"
              @click="handleConfirmReceive(order)"
            >
              确认收货
            </el-button>
            <el-button
              v-if="order.status === 'completed'"
              type="primary"
              @click="handleReview(order)"
            >
              评价
            </el-button>
            <el-button
              v-if="order.status === 'pending'"
              type="danger"
              @click="handleCancel(order)"
            >
              取消订单
            </el-button>
            <el-button
              type="primary"
              link
              @click="showOrderDetail(order)"
            >
              查看详情
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!orders.length"
        description="暂无订单"
      >
        <el-button type="primary" @click="goShopping">
          去购物
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="800px"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            {{ currentOrder.order_no }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTime(currentOrder.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ currentOrder.paid_at ? formatTime(currentOrder.paid_at) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="发货时间">
            {{ currentOrder.shipped_at ? formatTime(currentOrder.shipped_at) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ currentOrder.completed_at ? formatTime(currentOrder.completed_at) : '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>收货信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="收货人">
              {{ currentOrder.address.name }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ currentOrder.address.phone }}
            </el-descriptions-item>
            <el-descriptions-item label="收货地址">
              {{ formatAddress(currentOrder.address) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>商品信息</h4>
          <el-table :data="currentOrder.items" style="width: 100%">
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
            <el-table-column prop="price" label="单价" width="120">
              <template #default="{ row }">
                ¥{{ row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column label="小计" width="120">
              <template #default="{ row }">
                ¥{{ (row.price * row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="detail-section">
          <h4>订单金额</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="商品总额">
              ¥{{ currentOrder.total_amount }}
            </el-descriptions-item>
            <el-descriptions-item label="运费">
              ¥{{ currentOrder.shipping_fee }}
            </el-descriptions-item>
            <el-descriptions-item label="优惠金额">
              -¥{{ currentOrder.discount_amount }}
            </el-descriptions-item>
            <el-descriptions-item label="实付金额">
              ¥{{ currentOrder.paid_amount }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section" v-if="currentOrder.distribution_info">
          <h4>分销信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="分销商">
              {{ currentOrder.distribution_info.distributor_name }}
            </el-descriptions-item>
            <el-descriptions-item label="佣金比例">
              {{ currentOrder.distribution_info.commission_rate }}%
            </el-descriptions-item>
            <el-descriptions-item label="佣金金额">
              ¥{{ currentOrder.distribution_info.commission_amount }}
            </el-descriptions-item>
            <el-descriptions-item label="结算状态">
              <el-tag :type="getCommissionStatusType(currentOrder.distribution_info.status)">
                {{ getCommissionStatusText(currentOrder.distribution_info.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const productStore = useProductStore()

// 订单列表
const orders = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const activeTab = ref('all')

// 订单详情
const detailDialogVisible = ref(false)
const currentOrder = ref(null)

// 获取订单列表
const getOrders = async () => {
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      status: activeTab.value === 'all' ? '' : activeTab.value
    }
    const response = await productStore.getOrders(params)
    orders.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败，请重试')
  }
}

// 处理标签页切换
const handleTabChange = () => {
  currentPage.value = 1
  getOrders()
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getOrders()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getOrders()
}

// 显示订单详情
const showOrderDetail = (order: any) => {
  currentOrder.value = order
  detailDialogVisible.value = true
}

// 处理支付
const handlePay = (order: any) => {
  router.push({
    path: '/payment',
    query: {
      order_id: order.id
    }
  })
}

// 处理确认收货
const handleConfirmReceive = (order: any) => {
  ElMessageBox.confirm(
    '确认已收到商品？',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await productStore.confirmOrder(order.id)
      ElMessage.success('确认收货成功')
      getOrders()
    } catch (error) {
      console.error('确认收货失败:', error)
      ElMessage.error('确认收货失败，请重试')
    }
  })
}

// 处理评价
const handleReview = (order: any) => {
  router.push({
    path: '/review',
    query: {
      order_id: order.id
    }
  })
}

// 处理取消订单
const handleCancel = (order: any) => {
  ElMessageBox.confirm(
    '确定要取消该订单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await productStore.cancelOrder(order.id)
      ElMessage.success('订单已取消')
      getOrders()
    } catch (error) {
      console.error('取消订单失败:', error)
      ElMessage.error('取消失败，请重试')
    }
  })
}

// 去购物
const goShopping = () => {
  router.push('/products')
}

// 获取订单状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'success',
    completed: 'info',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取订单状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 获取佣金状态类型
const getCommissionStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    settled: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取佣金状态文本
const getCommissionStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待结算',
    settled: '已结算',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 计算订单商品总数
const getTotalQuantity = (order: any) => {
  return order.items.reduce((total: number, item: any) => {
    return total + item.quantity
  }, 0)
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化规格
const formatSpecifications = (specs: Record<string, string>) => {
  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

// 格式化地址
const formatAddress = (address: any) => {
  return `${address.province} ${address.city} ${address.district} ${address.detail}`
}

onMounted(() => {
  getOrders()
})
</script>

<style scoped>
.order-page {
  padding: 20px;
}

.order-header {
  margin-bottom: 20px;
}

.order-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.order-list {
  margin-top: 20px;
}

.order-item {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #EBEEF5;
}

.order-info {
  display: flex;
  gap: 20px;
}

.order-no {
  color: #303133;
  font-weight: bold;
}

.order-time {
  color: #909399;
}

.order-content {
  padding: 20px;
}

.order-product {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.order-product:last-child {
  margin-bottom: 0;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.product-info {
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
  margin-bottom: 5px;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.quantity {
  color: #909399;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #EBEEF5;
}

.order-total {
  color: #606266;
}

.total-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-detail {
  padding: 20px;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #303133;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.product-detail {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
}

.product-specs {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .order-info {
    flex-direction: column;
    gap: 5px;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 15px;
  }
  
  .order-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style> 