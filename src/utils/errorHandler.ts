import { ElMessage } from 'element-plus'

export function setupGlobalErrorHandler(app: any) {
  app.config.errorHandler = (err: any, vm: any, info: string) => {
    // 控制台输出
    console.error('全局错误:', err, info)
    // 友好提示
    ElMessage.error('系统发生异常，请稍后重试！')
    // 可扩展：上报日志到服务端
  }
} 