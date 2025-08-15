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

> **🔒 重要提示：除登录接口外，所有API接口都需要认证。支持两种认证方式：JWT Token 或直接 AUTH_CODE。**

### 认证机制

支持以下两种认证方式，任选其一即可：

#### 方式 1：JWT Token 认证（推荐用于Web应用）
1. **获取 Token**：通过 `/api/auth/login` 接口使用正确的 `AUTH_CODE` 获取 JWT Token
2. **Token 存储**：JWT Token 自动存储在 httpOnly Cookie 中，有效期 24 小时
3. **自动验证**：所有受保护的接口会自动验证 Cookie 中的 JWT Token

#### 方式 2：直接 AUTH_CODE 认证（推荐用于API调用）
1. **直接认证**：在每个API请求中直接提供 AUTH_CODE
2. **灵活方式**：支持通过请求头或请求体传递 AUTH_CODE
3. **无状态**：不需要维护会话状态，适合API集成

### AUTH_CODE 传递方式

当使用直接 AUTH_CODE 认证时，支持以下传递方式：

#### 1. Authorization Header
```http
Authorization: Bearer your-auth-code
```

#### 2. 自定义 Header
```http
x-auth-code: your-auth-code
```

#### 3. 请求体（仅POST/PUT/PATCH请求）
```json
{
  "authCode": "your-auth-code",
  "otherData": "..."
}
```

### 身份验证

#### 🔑 登录（获取 Token）
```http
POST /api/auth/login
Content-Type: application/json

{
  "authCode": "your-auth-code"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "登录成功"
}
```

#### 🛡️ 验证身份（验证 Token 有效性）
```http
GET /api/auth/verify
Cookie: auth-token=<jwt-token>
```

**响应示例：**
```json
{
  "authenticated": true,
  "expiresAt": 1706123456789
}
```

#### 🚪 退出登录（清除 Token）
```http
POST /api/auth/logout
Cookie: auth-token=<jwt-token>
```

**响应示例：**
```json
{
  "success": true,
  "message": "退出登录成功"
}
```

### 系统监控

#### 🏥 健康检查（无需认证）
```http
GET /api/health
```

**响应示例（健康状态）：**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "database": {
    "status": "connected",
    "totalFiles": 152,
    "totalSize": 1073741824,
    "categories": 5
  },
  "storage": {
    "uploadsDirectory": {
      "exists": true,
      "path": "/app/public/uploads"
    }
  },
  "config": {
    "authConfigured": true,
    "jwtConfigured": true
  },
  "responseTime": 15
}
```

**响应示例（降级状态）：**
```json
{
  "status": "degraded",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "database": {
    "status": "error",
    "error": "Database connection failed"
  },
  "config": {
    "authConfigured": false,
    "warning": "AUTH_CODE not configured"
  },
  "responseTime": 25
}
```

#### 💓 简化健康检查（HEAD请求）
```http
HEAD /api/health
```
仅返回HTTP状态码（200表示健康，503表示不健康），适用于负载均衡器。

### 文件操作

> **⚠️ 以下所有接口都需要认证（JWT Token 或 AUTH_CODE 任选其一）**

#### 📤 上传文件

**方式 1：使用 JWT Token（Cookie认证）**
```http
POST /api/upload
Cookie: auth-token=<jwt-token>
Content-Type: multipart/form-data

files: File[]
```

**方式 2：使用 AUTH_CODE（Header认证）**
```http
POST /api/upload
Authorization: Bearer your-auth-code
Content-Type: multipart/form-data

files: File[]
```

**方式 3：使用 AUTH_CODE（自定义Header）**
```http
POST /api/upload
x-auth-code: your-auth-code
Content-Type: multipart/form-data

