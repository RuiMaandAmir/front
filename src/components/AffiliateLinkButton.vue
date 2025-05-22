<template>
  <div class="affiliate-link-container">
    <el-button
      type="primary"
      :loading="loading"
      @click="handleGenerateLink"
      class="affiliate-button"
    >
      {{ buttonText }}
    </el-button>
    
    <div v-if="affiliateLink" class="affiliate-info">
      <div class="commission-info">
        <span class="commission-rate">佣金比例: {{ affiliateLink.commission_rate }}%</span>
        <span class="commission-amount">预计佣金: ¥{{ calculateCommission }}</span>
      </div>
      
      <div class="link-actions">
        <el-input
          v-model="affiliateLink.code"
          readonly
          class="link-input"
        >
          <template #append>
            <el-button @click="copyLink">复制链接</el-button>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useAffiliateStore } from '../stores/affiliate';
import type { AffiliateLink } from '../types';

const props = defineProps<{
  productId: number;
  productPrice: number;
}>();

const affiliateStore = useAffiliateStore();
const loading = ref(false);
const affiliateLink = ref<AffiliateLink | null>(null);

const buttonText = computed(() => {
  if (loading.value) return '生成中...';
  if (affiliateLink.value) return '重新生成';
  return '生成分销链接';
});

const calculateCommission = computed(() => {
  if (!affiliateLink.value) return '0.00';
  return (props.productPrice * (affiliateLink.value.commission_rate / 100)).toFixed(2);
});

const handleGenerateLink = async () => {
  try {
    loading.value = true;
    const response = await affiliateStore.generateAffiliateLink(props.productId);
    affiliateLink.value = response.data;
    ElMessage.success('分销链接生成成功');
  } catch (error) {
    ElMessage.error('生成分销链接失败');
  } finally {
    loading.value = false;
  }
};

const copyLink = () => {
  if (!affiliateLink.value) return;
  const link = affiliateStore.copyAffiliateLink(affiliateLink.value.code);
  navigator.clipboard.writeText(link).then(() => {
    ElMessage.success('链接已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制');
  });
};
</script>

<style scoped>
.affiliate-link-container {
  margin: 16px 0;
}

.affiliate-button {
  width: 100%;
}

.affiliate-info {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.commission-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #666;
}

.commission-rate {
  font-weight: bold;
  color: #409eff;
}

.commission-amount {
  color: #67c23a;
}

.link-actions {
  display: flex;
  gap: 8px;
}

.link-input {
  flex: 1;
}
</style> 