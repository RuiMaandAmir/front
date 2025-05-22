<template>
  <div class="orders-container">
    <h1>我的订单</h1>
    <el-table :data="orders" style="width: 100%">
      <el-table-column prop="id" label="订单号" width="180" />
      <el-table-column prop="date" label="下单时间" width="180" />
      <el-table-column prop="status" label="状态" />
      <el-table-column prop="total" label="总金额" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '@/utils/request';

const orders = ref([]);

const fetchOrders = async () => {
  try {
    const response = await request.get('/api/orders/');
    orders.value = response.data;
  } catch (error) {
    console.error('获取订单失败:', error);
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.orders-container {
  padding: 20px;
}
</style> 