files: File[]
```

**响应示例：**
```json
{
  "success": true,
  "files": [
    {
      "id": "abc123",
      "name": "image.jpg",
      "url": "/uploads/image_1706123456_abc123.jpg",
      "size": 1024000,
      "type": "image/jpeg",
      "category": "image",
      "uploadedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "message": "Successfully uploaded 1 file(s)"
}
```

#### 📋 获取文件列表

**使用 JWT Token：**
```http
GET /api/files?page=1&limit=15&category=image&search=keyword&sortBy=uploadedAt&sortOrder=DESC
Cookie: auth-token=<jwt-token>
```

**使用 AUTH_CODE：**
```http
GET /api/files?page=1&limit=15&category=image&search=keyword&sortBy=uploadedAt&sortOrder=DESC
Authorization: Bearer your-auth-code
```

**查询参数：**
- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：20）
- `category`: 文件分类过滤（可选）
- `search`: 文件名搜索（可选）
- `sortBy`: 排序字段（uploadedAt/name/size，默认：uploadedAt）
- `sortOrder`: 排序顺序（ASC/DESC，默认：DESC）
- `stats`: 是否返回统计信息（true/false，默认：false）

**响应示例：**
```json
{
  "success": true,
  "files": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalFiles": 73,
    "limit": 15,
    "hasNext": true,
    "hasPrev": false
  },
  "stats": {
    "totalFiles": 73,
    "totalSize": 1073741824,
    "categories": {
      "image": 45,
      "document": 12,
      "video": 8,
      "audio": 5,
      "archive": 3
    }
  }
}
```

#### 📄 获取单个文件信息
```http
GET /api/files/[id]
Cookie: auth-token=<jwt-token>
# 或
Authorization: Bearer your-auth-code
```

**响应示例：**
```json
{
  "success": true,
  "file": {
    "id": "abc123",
    "name": "image.jpg",
    "url": "/uploads/image_1706123456_abc123.jpg",
    "size": 1024000,
    "type": "image/jpeg",
    "category": "image",
    "uploadedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

#### 🗑️ 删除单个文件
```http
DELETE /api/files/[id]
Cookie: auth-token=<jwt-token>
# 或
Authorization: Bearer your-auth-code
```

**响应示例：**
```json
{
  "success": true,
  "message": "File image.jpg deleted successfully"
}
```

#### 🗂️ 批量删除文件

**使用 JWT Token：**
```http
POST /api/files/batch-delete
Cookie: auth-token=<jwt-token>
Content-Type: application/json

{
  "fileIds": ["id1", "id2", "id3"]
}
```

**使用 AUTH_CODE（Header方式）：**
```http
POST /api/files/batch-delete
Authorization: Bearer your-auth-code
Content-Type: application/json

{
  "fileIds": ["id1", "id2", "id3"]
}
```

**使用 AUTH_CODE（请求体方式）：**
```http
POST /api/files/batch-delete
Content-Type: application/json

{
  "authCode": "your-auth-code",
  "fileIds": ["id1", "id2", "id3"]
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "Successfully deleted 2 files",
  "results": {
    "successful": ["id1", "id2"],
    "failed": [
      {
        "id": "id3",
        "error": "File not found"
      }
    ],
    "totalSize": 2048000
  }
}
```

### 错误响应

当请求未认证或认证失败时，所有受保护的接口将返回：

**未找到认证信息：**
```json
{
  "error": "未找到认证token或AUTH_CODE，请先登录或提供有效的AUTH_CODE"
}
```

**JWT Token过期：**
```json
{
  "error": "认证已过期，请重新登录或使用AUTH_CODE"
}
```

**无效的认证信息：**
```json
{
  "error": "无效的认证token，请重新登录或使用AUTH_CODE"
}
```

**AUTH_CODE错误：**
```json
{
  "error": "授权码无效"
}
```

### 使用示例

#### JavaScript/TypeScript 客户端示例

**方式 1：使用 JWT Token（推荐用于Web应用）**

```javascript
// 1. 登录获取 Token
async function login(authCode) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 重要：包含 cookies
    body: JSON.stringify({ authCode })
  });
  
  return await response.json();
}

// 2. 上传文件（使用JWT Token）
async function uploadFiles(files) {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    credentials: 'include', // 重要：包含认证 cookie
    body: formData
  });
  
  return await response.json();
}
```

**方式 2：使用 AUTH_CODE（推荐用于API集成）**

```javascript
// 直接使用 AUTH_CODE 上传文件
async function uploadFilesWithAuthCode(files, authCode) {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authCode}` // 直接传递 AUTH_CODE
    },
    body: formData
  });
  
  return await response.json();
}

// 使用 AUTH_CODE 获取文件列表
async function getFilesWithAuthCode(authCode, page = 1, category = '') {
  const params = new URLSearchParams({ page, limit: 15 });
  if (category) params.append('category', category);
  
  const response = await fetch(`/api/files?${params}`, {
    headers: {
      'Authorization': `Bearer ${authCode}` // 直接传递 AUTH_CODE
    }
  });
  
  return await response.json();
}

