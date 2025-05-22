<template>
  <div class="collection-list">
    <el-card class="folder-info">
      <div class="info-header">
        <div class="folder-basic">
          <el-image
            :src="folder.cover_image || '/default-folder-cover.jpg'"
            class="folder-cover"
          >
            <template #error>
              <div class="image-placeholder">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div class="folder-detail">
            <h2>{{ folder.name }}</h2>
            <p>{{ folder.description || '暂无描述' }}</p>
            <div class="folder-meta">
              <span>{{ folder.collection_count }}个商品</span>
              <el-tag size="small" :type="folder.is_public ? 'success' : 'info'">
                {{ folder.is_public ? '公开' : '私密' }}
              </el-tag>
            </div>
          </div>
        </div>
        <div class="folder-actions">
          <el-button-group>
            <el-button @click="showEditDialog">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button @click="showShareDialog">
              <el-icon><Share /></el-icon>
            </el-button>
            <el-button @click="confirmDelete" type="danger">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </el-card>

    <div class="collection-content">
      <div class="collection-header">
        <div class="left">
          <el-input
            v-model="searchQuery"
            placeholder="搜索收藏商品"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="right">
          <el-select v-model="sortBy" placeholder="排序方式" @change="handleSort">
            <el-option label="收藏时间" value="created_at" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
          </el-select>
        </div>
      </div>

      <div class="product-grid">
        <el-card v-for="item in collections" :key="item.id" class="product-card">
          <div class="product-image" @click="viewProduct(item.product)">
            <el-image :src="item.product.image" fit="cover">
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="product-info">
            <h3 @click="viewProduct(item.product)">{{ item.product.name }}</h3>
            <p class="price">¥{{ item.product.price }}</p>
            <p class="note" v-if="item.note">{{ item.note }}</p>
            <div class="product-actions">
              <el-button-group>
                <el-button @click="editNote(item)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button @click="removeFromCollection(item)" type="danger">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
        </el-card>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 编辑收藏夹对话框 -->
    <el-dialog
      title="编辑收藏夹"
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

    <!-- 编辑备注对话框 -->
    <el-dialog
      title="编辑备注"
      v-model="noteDialogVisible"
      width="400px"
    >
      <el-form
        ref="noteForm"
        :model="noteForm"
        :rules="noteRules"
      >
        <el-form-item prop="note">
          <el-input
            v-model="noteForm.note"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNoteForm">确定</el-button>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Share, Delete, Picture, Search } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useProductStore } from '@/stores/product'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

// 状态
const folder = ref({})
const collections = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const searchQuery = ref('')
const sortBy = ref('created_at')

// 对话框状态
const dialogVisible = ref(false)
const noteDialogVisible = ref(false)
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

const noteForm = ref({
  id: null,
  note: ''
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

const noteRules: FormRules = {
  note: [
    { max: 200, message: '不能超过200个字符', trigger: 'blur' }
  ]
}

// 方法
const loadFolder = async () => {
  try {
    const response = await productStore.getCollectionFolder(route.params.id)
    folder.value = response.data
    folderForm.value = { ...response.data }
  } catch (error) {
    ElMessage.error('加载收藏夹失败')
  }
}

const loadCollections = async () => {
  try {
    const params = {
      folder: route.params.id,
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value,
      sort: sortBy.value
    }
    const response = await productStore.getCollections(params)
    collections.value = response.data.results
    total.value = response.data.count
  } catch (error) {
    ElMessage.error('加载收藏商品失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadCollections()
}

const handleSort = () => {
  currentPage.value = 1
  loadCollections()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadCollections()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadCollections()
}

const showEditDialog = () => {
  dialogVisible.value = true
}

const submitFolderForm = async () => {
  try {
    await productStore.updateCollectionFolder(folderForm.value.id, folderForm.value)
    ElMessage.success('更新成功')
    dialogVisible.value = false
    loadFolder()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const confirmDelete = () => {
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
      await productStore.deleteCollectionFolder(folder.value.id)
      ElMessage.success('删除成功')
      router.push('/collection')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const editNote = (item) => {
  noteForm.value = {
    id: item.id,
    note: item.note
  }
  noteDialogVisible.value = true
}

const submitNoteForm = async () => {
  try {
    await productStore.updateCollection(noteForm.value.id, { note: noteForm.value.note })
    ElMessage.success('更新成功')
    noteDialogVisible.value = false
    loadCollections()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const removeFromCollection = (item) => {
  ElMessageBox.confirm(
    '确定要从收藏夹中移除这个商品吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await productStore.deleteCollection(item.id)
      ElMessage.success('移除成功')
      loadCollections()
    } catch (error) {
      ElMessage.error('移除失败')
    }
  })
}

const showShareDialog = async () => {
  try {
    const response = await productStore.getCollectionShare(folder.value.id)
    currentShare.value = response.data
    shareUrl.value = `${window.location.origin}/collection/share/${currentShare.value.code}`
    shareDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取分享信息失败')
  }
}

const createShare = async () => {
  try {
    const response = await productStore.createCollectionShare(folder.value.id)
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

const viewProduct = (product) => {
  router.push(`/product/${product.id}`)
}

onMounted(() => {
  loadFolder()
  loadCollections()
})
</script>

<style scoped>
.collection-list {
  padding: 20px;
}

.folder-info {
  margin-bottom: 20px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.folder-basic {
  display: flex;
  gap: 20px;
}

.folder-cover {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 30px;
}

.folder-detail {
  flex: 1;
}

.folder-detail h2 {
  margin: 0 0 10px;
  font-size: 24px;
}

.folder-detail p {
  margin: 0 0 10px;
  color: #666;
}

.folder-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.collection-content {
  margin-top: 20px;
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.collection-header .left {
  width: 300px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.product-card {
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.product-image {
  cursor: pointer;
}

.product-image .el-image {
  width: 100%;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
}

.product-info {
  padding: 15px 0;
}

.product-info h3 {
  margin: 0 0 10px;
  font-size: 16px;
  cursor: pointer;
}

.product-info h3:hover {
  color: #409EFF;
}

.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px;
}

.note {
  color: #909399;
  font-size: 12px;
  margin: 0 0 10px;
}

.product-actions {
  display: flex;
  justify-content: flex-end;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
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