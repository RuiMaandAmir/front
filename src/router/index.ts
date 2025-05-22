import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetail.vue'),
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue'),
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/payment/:orderId',
    name: 'Payment',
    component: () => import('../views/Payment.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/affiliate',
    name: 'AffiliateDashboard',
    component: () => import('../views/AffiliateDashboard.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../views/Orders.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/order/:id',
    name: 'order-detail',
    component: () => import('../views/OrderDetail.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/address',
    name: 'address',
    component: () => import('../views/Address.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/coupons',
    name: 'coupons',
    component: () => import('../views/Coupons.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/after-sales',
    name: 'after-sales',
    component: () => import('../views/AfterSales.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/distribution',
    name: 'distribution',
    component: () => import('../views/DistributionCenter.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/distribution/withdrawal',
    name: 'distribution-withdrawal',
    component: () => import('../views/DistributionWithdrawal.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/distribution/application',
    name: 'distribution-application',
    component: () => import('../views/DistributionApplication.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/distribution/team',
    name: 'distribution-team',
    component: () => import('../views/DistributionTeam.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/distribution/ranking',
    name: 'distribution-ranking',
    component: () => import('../views/DistributionRanking.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/collection',
    component: () => import('../views/CollectionFolders.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/collection/:id',
    component: () => import('../views/CollectionList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/collection/share/:code',
    component: () => import('../views/CollectionShare.vue')
  },
  {
    path: '/wechat-callback',
    name: 'WechatCallback',
    component: () => import('../views/WechatCallback.vue')
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth && !userStore.checkLogin()) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  } else {
    next();
  }
});

export default router; 