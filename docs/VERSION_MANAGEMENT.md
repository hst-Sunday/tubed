# 版本管理指南

TuBed 项目的版本管理系统，支持自动化版本更新、构建和发布流程。

## 快速开始

### 1. 简单版本更新

```bash
# 补丁版本 (0.1.0 -> 0.1.1) - 用于 bug 修复
npm run version:patch

# 次要版本 (0.1.0 -> 0.2.0) - 用于新功能
npm run version:minor

# 主要版本 (0.1.0 -> 1.0.0) - 用于重大更改
npm run version:major

# 预发布版本
npm run version:beta   # 0.1.0 -> 0.1.1-beta.0
npm run version:alpha  # 0.1.0 -> 0.1.1-alpha.0
```

### 2. 完整发布流程

```bash
# 自动化发布 (推荐)
npm run release:patch  # 版本更新 + 构建 + Git 标签 + Docker 镜像
npm run release:minor
npm run release:major

# 手动步骤
./scripts/release.sh patch
```

### 3. Docker 构建

```bash
# 使用动态版本构建 Docker 镜像
./scripts/docker-build.sh

# 手动构建
docker build -t tubed:$(node -p "require('./package.json').version") .
```

## 版本信息展示

### 在组件中使用

```tsx
import { VersionInfo } from "@/components/version-info"

// 简单版本显示
<VersionInfo />

// 详细版本信息
<VersionInfo showDetails={true} />
```

### 获取版本信息

```tsx
import { 
  getAppVersion, 
  getVersionString, 
  getDetailedVersionInfo 
} from "@/lib/version"

// 同步获取基本版本
const version = getAppVersion() // "0.1.0"
const versionString = getVersionString() // "v0.1.0"

// 异步获取详细信息
const detailedInfo = await getDetailedVersionInfo()
// {
//   version: "0.1.0",
//   buildTime: "2025-01-15T10:30:00Z",
//   gitCommit: "abc1234",
//   releaseType: "patch"
// }
```

## 发布流程详解

### 自动化发布脚本功能

`scripts/release.sh` 执行以下操作：

1. **前置检查**
   - 验证 git 工作目录状态
   - 检查是否有未提交的更改

2. **版本更新**
   - 更新 `package.json` 中的版本号
   - 生成构建信息文件 `public/version.json`

3. **构建应用**
   - 执行 `npm run build`
   - 优化生产版本

4. **Git 操作**
   - 创建版本提交
   - 创建 Git 标签 `v{version}`

5. **Docker 镜像**
   - 构建带版本标签的镜像
   - 更新 `latest` 标签

### 版本信息文件

发布时会生成 `public/version.json`：

```json
{
  "version": "0.1.0",
  "buildTime": "2025-01-15T10:30:00Z",
  "gitCommit": "abc1234",
  "releaseType": "patch"
}
```

## 部署集成

### GitHub Actions 示例

```yaml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy
        run: |
          npm ci
          npm run build
          # 部署逻辑
```

### Docker Compose

```yaml
services:
  tubed:
    image: tubed:latest
    environment:
      - APP_VERSION=${APP_VERSION:-latest}
```

## 最佳实践

### 1. 语义化版本

- **PATCH** (0.0.1): Bug 修复，向后兼容
- **MINOR** (0.1.0): 新功能，向后兼容  
- **MAJOR** (1.0.0): 重大更改，可能不向后兼容

### 2. 发布前检查

```bash
# 确保代码质量
npm run lint
npm run build

# 测试功能
npm run dev  # 手动测试

# 检查 Git 状态
git status
```

### 3. 发布后操作

```bash
# 推送到远程仓库
git push origin main --tags

# 推送 Docker 镜像 (如果使用镜像仓库)
docker push tubed:v0.1.0

# 部署到生产环境
# (根据你的部署流程)
```

## 故障排除

### 版本信息不显示

1. 检查 `public/version.json` 是否存在
2. 确认组件正确导入版本工具函数
3. 查看浏览器控制台错误

### 发布脚本失败

1. 确保工作目录干净：`git status`
2. 检查脚本权限：`chmod +x scripts/release.sh`
3. 验证 Node.js 和 npm 环境

### Docker 构建失败

1. 检查 Dockerfile 是否存在
2. 确认 Docker 服务运行状态
3. 查看构建日志确定具体错误

## 自定义配置

### 修改版本格式

编辑 `lib/version.ts` 中的格式化函数：

```tsx
export function getAppNameWithVersion(): string {
  const version = getAppVersion()
  return `TuBed v${version}` // 自定义格式
}
```

### 添加版本信息

修改 `scripts/release.sh` 在 `version.json` 中添加更多信息：

```bash
cat > public/version.json << EOF
{
  "version": "$NEW_VERSION",
  "buildTime": "$BUILD_TIME",
  "gitCommit": "$GIT_COMMIT",
  "releaseType": "$VERSION_TYPE",
  "buildNumber": "$BUILD_NUMBER"
}
EOF
```