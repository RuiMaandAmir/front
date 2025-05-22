<template>
  <div class="share-page">
    <div class="page-header">
      <h2>分享推广</h2>
    </div>

    <!-- 分享方式选择 -->
    <el-card shadow="hover" class="share-card">
      <template #header>
        <div class="card-header">
          <span>选择分享方式</span>
        </div>
      </template>
      <el-radio-group v-model="shareType" class="share-type">
        <el-radio-button label="link">分享链接</el-radio-button>
        <el-radio-button label="qrcode">二维码</el-radio-button>
        <el-radio-button label="poster">推广海报</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 分享链接 -->
    <el-card v-if="shareType === 'link'" shadow="hover" class="share-card">
      <template #header>
        <div class="card-header">
          <span>分享链接</span>
        </div>
      </template>
      <div class="share-link">
        <el-input
          v-model="shareLink"
          readonly
          class="link-input"
        >
          <template #append>
            <el-button @click="copyLink">复制链接</el-button>
          </template>
        </el-input>
      </div>
      <div class="share-tips">
        <h4>分享提示：</h4>
        <ul>
          <li>复制链接后，可以分享给好友或发布到社交媒体</li>
          <li>好友通过链接购买商品，您将获得相应佣金</li>
          <li>建议在分享时添加商品描述，提高转化率</li>
        </ul>
      </div>
    </el-card>

    <!-- 二维码 -->
    <el-card v-if="shareType === 'qrcode'" shadow="hover" class="share-card">
      <template #header>
        <div class="card-header">
          <span>二维码</span>
        </div>
      </template>
      <div class="qrcode-container">
        <div ref="qrcodeRef" class="qrcode"></div>
      </div>
      <div class="qrcode-actions">
        <el-button type="primary" @click="downloadQRCode">
          下载二维码
        </el-button>
      </div>
      <div class="share-tips">
        <h4>分享提示：</h4>
        <ul>
          <li>保存二维码图片，可以分享给好友或发布到社交媒体</li>
          <li>好友扫码购买商品，您将获得相应佣金</li>
          <li>建议在分享时添加商品描述，提高转化率</li>
        </ul>
      </div>
    </el-card>

    <!-- 推广海报 -->
    <el-card v-if="shareType === 'poster'" shadow="hover" class="share-card">
      <template #header>
        <div class="card-header">
          <span>推广海报</span>
        </div>
      </template>
      <div class="poster-container">
        <img
          v-if="posterUrl"
          :src="posterUrl"
          alt="推广海报"
          class="poster-image"
        />
        <div v-else class="poster-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>海报生成中...</span>
        </div>
      </div>
      <div class="poster-actions">
        <el-button type="primary" @click="downloadPoster">
          下载海报
        </el-button>
        <el-button @click="regeneratePoster">
          重新生成
        </el-button>
      </div>
      <div class="share-tips">
        <h4>分享提示：</h4>
        <ul>
          <li>保存海报图片，可以分享给好友或发布到社交媒体</li>
          <li>好友通过海报购买商品，您将获得相应佣金</li>
          <li>建议在分享时添加商品描述，提高转化率</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'

const productStore = useProductStore()

// 分享类型
const shareType = ref('link')
const shareLink = ref('')
const qrcodeRef = ref<HTMLElement | null>(null)
const posterUrl = ref('')

// 生成分享链接
const generateShareLink = async () => {
  try {
    const response = await productStore.getDistributionLink()
    shareLink.value = response.link
  } catch (error) {
    console.error('生成分享链接失败:', error)
    ElMessage.error('生成分享链接失败，请重试')
  }
}

// 复制链接
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    ElMessage.success('链接已复制')
  } catch (error) {
    console.error('复制链接失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 生成二维码
const generateQRCode = async () => {
  if (!qrcodeRef.value) return
  try {
    await QRCode.toCanvas(qrcodeRef.value, shareLink.value, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch (error) {
    console.error('生成二维码失败:', error)
    ElMessage.error('生成二维码失败，请重试')
  }
}

// 下载二维码
const downloadQRCode = async () => {
  if (!qrcodeRef.value) return
  try {
    const canvas = qrcodeRef.value.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = url
    link.click()
  } catch (error) {
    console.error('下载二维码失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

// 生成海报
const generatePoster = async () => {
  try {
    const response = await productStore.getDistributionPoster()
    posterUrl.value = response.url
  } catch (error) {
    console.error('生成海报失败:', error)
    ElMessage.error('生成海报失败，请重试')
  }
}

// 重新生成海报
const regeneratePoster = () => {
  posterUrl.value = ''
  generatePoster()
}

// 下载海报
const downloadPoster = async () => {
  if (!posterUrl.value) return
  try {
    const link = document.createElement('a')
    link.download = 'poster.png'
    link.href = posterUrl.value
    link.click()
  } catch (error) {
    console.error('下载海报失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

// 监听分享类型变化
watch(shareType, (newType) => {
  if (newType === 'link') {
    generateShareLink()
  } else if (newType === 'qrcode') {
    generateQRCode()
  } else if (newType === 'poster') {
    generatePoster()
  }
})

onMounted(() => {
  generateShareLink()
})
</script>

<style scoped>
.share-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.share-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.share-type {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.share-link {
  margin-bottom: 20px;
}

.link-input {
  width: 100%;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.qrcode {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.qrcode-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.poster-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  min-height: 400px;
}

.poster-image {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.poster-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #909399;
}

.loading-icon {
  font-size: 24px;
  animation: rotating 2s linear infinite;
}

.poster-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.share-tips {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.share-tips h4 {
  margin: 0 0 10px;
  color: #303133;
}

.share-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.share-tips li {
  margin-bottom: 5px;
}

.share-tips li:last-child {
  margin-bottom: 0;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .share-type {
    flex-direction: column;
    gap: 10px;
  }

  .poster-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 