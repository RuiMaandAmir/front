<template>
  <div class="address-page">
    <div class="page-header">
      <h2>收货地址管理</h2>
      <el-button type="primary" @click="showAddressDialog()">
        新增收货地址
      </el-button>
    </div>

    <div class="address-list">
      <el-card
        v-for="address in addresses"
        :key="address.id"
        class="address-card"
        :class="{ 'is-default': address.is_default }"
      >
        <div class="address-content">
          <div class="address-info">
            <div class="contact-info">
              <span class="name">{{ address.name }}</span>
              <span class="phone">{{ address.phone }}</span>
              <el-tag v-if="address.is_default" size="small" type="success">默认</el-tag>
            </div>
            <div class="address-detail">
              {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
            </div>
          </div>
          <div class="address-actions">
            <el-button type="text" @click="showAddressDialog(address)">编辑</el-button>
            <el-button type="text" @click="deleteAddress(address.id)">删除</el-button>
            <el-button
              v-if="!address.is_default"
              type="text"
              @click="setDefaultAddress(address.id)"
            >
              设为默认
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 地址编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingAddress ? '编辑地址' : '新增地址'"
      width="500px"
    >
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressRules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="addressForm.region"
            :options="regionOptions"
            placeholder="请选择所在地区"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="addressForm.detail"
            type="textarea"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="addressForm.is_default">设为默认收货地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddress">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { useAddressStore } from '../stores/address';

const addressStore = useAddressStore();
const addresses = ref([]);
const dialogVisible = ref(false);
const editingAddress = ref(null);
const addressFormRef = ref<FormInstance>();

// 地址表单
const addressForm = ref({
  name: '',
  phone: '',
  region: [],
  detail: '',
  is_default: false,
});

// 表单验证规则
const addressRules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'change' },
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' },
  ],
};

// 地区选项（示例数据）
const regionOptions = [
  {
    value: 'beijing',
    label: '北京市',
    children: [
      {
        value: 'chaoyang',
        label: '朝阳区',
      },
      {
        value: 'haidian',
        label: '海淀区',
      },
    ],
  },
  // 其他省份数据...
];

// 加载地址列表
const loadAddresses = async () => {
  try {
    const response = await addressStore.getAddresses();
    addresses.value = response.data;
  } catch (error) {
    ElMessage.error('加载地址列表失败');
  }
};

// 显示地址编辑对话框
const showAddressDialog = (address = null) => {
  editingAddress.value = address;
  if (address) {
    addressForm.value = {
      name: address.name,
      phone: address.phone,
      region: [address.province, address.city, address.district],
      detail: address.detail,
      is_default: address.is_default,
    };
  } else {
    addressForm.value = {
      name: '',
      phone: '',
      region: [],
      detail: '',
      is_default: false,
    };
  }
  dialogVisible.value = true;
};

// 提交地址表单
const submitAddress = async () => {
  if (!addressFormRef.value) return;
  
  await addressFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const [province, city, district] = addressForm.value.region;
        const addressData = {
          name: addressForm.value.name,
          phone: addressForm.value.phone,
          province,
          city,
          district,
          detail: addressForm.value.detail,
          is_default: addressForm.value.is_default,
        };

        if (editingAddress.value) {
          await addressStore.updateAddress(editingAddress.value.id, addressData);
          ElMessage.success('地址更新成功');
        } else {
          await addressStore.createAddress(addressData);
          ElMessage.success('地址添加成功');
        }

        dialogVisible.value = false;
        loadAddresses();
      } catch (error) {
        ElMessage.error(editingAddress.value ? '更新地址失败' : '添加地址失败');
      }
    }
  });
};

// 删除地址
const deleteAddress = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个地址吗？', '提示', {
      type: 'warning',
    });
    
    await addressStore.deleteAddress(id);
    ElMessage.success('地址删除成功');
    loadAddresses();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除地址失败');
    }
  }
};

// 设置默认地址
const setDefaultAddress = async (id: number) => {
  try {
    await addressStore.setDefaultAddress(id);
    ElMessage.success('设置默认地址成功');
    loadAddresses();
  } catch (error) {
    ElMessage.error('设置默认地址失败');
  }
};

onMounted(() => {
  loadAddresses();
});
</script>

<style scoped>
.address-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #2e7d32;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.address-card {
  transition: all 0.3s;
}

.address-card.is-default {
  border: 1px solid #2e7d32;
}

.address-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.address-info {
  flex: 1;
}

.contact-info {
  margin-bottom: 10px;
}

.name {
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
}

.phone {
  color: #666;
  margin-right: 10px;
}

.address-detail {
  color: #666;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  gap: 10px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .address-page {
    padding: 10px;
  }

  .address-content {
    flex-direction: column;
  }

  .address-actions {
    margin-top: 10px;
  }
}
</style> 