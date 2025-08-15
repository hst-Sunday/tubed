# Tubed

<div align="center">

![Tubed Banner](./public/logo.png)

*下一代赛博朋克风格文件托管服务*

[![CI/CD](https://img.shields.io/badge/CI%2FCD-%E5%B0%B1%E7%BB%AA-brightgreen?style=flat-square)](#部署)
[![Docker](https://img.shields.io/badge/Docker-%E6%94%AF%E6%8C%81-blue?style=flat-square)](#docker-部署)
[![许可证](https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF%E8%AF%81-MIT-cyan?style=flat-square)](#许可证)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green?style=flat-square)](#环境要求)

</div>

## ✨ 功能特性

- 🔥 **拖拽上传** - 直观的文件上传体验
- 📋 **粘贴上传** - 使用 Ctrl+V 直接从剪贴板上传文件
- 🎯 **多文件类型** - 支持图片、文档、视频、音频和压缩文件
- 🔐 **安全认证** - 基于 JWT 的身份验证和自定义验证码
- 💾 **SQLite 数据库** - 轻量级且可靠的数据存储
- 🐳 **Docker 就绪** - 简单的容器化部署
- ⚡ **Next.js 15** - 基于最新 React 框架构建
- 🎨 **赛博朋克界面** - 炫酷的霓虹主题界面
- 📱 **响应式设计** - 在所有设备上完美运行
- 🚀 **高性能** - 为速度和效率而优化

## 📋 目录

- [功能特性](#-功能特性)
- [环境要求](#-环境要求)
- [快速开始](#-快速开始)
- [配置说明](#-配置说明)
- [使用指南](#-使用指南)
- [API 接口](#-api-接口)
- [部署指南](#-部署指南)
- [项目结构](#-项目结构)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

## 🔧 环境要求

- **Node.js** 20.x 或更高版本
- **npm** 或 **yarn** 包管理器
- **Docker**（可选，用于容器化部署）

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/tubed.git
cd tubed
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

在根目录创建 `.env.local` 文件：

```bash
# 身份验证
AUTH_CODE=your-secret-auth-code
JWT_SECRET=your-jwt-secret-key

# 可选配置
NODE_ENV=development
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3001](http://localhost:3001) 查看应用程序。

## ⚙️ 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `AUTH_CODE` | 身份验证密码 | - | ✅ |
| `JWT_SECRET` | JWT 签名密钥 | - | ✅ |
| `NODE_ENV` | 环境模式 | `development` | ❌ |

### 文件上传限制

| 文件类型 | 支持格式 | 最大大小 |
|----------|----------|----------|
| **图片** | jpg, png, gif, webp, svg | 10MB |
| **文档** | doc, docx, txt, pdf | 50MB |
| **视频** | mp4, avi, mov, webm | 500MB |
| **音频** | mp3, wav, flac, aac | 100MB |
| **压缩包** | zip, rar, 7z, tar | 200MB |
| **代码** | js, ts, html, css, py | 10MB |

## 📖 使用指南

### 文件上传

1. **拖拽上传**：直接将文件拖拽到上传区域
2. **点击上传**：点击上传区域选择文件
3. **粘贴上传**：使用 Ctrl+V 从剪贴板上传

### 文件管理

- **查看文件**：导航到 `/dashboard` 管理已上传的文件
- **删除文件**：使用单个文件的删除按钮
- **批量删除**：选择多个文件进行批量删除
- **复制链接**：点击文件复制其公共 URL

### 快捷键

- `Ctrl+A`：选择所有文件
- `Delete`：删除选中的文件
- `Escape`：清除选择
- `Ctrl+V`：粘贴上传

## 📡 API 接口

### 身份验证

#### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "authCode": "your-auth-code"
}
```

#### 验证身份
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

#### 退出登录
```http
POST /api/auth/logout
```

### 文件操作

#### 上传文件
```http
POST /api/upload
Content-Type: multipart/form-data

files: File[]
```

#### 获取文件列表
```http
GET /api/files?page=1&limit=15&category=image&search=keyword
```

#### 删除文件
```http
DELETE /api/files/[id]
```

#### 批量删除
```http
POST /api/files/batch-delete
Content-Type: application/json

{
  "fileIds": ["id1", "id2", "id3"]
}
```

## 🚀 部署指南

### Docker 部署

1. **构建镜像**
```bash
docker build -t tubed .
```

2. **运行容器**
```bash
docker run -d \
  --name tubed \
  -p 3000:3000 \
  -e AUTH_CODE=your-secret-code \
  -e JWT_SECRET=your-jwt-secret \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/public/uploads:/app/public/uploads \
  tubed
```

### Docker Compose

```yaml
version: '3.8'
services:
  tubed:
    build: .
    ports:
      - "3000:3000"
    environment:
      - AUTH_CODE=your-secret-code
      - JWT_SECRET=your-jwt-secret
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
      - ./public/uploads:/app/public/uploads
    restart: unless-stopped
```

### 生产环境构建

1. **构建应用**
```bash
npm run build
```

2. **启动生产服务器**
```bash
npm start
```

## 📁 项目结构

```
tubed/
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   ├── dashboard/         # 文件管理页面
│   ├── login/            # 登录页面
│   └── page.tsx          # 首页
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件
│   ├── auth-guard.tsx    # 身份验证包装器
│   ├── file-card.tsx     # 文件显示组件
│   └── upload-zone.tsx   # 上传界面
├── lib/                   # 工具库
│   ├── auth.ts           # 身份验证逻辑
│   ├── database.ts       # 数据库操作
│   ├── file-types.ts     # 文件类型定义
│   └── utils.ts          # 辅助函数
├── data/                  # SQLite 数据库文件
├── public/uploads/        # 上传文件存储
├── Dockerfile            # Docker 配置
└── README.md
```

### 可用脚本

```bash
# 开发环境
npm run dev

# 代码检查
npm run lint

# 生产构建
npm run build

# 生产启动
npm start
```

### 技术栈

- **框架**：Next.js 15 with App Router
- **React**：React 19
- **数据库**：SQLite with better-sqlite3
- **身份验证**：JWT with httpOnly cookies
- **样式**：Tailwind CSS v4 + 自定义 CSS
- **组件**：shadcn/ui
- **图标**：Lucide React
- **部署**：Docker + GitHub Actions

## 🎨 赛博朋克主题

### 色彩配色

应用程序使用自定义赛博朋克配色方案：

```css
:root {
  --neon-cyan: oklch(85% 0.2 200);
  --neon-purple: oklch(70% 0.25 300);
  --dark-bg: oklch(15% 0.02 240);
  --holographic: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00);
}
```

### 霓虹效果

```css
.neon-glow {
  box-shadow: 
    0 0 8px rgba(0, 255, 255, 0.8),
    0 0 16px rgba(0, 255, 255, 0.6),
    0 0 24px rgba(0, 255, 255, 0.4);
}
```

## 🔒 安全性

- **身份验证**：安全的 JWT 令牌身份验证
- **文件验证**：全面的文件类型和大小验证
- **CSRF 保护**：httpOnly cookies 防止 XSS 攻击
- **访问控制**：受保护的路由和 API 端点
- **输入清理**：所有用户输入都经过适当清理

## 📊 性能

### 监控

应用程序包含内置的性能监控：

- Web Vitals 跟踪
- 上传进度指示器
- 实时文件处理状态

### 优化

```javascript
// API 响应日志
console.log(`文件已上传: ${filename}, 大小: ${size}`)
console.error(`上传失败: ${error.message}`)
```

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

### 开发流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 开发规范

- 遵循 ESLint 配置
- 使用 TypeScript 确保类型安全
- 应用 Prettier 进行代码格式化
- 编写描述性的提交信息

### 错误报告

报告错误时，请包含：

1. 问题的清晰描述
2. 重现步骤
3. 预期与实际行为
4. 环境详情（操作系统、浏览器等）

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关资源

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 功能
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Lucide 图标](https://lucide.dev/) - 精美的图标库

## 📧 支持

- **仓库地址**：[https://github.com/yourusername/tubed](https://github.com/hst-Sunday/tubed)
- **问题反馈**：[GitHub Issues](https://github.com/hst-Sunday/tubed/issues)
- **邮箱联系**：sunday@sundaysto.club

---

<div align="center">

**用 ❤️ 和赛博朋克美学制作**

*Tubed - 文件遇见未来的地方*

</div>