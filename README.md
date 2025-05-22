# Ekram Mall

一个基于Django和Vue.js的电商平台系统。

## 功能特点

- 用户认证和授权
- 商品管理
- 订单管理
- 分销商系统
- 支付集成
- 后台管理界面

## 技术栈

### 后端
- Django
- Django REST framework
- PostgreSQL
- Redis

### 前端
- Vue 3
- TypeScript
- Vite
- Element Plus
- Axios

## 开发环境

本项目使用 Vue 3 + TypeScript + Vite 作为前端开发框架。模板使用了 Vue 3 的 `<script setup>` SFCs，查看 [script setup 文档](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) 了解更多。

## 安装说明

1. 克隆仓库
```bash
git clone https://github.com/RuiMaandAmir/front.git
cd front
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，填入必要的配置信息
```

4. 启动开发服务器
```bash
npm run dev
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

MIT License
