<template>
  <div class="distribution-rules">
    <!-- 分销规则说明 -->
    <el-card class="rule-card">
      <template #header>
        <div class="card-header">
          <h3>分销规则说明</h3>
        </div>
      </template>
      <div class="rule-content">
        <h4>什么是分销？</h4>
        <p>分销是一种营销模式，通过邀请他人成为分销商，建立销售网络，从而获得销售佣金。您可以通过分享商品链接或二维码，邀请他人购买商品，获得相应的佣金奖励。</p>
        
        <h4>如何成为分销商？</h4>
        <p>1. 注册成为平台用户</p>
        <p>2. 完成实名认证</p>
        <p>3. 提交分销商申请</p>
        <p>4. 等待平台审核通过</p>
        
        <h4>分销商权益</h4>
        <p>1. 获得商品销售佣金</p>
        <p>2. 邀请他人成为分销商，获得团队奖励</p>
        <p>3. 享受不同等级的佣金比例</p>
        <p>4. 参与平台营销活动</p>
      </div>
    </el-card>

    <!-- 等级制度 -->
    <el-card class="rule-card">
      <template #header>
        <div class="card-header">
          <h3>等级制度</h3>
        </div>
      </template>
      <div class="rule-content">
        <el-table :data="distributionLevels" style="width: 100%">
          <el-table-column prop="level" label="等级" width="100">
            <template #default="{ row }">
              <el-tag :type="getLevelType(row.level)">
                {{ getLevelText(row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="等级名称" />
          <el-table-column prop="commission_rate" label="佣金比例">
            <template #default="{ row }">
              {{ row.commission_rate }}%
            </template>
          </el-table-column>
          <el-table-column prop="team_commission_rate" label="团队佣金比例">
            <template #default="{ row }">
              {{ row.team_commission_rate }}%
            </template>
          </el-table-column>
          <el-table-column prop="upgrade_condition" label="升级条件" />
        </el-table>
      </div>
    </el-card>

    <!-- 佣金规则 -->
    <el-card class="rule-card">
      <template #header>
        <div class="card-header">
          <h3>佣金规则</h3>
        </div>
      </template>
      <div class="rule-content">
        <h4>佣金计算方式</h4>
        <p>1. 直接销售佣金 = 商品价格 × 佣金比例</p>
        <p>2. 团队销售佣金 = 团队销售额 × 团队佣金比例</p>
        
        <h4>佣金结算规则</h4>
        <p>1. 订单完成后，佣金自动计入待结算账户</p>
        <p>2. 待结算佣金将在订单完成7天后自动结算</p>
        <p>3. 结算后的佣金可申请提现</p>
        <p>4. 提现金额最低100元起</p>
        
        <h4>佣金提现规则</h4>
        <p>1. 提现申请将在1-3个工作日内处理</p>
        <p>2. 提现到账时间以银行处理时间为准</p>
        <p>3. 提现手续费由平台承担</p>
      </div>
    </el-card>

    <!-- 注意事项 -->
    <el-card class="rule-card">
      <template #header>
        <div class="card-header">
          <h3>注意事项</h3>
        </div>
      </template>
      <div class="rule-content">
        <el-alert
          v-for="(notice, index) in notices"
          :key="index"
          :title="notice.title"
          :type="notice.type"
          :description="notice.content"
          show-icon
          :closable="false"
          class="notice-item"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()

// 分销等级列表
const distributionLevels = ref([])

// 注意事项
const notices = ref([
  {
    title: '合规经营',
    content: '请遵守平台规则，不得进行虚假交易、刷单等违规行为，违者将被取消分销资格。',
    type: 'warning'
  },
  {
    title: '佣金结算',
    content: '佣金结算以实际订单金额为准，退款订单将扣除相应佣金。',
    type: 'info'
  },
  {
    title: '等级提升',
    content: '等级提升需要满足相应条件，系统将自动审核并更新等级。',
    type: 'success'
  },
  {
    title: '团队管理',
    content: '请妥善管理团队成员，确保团队健康发展。',
    type: 'info'
  }
])

// 获取分销等级列表
const getDistributionLevels = async () => {
  try {
    const response = await productStore.getDistributionLevels()
    distributionLevels.value = response
  } catch (error) {
    console.error('获取分销等级列表失败:', error)
  }
}

// 获取等级类型
const getLevelType = (level: number) => {
  const typeMap: Record<number, string> = {
    1: 'info',
    2: 'success',
    3: 'warning',
    4: 'danger'
  }
  return typeMap[level] || 'info'
}

// 获取等级文本
const getLevelText = (level: number) => {
  const textMap: Record<number, string> = {
    1: '普通分销商',
    2: '高级分销商',
    3: '金牌分销商',
    4: '钻石分销商'
  }
  return textMap[level] || '未知等级'
}

onMounted(() => {
  getDistributionLevels()
})
</script>

<style scoped>
.distribution-rules {
  padding: 20px;
}

.rule-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.rule-content {
  color: #606266;
  line-height: 1.8;
}

.rule-content h4 {
  margin: 20px 0 10px;
  color: #303133;
  font-size: 16px;
}

.rule-content p {
  margin: 10px 0;
}

.notice-item {
  margin-bottom: 15px;
}

.notice-item:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .distribution-rules {
    padding: 10px;
  }
  
  .rule-content {
    font-size: 14px;
  }
}
</style> 