// 使用 AUTH_CODE 批量删除文件
async function batchDeleteWithAuthCode(authCode, fileIds) {
  const response = await fetch('/api/files/batch-delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authCode}` // 通过Header传递
    },
    body: JSON.stringify({ fileIds })
  });
  
  return await response.json();
}

// 或者通过请求体传递 AUTH_CODE
async function batchDeleteWithAuthCodeInBody(authCode, fileIds) {
  const response = await fetch('/api/files/batch-delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      authCode, // 通过请求体传递
      fileIds 
    })
  });
  
  return await response.json();
}
```

#### cURL 示例

**方式 1：使用 JWT Token（Cookie认证）**

```bash
# 1. 登录获取JWT Token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"authCode":"your-auth-code"}' \
  -c cookies.txt

# 2. 使用Cookie上传文件
curl -X POST http://localhost:3001/api/upload \
  -b cookies.txt \
  -F "files=@/path/to/your/file.jpg"

# 3. 使用Cookie获取文件列表
curl -X GET "http://localhost:3001/api/files?page=1&limit=10" \
  -b cookies.txt
```

**方式 2：使用 AUTH_CODE（直接认证）**

```bash
# 1. 使用 Authorization Header 上传文件
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer your-auth-code" \
  -F "files=@/path/to/your/file.jpg"

# 2. 使用自定义Header上传文件
curl -X POST http://localhost:3001/api/upload \
  -H "x-auth-code: your-auth-code" \
  -F "files=@/path/to/your/file.jpg"

# 3. 使用 AUTH_CODE 获取文件列表
curl -X GET "http://localhost:3001/api/files?page=1&limit=10" \
  -H "Authorization: Bearer your-auth-code"

# 4. 使用 AUTH_CODE 删除文件
curl -X DELETE http://localhost:3001/api/files/your-file-id \
  -H "Authorization: Bearer your-auth-code"

# 5. 使用 AUTH_CODE 批量删除（Header方式）
curl -X POST http://localhost:3001/api/files/batch-delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-code" \
  -d '{"fileIds":["id1","id2","id3"]}'

# 6. 使用 AUTH_CODE 批量删除（请求体方式）
curl -X POST http://localhost:3001/api/files/batch-delete \
  -H "Content-Type: application/json" \
  -d '{"authCode":"your-auth-code","fileIds":["id1","id2","id3"]}'
```

### 认证方式选择建议

- **Web 应用开发**：使用 JWT Token 方式，更安全且用户体验更好
- **API 集成/脚本**：使用 AUTH_CODE 方式，更简单且无状态
- **移动应用**：可根据需求选择，JWT Token 适合长期会话
- **第三方集成**：推荐 AUTH_CODE 方式，避免会话管理复杂性

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
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

#### 健康检查配置说明

- **test**: 使用 `/api/health` 端点进行健康检查
- **interval**: 每30秒执行一次检查
- **timeout**: 单次检查超时时间10秒
- **retries**: 连续失败3次后标记为不健康
- **start_period**: 容器启动后等待60秒再开始健康检查

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

## 📊 性能与监控

### 健康检查系统

应用程序提供完整的健康检查功能：

```bash
# 检查应用健康状态
curl http://localhost:3000/api/health

# 简化健康检查（仅状态码）
curl -I http://localhost:3000/api/health
```

#### 健康状态说明

- **healthy**: 所有系统正常运行
- **degraded**: 部分功能异常但服务可用
- **unhealthy**: 服务不可用

#### Docker 健康检查

容器运行时可通过以下命令查看健康状态：

```bash
# 查看容器健康状态
docker ps

# 查看详细健康检查日志
docker inspect tubed-app | grep -A 10 Health
```

### 性能监控

应用程序包含内置的性能监控：

- Web Vitals 跟踪
- 上传进度指示器
- 实时文件处理状态
- 健康检查响应时间监控

### 日志记录

```javascript
// API 响应日志
console.log(`文件已上传: ${filename}, 大小: ${size}`)
console.error(`上传失败: ${error.message}`)

// 健康检查日志
console.log(`健康检查: ${status}, 响应时间: ${responseTime}ms`)
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