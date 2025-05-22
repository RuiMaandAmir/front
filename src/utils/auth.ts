import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 权限类型定义
export enum Permission {
  VIEW_PRODUCT = 'view_product',
  ADD_TO_CART = 'add_to_cart',
  PLACE_ORDER = 'place_order',
  DISTRIBUTOR = 'distributor',
  ADMIN = 'admin'
}

// 权限检查
export const checkPermission = (permission: Permission): boolean => {
  const userStore = useUserStore()
  
  // 检查是否登录
  if (!userStore.isLoggedIn) {
    return false
  }

  // 根据权限类型进行检查
  switch (permission) {
    case Permission.DISTRIBUTOR:
      return userStore.isDistributor
    case Permission.ADMIN:
      return userStore.user?.role === 'admin'
    default:
      return true
  }
}

// 权限检查装饰器
export const requirePermission = (permission: Permission) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      if (!checkPermission(permission)) {
        ElMessage.error('您没有权限执行此操作')
        return
      }
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// 登录检查
export const requireLogin = () => {
  const userStore = useUserStore()
  const router = useRouter()

  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return false
  }
  return true
}

// 分销商检查
export const requireDistributor = () => {
  if (!requireLogin()) return false
  
  const userStore = useUserStore()
  if (!userStore.isDistributor) {
    ElMessage.warning('请先成为分销商')
    return false
  }
  return true
}

// 获取用户权限列表
export const getUserPermissions = (): Permission[] => {
  const userStore = useUserStore()
  const permissions: Permission[] = []

  if (userStore.isLoggedIn) {
    permissions.push(Permission.VIEW_PRODUCT)
    permissions.push(Permission.ADD_TO_CART)
    permissions.push(Permission.PLACE_ORDER)
  }

  if (userStore.isDistributor) {
    permissions.push(Permission.DISTRIBUTOR)
  }

  if (userStore.user?.role === 'admin') {
    permissions.push(Permission.ADMIN)
  }

  return permissions
} 