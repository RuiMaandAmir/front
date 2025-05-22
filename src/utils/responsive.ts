// 断点定义
export const breakpoints = {
  xs: 480,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1920
}

// 检查是否为移动设备
export const isMobile = (): boolean => {
  return window.innerWidth <= breakpoints.sm
}

// 检查是否为平板设备
export const isTablet = (): boolean => {
  return window.innerWidth > breakpoints.sm && window.innerWidth <= breakpoints.md
}

// 检查是否为桌面设备
export const isDesktop = (): boolean => {
  return window.innerWidth > breakpoints.md
}

// 获取当前设备类型
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobile()) return 'mobile'
  if (isTablet()) return 'tablet'
  return 'desktop'
}

// 监听窗口大小变化
export const onResize = (callback: () => void): void => {
  window.addEventListener('resize', callback)
}

// 移除窗口大小变化监听
export const offResize = (callback: () => void): void => {
  window.removeEventListener('resize', callback)
}

// 获取响应式布局的类名
export const getResponsiveClass = (baseClass: string): string => {
  const deviceType = getDeviceType()
  return `${baseClass} ${baseClass}--${deviceType}`
}

// 获取响应式样式
export const getResponsiveStyle = (styles: {
  mobile?: Record<string, string | number>
  tablet?: Record<string, string | number>
  desktop?: Record<string, string | number>
}): Record<string, string | number> => {
  const deviceType = getDeviceType()
  return styles[deviceType] || {}
} 