# CogniBlock Frontend

<div align="center">
    <img width="2560" height="1440" alt="banner" src="https://github.com/user-attachments/assets/efe4bf2d-0c6e-4532-abe3-583271b22b59" />
  **智能知识管理系统前端应用**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
</div>

## 📖 项目简介

CogniBlock 是一个现代化的智能知识管理系统，旨在帮助用户高效地捕获、组织和管理各种形式的知识内容。本项目是 CogniBlock 的前端应用，采用 Next.js 15 构建，提供直观的用户界面和流畅的交互体验。

### ✨ 核心特性

- 🎨 **可视化知识画布** - 拖拽式知识管理界面
- 🤖 **AI 智能分析** - 集成 Google AI Genkit，提供智能内容提取
- 📱 **多模态输入** - 支持文本、图片、语音等多种内容类型
- 🔐 **安全认证** - OAuth 2.0 认证系统
- 🌐 **响应式设计** - 完美适配桌面端和移动端
- 🎭 **现代化 UI** - 基于 Radix UI 和 Tailwind CSS

## 🚀 技术栈

### 核心框架
- **Next.js 15.3.3** - React 全栈框架，支持 App Router
- **React 18.3.1** - 用户界面库
- **TypeScript 5** - 类型安全的 JavaScript

### UI/UX
- **Tailwind CSS 3.4.1** - 原子化 CSS 框架
- **Radix UI** - 无障碍访问组件库
- **Framer Motion 12.23.9** - 动画库
- **GSAP 3.13.0** - 高性能动画引擎
- **Lucide React** - 现代化图标库

### AI 集成
- **Google AI Genkit 1.14.1** - AI 开发框架
- **Gemini 2.0 Flash** - Google AI 模型

### 开发工具
- **React Hook Form** - 表单管理
- **Zod** - 模式验证
- **@dnd-kit** - 拖拽功能
- **React Markdown** - Markdown 渲染

## 📦 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm、yarn 或 pnpm 包管理器

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/STCN1-Advx/CogniBlock-FrontEnd.git
   cd CogniBlock-FrontEnd
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   # 或
   pnpm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   ```
   
   编辑 `.env.local` 文件，配置必要的环境变量：
    ```env
    NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
    NEXT_PUBLIC_IMAGE_API_BASE_URL=http://localhost:7860
    GOOGLE_AI_API_KEY=your_google_ai_api_key
    ```

4. **启动开发服务器**
   ```bash
   npm run dev
   # 或
   yarn dev
   # 或
   pnpm dev
   ```

5. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🏗️ 项目结构

```
CogniBlock-FrontEnd/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── auth/              # 认证相关页面
│   │   ├── canvas/            # 知识画布页面
│   │   ├── login/             # 登录页面
│   │   ├── photo/             # 图片处理页面
│   │   ├── profile/           # 用户资料页面
│   │   └── user/              # 用户管理页面
│   ├── components/            # React 组件
│   │   ├── ui/               # UI 组件库
│   │   ├── auth-guard.tsx    # 认证守卫
│   │   └── canvas-sidebar.tsx # 画布侧边栏
│   ├── contexts/             # React Context
│   │   └── user-context.tsx  # 用户状态管理
│   ├── hooks/                # 自定义 Hooks
│   ├── lib/                  # 工具库和 API 客户端
│   │   ├── api-client.ts     # API 客户端
│   │   ├── auth-api.ts       # 认证 API
│   │   ├── canvas-api.ts     # 画布 API
│   │   └── popup-oauth.ts    # OAuth 弹窗
│   └── ai/                   # AI 集成
│       ├── genkit.ts         # Genkit 配置
│       └── dev.ts            # 开发环境配置
├── public/                   # 静态资源
│   ├── icons/               # 图标文件
│   ├── patterns/            # 背景图案
│   └── oauth_callback.html  # OAuth 回调页面
├── docs/                    # 项目文档
└── components.json          # shadcn/ui 配置
```

## 🔧 可用脚本

```bash
# 开发模式（使用 Turbopack）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 类型检查
npm run typecheck

# AI 开发服务器
npm run genkit:dev

# AI 监听模式
npm run genkit:watch
```

## 🌐 部署

### Vercel 部署（推荐）

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 配置环境变量
4. 部署完成

### 其他平台

项目支持部署到任何支持 Next.js 的平台：
- Netlify
- AWS Amplify
- Google Cloud Platform
- 自托管服务器

## 🔗 相关项目

- **后端 API**: [CogniBlock-BackEnd](https://github.com/STCN1-Advx/CogniBlock-BackEnd)

## 📄 许可证

本项目采用 GPL-3.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

<div align="center">
  <p>用 ❤️ 构建，为了更好的知识管理体验</p>
</div>
