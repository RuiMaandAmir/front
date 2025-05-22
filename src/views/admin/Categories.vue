<template>
  <div class="categories-page">
    <div class="page-header">
      <h2>商品分类</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        添加分类
      </el-button>
    </div>

    <el-card>
      <el-table
        v-loading="loading"
        :data="categories"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="code" label="分类编码" width="120" />
        <el-table-column prop="sort_order" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button
                type="primary"
                link
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加分类' : '编辑分类'"
      width="500px"
    >
      <el-form
        ref="categoryForm"
        :model="categoryForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="上级分类">
          <el-cascader
            v-model="categoryForm.parent_id"
            :options="categoryOptions"
            :props="{
              checkStrictly: true,
              value: 'id',
              label: 'name',
              children: 'children'
            }"
            clearable
            placeholder="请选择上级分类"
          />
        </el-form-item>

        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="分类编码" prop="code">
          <el-input v-model="categoryForm.code" placeholder="请输入分类编码" />
        </el-form-item>

        <el-form-item label="排序" prop="sort_order">
          <el-input-number
            v-model="categoryForm.sort_order"
            :min="0"
            :precision="0"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="categoryForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()

// 状态
const loading = ref(false)
const categories = ref([])
const categoryOptions = ref([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')

// 表单
const categoryForm = reactive({
  id: '',
  parent_id: null as number | null,
  name: '',
  code: '',
  sort_order: 0,
  status: 'active'
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }],
  sort_order: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 方法
const loadCategories = async () => {
  loading.value = true
  try {
    const response = await productStore.getCategories()
    categories.value = response.data
    categoryOptions.value = response.data
  } catch (error) {
    ElMessage.error('加载分类列表失败')
  } finally {
    loading.value = false
  }
}

const showAddDialog = () => {
  dialogType.value = 'add'
  Object.keys(categoryForm).forEach(key => {
    if (key === 'status') {
      categoryForm[key] = 'active'
    } else if (key === 'sort_order') {
      categoryForm[key] = 0
    } else if (key === 'parent_id') {
      categoryForm[key] = null
    } else {
      categoryForm[key] = ''
    }
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.keys(categoryForm).forEach(key => {
    categoryForm[key] = row[key]
  })
  dialogVisible.value = true
}

const handleToggleStatus = async (row: any) => {
  try {
    await productStore.updateCategoryStatus(row.id, {
      status: row.status === 'active' ? 'inactive' : 'active'
    })
    ElMessage.success('更新状态成功')
    loadCategories()
  } catch (error) {
    ElMessage.error('更新状态失败')
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
      type: 'warning'
    })
    await productStore.deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadCategories()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  try {
    if (dialogType.value === 'add') {
      await productStore.createCategory(categoryForm)
      ElMessage.success('添加成功')
    } else {
      await productStore.updateCategory(categoryForm.id, categoryForm)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    loadCategories()
  } catch (error) {
    ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
  }
}

// 生命周期
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.categories-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 