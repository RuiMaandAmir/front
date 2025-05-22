<template>
  <div class="distribution-link">
    <el-button type="primary" @click="showDialog">
      分享赚佣金
    </el-button>

    <el-dialog
      v-model="dialogVisible"
      title="分享商品"
      width="400px"
    >
      <div class="share-content">
        <div class="qr-code">
          <img :src="qrCode" v-if="qrCode" />
          <div v-else class="loading">
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
        </div>
        <div class="share-link">
          <el-input
            v-model="shareLink"
            readonly
          >
            <template #append>
              <el-button @click="copyLink">复制</el-button>
            </template>
          </el-input>
        </div>
        <div class="share-tips">
          <p>分享商品给好友,好友购买后您将获得{{ commissionRate }}%的佣金</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'

const props = defineProps<{
  productId: number
}>()

const productStore = useProductStore()
const dialogVisible = ref(false)
const qrCode = ref('')
const shareLink = ref('')
const commissionRate = 10 // 佣金比例

const showDialog = async () => {
  dialogVisible.value = true
  await generateLink()
}

const generateLink = async () => {
  try {
    const response = await productStore.createDistributionLink(props.productId)
    qrCode.value = response.qr_code
    shareLink.value = response.share_url
  } catch (error) {
    ElMessage.error('生成分享链接失败')
  }
}

const copyLink = () => {
  navigator.clipboard.writeText(shareLink.value).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}
</script>

<style scoped>
.distribution-link {
  display: inline-block;
}

.share-content {
  text-align: center;
}

.qr-code {
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-code img {
  max-width: 100%;
  max-height: 100%;
}

.loading {
  color: #409eff;
  font-size: 24px;
}

.share-link {
  margin-bottom: 20px;
}

.share-tips {
  color: #666;
  font-size: 14px;
}
</style> 