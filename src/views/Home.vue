<template>
  <div class="home">
    <!-- 轮播图 -->
    <div class="banner-section">
      <el-carousel height="400px">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <img :src="banner.image" :alt="banner.title" class="banner-image" />
          <div class="banner-content">
            <h2>{{ banner.title }}</h2>
            <p>{{ banner.description }}</p>
            <el-button type="primary" @click="goToCategory(banner.category_id)">
              立即查看
            </el-button>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 分类导航 -->
    <div class="category-section">
      <div class="section-header">
        <h2>商品分类</h2>
      </div>
      <div class="category-grid">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          @click="goToCategory(category.id)"
        >
          <img :src="category.icon" :alt="category.name" class="category-icon" />
          <span class="category-name">{{ category.name }}</span>
        </div>
      </div>
    </div>

    <!-- 个性化推荐 -->
    <div v-if="isLoggedIn" class="recommendation-section">
      <h2>为您推荐</h2>
      <div class="product-grid">
        <el-card v-for="product in personalizedProducts" :key="product.id" class="product-card">
          <div class="product-image" @click="viewProduct(product)">
            <el-image :src="product.image" fit="cover">
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="product-info">
            <h3 @click="viewProduct(product)">{{ product.name }}</h3>
            <p class="price">¥{{ product.price }}</p>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 热门商品 -->
    <div class="recommendation-section">
      <h2>热门商品</h2>
      <div class="product-grid">
        <el-card v-for="product in hotProducts" :key="product.id" class="product-card">
          <div class="product-image" @click="viewProduct(product)">
            <el-image :src="product.image" fit="cover">
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="product-info">
            <h3 @click="viewProduct(product)">{{ product.name }}</h3>
            <p class="price">¥{{ product.price }}</p>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 新品推荐 -->
    <div class="recommendation-section">
      <h2>新品推荐</h2>
      <div class="product-grid">
        <el-card v-for="product in newProducts" :key="product.id" class="product-card">
          <div class="product-image" @click="viewProduct(product)">
            <el-image :src="product.image" fit="cover">
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="product-info">
            <h3 @click="viewProduct(product)">{{ product.name }}</h3>
            <p class="price">¥{{ product.price }}</p>
          </div>
        </el-card>
      </div>
    <div class="hot-products-section">
      <div class="section-header">
        <h2>热门商品</h2>
        <el-button type="text" @click="goToSearch('hot')">
          查看更多
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-row :gutter="20">
        <el-col
          v-for="product in hotProducts"
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
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-price">
                <span class="price">¥{{ product.price }}</span>
                <span class="sales">已售 {{ product.sales }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 新品上市 -->
    <div class="new-products-section">
      <div class="section-header">
        <h2>新品上市</h2>
        <el-button type="text" @click="goToSearch('new')">
          查看更多
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-row :gutter="20">
        <el-col
          v-for="product in newProducts"
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
            <div class="new-tag">新品</div>
            <img :src="product.images[0]" class="product-image" />
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-price">
                <span class="price">¥{{ product.price }}</span>
                <span class="sales">已售 {{ product.sales }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 特色专区 -->
    <div class="featured-section">
      <div class="section-header">
        <h2>特色专区</h2>
      </div>
      <div class="featured-grid">
        <div
          v-for="feature in featured"
          :key="feature.id"
          class="featured-item"
          @click="goToCategory(feature.category_id)"
        >
          <img :src="feature.image" :alt="feature.title" class="featured-image" />
          <div class="featured-content">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';
import { useProductStore } from '../stores/product';

const router = useRouter();
const productStore = useProductStore();

// 轮播图数据
const banners = ref([
  {
    id: 1,
    title: '清真火锅丸子',
    description: '精选优质食材，清真认证',
    image: '/banners/banner1.jpg',
    category_id: 1,
  },
  {
    id: 2,
    title: '特色清真食品',
    description: '传统工艺，品质保证',
    image: '/banners/banner2.jpg',
    category_id: 2,
  },
  {
    id: 3,
    title: '限时特惠',
    description: '多款商品特价促销',
    image: '/banners/banner3.jpg',
    category_id: 3,
  },
]);

// 分类数据
const categories = ref([
  {
    id: 1,
    name: '火锅丸子',
    icon: '/categories/hotpot.png',
  },
  {
    id: 2,
    name: '清真肉类',
    icon: '/categories/meat.png',
  },
  {
    id: 3,
    name: '特色小吃',
    icon: '/categories/snacks.png',
  },
  {
    id: 4,
    name: '调味品',
    icon: '/categories/seasoning.png',
  },
  {
    id: 5,
    name: '速冻食品',
    icon: '/categories/frozen.png',
  },
  {
    id: 6,
    name: '礼盒套装',
    icon: '/categories/gift.png',
  },
]);

// 热门商品
const hotProducts = ref([]);

// 新品上市
const newProducts = ref([]);

// 特色专区
const featured = ref([
  {
    id: 1,
    title: '火锅丸子专区',
    description: '多种口味，满足不同需求',
    image: '/featured/hotpot.jpg',
    category_id: 1,
  },
  {
    id: 2,
    title: '清真肉类专区',
    description: '优质食材，品质保证',
    image: '/featured/meat.jpg',
    category_id: 2,
  },
  {
    id: 3,
    title: '特色小吃专区',
    description: '传统工艺，美味可口',
    image: '/featured/snacks.jpg',
    category_id: 3,
  },
]);

// 加载热门商品
const loadHotProducts = async () => {
  try {
    const response = await productStore.getHotProducts();
    hotProducts.value = response.data.items;
  } catch (error) {
    console.error('加载热门商品失败:', error);
  }
};

// 加载新品
const loadNewProducts = async () => {
  try {
    const response = await productStore.getProducts({
      sort_by: 'created_at',
      page_size: 8,
    });
    newProducts.value = response.data.items;
  } catch (error) {
    console.error('加载新品失败:', error);
  }
};

// 跳转到分类
const goToCategory = (categoryId: number) => {
  router.push({
    path: '/search',
    query: { category_id: categoryId },
  });
};

// 跳转到商品详情
const goToProduct = (productId: number) => {
  router.push(`/product/${productId}`);
};

// 跳转到搜索页
const goToSearch = (type: string) => {
  router.push({
    path: '/search',
    query: { type },
  });
};

onMounted(() => {
  loadHotProducts();
  loadNewProducts();
});
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.banner-section {
  margin-bottom: 40px;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-content h2 {
  font-size: 32px;
  margin-bottom: 10px;
}

.banner-content p {
  font-size: 18px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 24px;
  color: #2e7d32;
  margin: 0;
}

.category-section {
  margin-bottom: 40px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s;
}

.category-item:hover {
  transform: translateY(-5px);
}

.category-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 10px;
}

.category-name {
  font-size: 14px;
  color: #333;
}

.hot-products-section,
.new-products-section {
  margin-bottom: 40px;
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

.new-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #2e7d32;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.featured-section {
  margin-bottom: 40px;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.featured-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.featured-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s;
}

.featured-item:hover .featured-image {
  transform: scale(1.05);
}

.featured-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: #fff;
}

.featured-content h3 {
  margin: 0 0 10px;
  font-size: 18px;
}

.featured-content p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .home {
    padding: 10px;
  }

  .banner-content h2 {
    font-size: 24px;
  }

  .banner-content p {
    font-size: 14px;
  }

  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .featured-grid {
    grid-template-columns: 1fr;
  }

  .product-image {
    height: 150px;
  }
}

@media screen and (max-width: 375px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .product-image {
    height: 120px;
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
</style> 