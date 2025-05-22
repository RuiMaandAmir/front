<template>
  <div class="search-container">
    <!-- 搜索历史 -->
    <div v-if="!searchQuery && !isSearching" class="search-history">
      <div class="section-header">
        <h3>搜索历史</h3>
        <el-button v-if="searchHistory.length" type="text" @click="clearHistory">
          清空历史
        </el-button>
      </div>
      <div class="history-list">
        <el-tag
          v-for="item in searchHistory"
          :key="item"
          class="history-tag"
          @click="handleHistoryClick(item)"
        >
          {{ item }}
        </el-tag>
      </div>
    </div>

    <!-- 热门搜索 -->
    <div v-if="!searchQuery && !isSearching" class="hot-search">
      <div class="section-header">
        <h3>热门搜索</h3>
      </div>
      <div class="hot-list">
        <el-tag
          v-for="item in hotSearches"
          :key="item.keyword"
          class="hot-tag"
          :type="item.type"
          @click="handleHistoryClick(item.keyword)"
        >
          {{ item.keyword }}
        </el-tag>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchQuery || isSearching" class="search-results">
      <div class="results-header">
        <h3>搜索结果：{{ searchQuery }}</h3>
        <el-radio-group v-model="sortBy" size="small" @change="handleSortChange">
          <el-radio-button label="default">默认</el-radio-button>
          <el-radio-button label="price_asc">价格从低到高</el-radio-button>
          <el-radio-button label="price_desc">价格从高到低</el-radio-button>
          <el-radio-button label="sales">销量优先</el-radio-button>
        </el-radio-group>
      </div>

      <div v-loading="loading" class="results-content">
        <template v-if="products.length">
          <el-row :gutter="20">
            <el-col
              v-for="product in products"
              :key="product.id"
              :xs="12"
              :sm="8"
              :md="6"
              :lg="6"
              :xl="4"
            >
              <el-card
                class="product-card"
                shadow="hover"
                @click="goToProduct(product.id)"
              >
                <img :src="product.images[0]" class="product-image" />
                <div class="product-info">
                  <h4 class="product-name">{{ product.name }}</h4>
                  <div class="product-price">
                    <span class="price">¥{{ product.price }}</span>
                    <span class="sales">已售 {{ product.sales }}</span>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

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
        </template>

        <el-empty
          v-else-if="!loading"
          description="暂无相关商品"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useProductStore } from '../stores/product';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();

// 状态变量
const searchQuery = ref('');
const loading = ref(false);
const isSearching = ref(false);
const products = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);
const sortBy = ref('default');

// 搜索历史
const searchHistory = ref<string[]>([]);
const MAX_HISTORY = 10;

// 热门搜索
const hotSearches = ref([
  { keyword: '新品上市', type: 'danger' },
  { keyword: '热销商品', type: 'warning' },
  { keyword: '限时特惠', type: 'success' },
  { keyword: '品牌精选', type: 'info' },
]);

// 监听路由参数变化
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) {
      searchQuery.value = newQuery as string;
      search();
    }
  },
  { immediate: true }
);

// 加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('searchHistory');
  if (history) {
    searchHistory.value = JSON.parse(history);
  }
};

// 保存搜索历史
const saveSearchHistory = (keyword: string) => {
  const history = new Set([keyword, ...searchHistory.value]);
  searchHistory.value = Array.from(history).slice(0, MAX_HISTORY);
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
};

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = [];
  localStorage.removeItem('searchHistory');
};

// 处理历史记录点击
const handleHistoryClick = (keyword: string) => {
  searchQuery.value = keyword;
  router.push({
    path: '/search',
    query: { q: keyword }
  });
};

// 处理排序变化
const handleSortChange = () => {
  currentPage.value = 1;
  search();
};

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  search();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  search();
};

// 搜索商品
const search = async () => {
  if (!searchQuery.value) {
    isSearching.value = false;
    return;
  }

  try {
    loading.value = true;
    isSearching.value = true;
    saveSearchHistory(searchQuery.value);

    const response = await productStore.searchProducts({
      keyword: searchQuery.value,
      page: currentPage.value,
      page_size: pageSize.value,
      sort_by: sortBy.value,
    });

    products.value = response.data.items;
    total.value = response.data.total;
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 跳转到商品详情
const goToProduct = (id: number) => {
  router.push(`/product/${id}`);
};

onMounted(() => {
  loadSearchHistory();
});
</script>

<style scoped>
.search-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.search-history,
.hot-search {
  margin-bottom: 30px;
}

.history-list,
.hot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.history-tag,
.hot-tag {
  cursor: pointer;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 10px;
}

.product-name {
  margin: 0 0 10px;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #f56c6c;
  font-size: 16px;
  font-weight: bold;
}

.sales {
  color: #999;
  font-size: 12px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .search-container {
    padding: 10px;
  }

  .section-header h3 {
    font-size: 16px;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .results-header h3 {
    font-size: 16px;
  }

  .el-radio-group {
    width: 100%;
    display: flex;
    overflow-x: auto;
    padding-bottom: 5px;
  }

  .el-radio-button {
    flex-shrink: 0;
  }

  .product-image {
    height: 150px;
  }

  .product-name {
    font-size: 12px;
  }

  .price {
    font-size: 14px;
  }

  .sales {
    font-size: 10px;
  }
}

/* 小屏幕手机适配 */
@media screen and (max-width: 375px) {
  .search-container {
    padding: 5px;
  }

  .section-header h3 {
    font-size: 14px;
  }

  .history-tag,
  .hot-tag {
    font-size: 12px;
  }

  .product-image {
    height: 120px;
  }

  .product-info {
    padding: 5px;
  }

  .product-name {
    font-size: 12px;
    margin-bottom: 5px;
  }

  .price {
    font-size: 12px;
  }

  .sales {
    font-size: 10px;
  }
}
</style> 