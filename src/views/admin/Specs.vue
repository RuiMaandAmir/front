<template>
  <div class="specs-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商品规格管理</span>
          <el-button type="primary" @click="showAddDialog">添加规格</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="specs"
        style="width: 100%"
      >
        <el-table-column prop="name" label="规格名称" />
        <el-table-column prop="value" label="规格值" />
        <el-table-column prop="price_adjustment" label="价格调整">
          <template #default="{ row }">
            {{ row.price_adjustment > 0 ? '+' : '' }}{{ row.price_adjustment }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" />
        <el-table-column prop="is_active" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              type="primary"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.is_active ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
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
    </el-card>

    <!-- 添加/编辑规格对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑规格' : '添加规格'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="specForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="规格名称" prop="name">
          <el-input v-model="specForm.name" placeholder="请输入规格名称" />
        </el-form-item>
        <el-form-item label="规格值" prop="value">
          <el-input v-model="specForm.value" placeholder="请输入规格值" />
        </el-form-item>
        <el-form-item label="价格调整" prop="price_adjustment">
          <el-input-number
            v-model="specForm.price_adjustment"
            :precision="2"
            :step="0.1"
            placeholder="请输入价格调整"
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="specForm.stock"
            :min="0"
            :step="1"
            placeholder="请输入库存"
          />
        </el-form-item>
        <el-form-item label="状态" prop="is_active">
          <el-switch v-model="specForm.is_active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useProductStore } from '@/stores/product'

interface Spec {
  id: number
  name: string
  value: string
  price_adjustment: number
  stock: number
  is_active: boolean
}

const productStore = useProductStore()
const loading = ref(false)
const specs = ref<Spec[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const specForm = reactive<Spec>({
  id: 0,
  name: '',
  value: '',
  price_adjustment: 0,
  stock: 0,
  is_active: true
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入规格名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入规格值', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' }
  ]
}

// 加载规格列表
const loadSpecs = async () => {
  loading.value = true
  try {
    const response = await productStore.getSpecs({
      page: currentPage.value,
      page_size: pageSize.value
    })
    specs.value = response.data
    total.value = response.total
  } catch (error) {
    ElMessage.error('加载规格列表失败')
  } finally {
    loading.value = false
  }
}

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  specForm.id = 0
  specForm.name = ''
  specForm.value = ''
  specForm.price_adjustment = 0
  specForm.stock = 0
  specForm.is_active = true
  dialogVisible.value = true
}

// 显示编辑对话框
const handleEdit = (row: Spec) => {
  isEdit.value = true
  Object.assign(specForm, row)
  dialogVisible.value = true
}

// 切换规格状态
const handleToggleStatus = async (row: Spec) => {
  try {
    await productStore.updateSpecStatus(row.id, !row.is_active)
    ElMessage.success('更新状态成功')
    loadSpecs()
  } catch (error) {
    ElMessage.error('更新状态失败')
  }
}

// 删除规格
const handleDelete = (row: Spec) => {
  ElMessageBox.confirm(
    '确定要删除该规格吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await productStore.deleteSpec(row.id)
      ElMessage.success('删除成功')
      loadSpecs()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await productStore.updateSpec(specForm)
          ElMessage.success('更新成功')
        } else {
          await productStore.createSpec(specForm)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadSpecs()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      }
    }
  })
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadSpecs()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadSpecs()
}

onMounted(() => {
  loadSpecs()
})
</script>

<style scoped>
.specs-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 