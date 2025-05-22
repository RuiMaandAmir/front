<template>
  <div class="collection-folders">
    <el-card class="folders-header">
      <div class="header-content">
        <h2>我的收藏夹</h2>
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>新建收藏夹
        </el-button>
      </div>
    </el-card>

    <div class="folders-grid">
      <el-card v-for="folder in folders" :key="folder.id" class="folder-card">
        <div class="folder-cover" @click="openFolder(folder)">
          <el-image
            :src="folder.cover_image || '/default-folder-cover.jpg'"
            fit="cover"
          >
            <template #error>
              <div class="image-placeholder">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div class="folder-info">
            <h3>{{ folder.name }}</h3>
            <p>{{ folder.description || '暂无描述' }}</p>
            <div class="folder-stats">
              <span>{{ folder.collection_count }}个商品</span>
              <el-tag size="small" :type="folder.is_public ? 'success' : 'info'">
                {{ folder.is_public ? '公开' : '私密' }}
              </el-tag>
            </div>
          </div>
        </div>
        <div class="folder-actions">
          <el-button-group>
            <el-button @click="showEditDialog(folder)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button @click="showShareDialog(folder)">
              <el-icon><Share /></el-icon>
            </el-button>
            <el-button @click="confirmDelete(folder)" type="danger">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </el-card>
    </div>

    <!-- 创建/编辑收藏夹对话框 -->
    <el-dialog
      :title="dialogType === 'create' ? '新建收藏夹' : '编辑收藏夹'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="folderForm"
        :model="folderForm"
        :rules="folderRules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="folderForm.name" placeholder="请输入收藏夹名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="folderForm.description"
            type="textarea"
            placeholder="请输入收藏夹描述"
          />
        </el-form-item>
        <el-form-item label="封面" prop="cover_image">
          <el-upload
            class="cover-uploader"
            :show-file-list="false"
            :before-upload="beforeCoverUpload"
            :http-request="uploadCover"
          >
            <el-image
              v-if="folderForm.cover_image"
              :src="folderForm.cover_image"
              class="cover-image"
            />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="公开" prop="is_public">
          <el-switch v-model="folderForm.is_public" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFolderForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分享对话框 -->
    <el-dialog
      title="分享收藏夹"
      v-model="shareDialogVisible"
      width="400px"
    >
      <div v-if="currentShare" class="share-content">
        <div class="share-qrcode">
          <el-image :src="currentShare.qr_code" fit="contain" />
        </div>
        <div class="share-info">
          <p>分享链接：</p>
          <el-input
            v-model="shareUrl"
            readonly
          >
            <template #append>
              <el-button @click="copyShareUrl">复制</el-button>
            </template>
          </el-input>
          <p class="share-tip">链接有效期：{{ currentShare.expired_at || '永久有效' }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="shareDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="createShare">生成新链接</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Share, Delete, Picture } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useProductStore } from '@/stores/product'

const router = useRouter()
const productStore = useProductStore()

// 状态
const folders = ref([])
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const shareDialogVisible = ref(false)
const currentShare = ref(null)
const shareUrl = ref('')

// 表单
const folderForm = ref({
  id: null,
  name: '',
  description: '',
  cover_image: '',
  is_public: false
})

const folderRules: FormRules = {
  name: [
    { required: true, message: '请输入收藏夹名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '不能超过200个字符', trigger: 'blur' }
  ]
}

// 方法
const loadFolders = async () => {
  try {
    const response = await productStore.getCollectionFolders()
    folders.value = response.data
  } catch (error) {
    ElMessage.error('加载收藏夹失败')
  }
}

const showCreateDialog = () => {
  dialogType.value = 'create'
  folderForm.value = {
    id: null,
    name: '',
    description: '',
    cover_image: '',
    is_public: false
  }
  dialogVisible.value = true
}

const showEditDialog = (folder) => {
  dialogType.value = 'edit'
  folderForm.value = { ...folder }
  dialogVisible.value = true
}

const submitFolderForm = async () => {
  try {
    if (dialogType.value === 'create') {
      await productStore.createCollectionFolder(folderForm.value)
      ElMessage.success('创建成功')
    } else {
      await productStore.updateCollectionFolder(folderForm.value.id, folderForm.value)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    loadFolders()
  } catch (error) {
    ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
  }
}

const confirmDelete = (folder) => {
  ElMessageBox.confirm(
    '确定要删除这个收藏夹吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await productStore.deleteCollectionFolder(folder.id)
      ElMessage.success('删除成功')
      loadFolders()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const showShareDialog = async (folder) => {
  try {
    const response = await productStore.getCollectionShare(folder.id)
    currentShare.value = response.data
    shareUrl.value = `${window.location.origin}/collection/share/${currentShare.value.code}`
    shareDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取分享信息失败')
  }
}

const createShare = async () => {
  try {
    const response = await productStore.createCollectionShare(folderForm.value.id)
    currentShare.value = response.data
    shareUrl.value = `${window.location.origin}/collection/share/${currentShare.value.code}`
    ElMessage.success('生成分享链接成功')
  } catch (error) {
    ElMessage.error('生成分享链接失败')
  }
}

const copyShareUrl = () => {
  navigator.clipboard.writeText(shareUrl.value)
  ElMessage.success('复制成功')
}

const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

const uploadCover = async (options) => {
  try {
    const formData = new FormData()
    formData.append('file', options.file)
    const response = await productStore.uploadFile(formData)
    folderForm.value.cover_image = response.data.url
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

const openFolder = (folder) => {
  router.push(`/collection/${folder.id}`)
}

onMounted(() => {
  loadFolders()
})
</script>

<style scoped>
.collection-folders {
  padding: 20px;
}

.folders-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.folders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.folder-card {
  transition: all 0.3s;
}

.folder-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.folder-cover {
  cursor: pointer;
}

.folder-cover .el-image {
  width: 100%;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 200px;
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 30px;
}

.folder-info {
  padding: 15px 0;
}

.folder-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
}

.folder-info p {
  margin: 0 0 10px;
  color: #666;
  font-size: 14px;
}

.folder-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
  font-size: 12px;
}

.folder-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.cover-uploader {
  width: 200px;
  height: 200px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.cover-uploader:hover {
  border-color: #409EFF;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 200px;
  line-height: 200px;
  text-align: center;
}

.cover-image {
  width: 200px;
  height: 200px;
  display: block;
}

.share-content {
  text-align: center;
}

.share-qrcode {
  margin-bottom: 20px;
}

.share-qrcode .el-image {
  width: 200px;
  height: 200px;
}

.share-info {
  text-align: left;
}

.share-tip {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
}
</style> 