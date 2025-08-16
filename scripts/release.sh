#!/bin/bash

# TuBed Release Script
# 自动化版本更新、构建和发布流程

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查参数
if [ $# -eq 0 ]; then
    echo -e "${RED}错误: 请指定版本类型 (patch|minor|major)${NC}"
    echo "用法: $0 <patch|minor|major>"
    echo "示例: $0 patch"
    exit 1
fi

VERSION_TYPE=$1

# 验证版本类型
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${RED}错误: 无效的版本类型 '$VERSION_TYPE'${NC}"
    echo "支持的版本类型: patch, minor, major"
    exit 1
fi

echo -e "${BLUE}🚀 开始 TuBed 发布流程...${NC}"
echo -e "${YELLOW}版本类型: $VERSION_TYPE${NC}"

# 检查是否在 git 仓库中
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo -e "${RED}错误: 当前目录不是 git 仓库${NC}"
    exit 1
fi

# 检查工作目录是否干净
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}错误: 工作目录有未提交的更改${NC}"
    echo "请先提交或储藏您的更改"
    exit 1
fi

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}当前版本: $CURRENT_VERSION${NC}"

# 更新版本号
echo -e "${YELLOW}📝 更新版本号...${NC}"
npm version $VERSION_TYPE --no-git-tag-version

# 获取新版本
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}新版本: $NEW_VERSION${NC}"

# 生成构建信息
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT=$(git rev-parse --short HEAD)

echo -e "${YELLOW}📦 构建应用...${NC}"
npm run build

# 创建版本信息文件
cat > public/version.json << EOF
{
  "version": "$NEW_VERSION",
  "buildTime": "$BUILD_TIME",
  "gitCommit": "$GIT_COMMIT",
  "releaseType": "$VERSION_TYPE"
}
EOF

echo -e "${GREEN}✅ 版本信息文件已创建: public/version.json${NC}"

# Git 提交和标签
echo -e "${YELLOW}📝 创建 Git 提交和标签...${NC}"
git add .
git commit -m "chore: release v$NEW_VERSION

- Update version to $NEW_VERSION
- Build application
- Generate version info

🤖 Generated with release script"

git tag "v$NEW_VERSION"

echo -e "${GREEN}✅ Git 标签 v$NEW_VERSION 已创建${NC}"

# 构建 Docker 镜像 (如果 Dockerfile 存在)
if [ -f "Dockerfile" ]; then
    echo -e "${YELLOW}🐳 构建 Docker 镜像...${NC}"
    docker build -t tubed:$NEW_VERSION .
    docker tag tubed:$NEW_VERSION tubed:latest
    echo -e "${GREEN}✅ Docker 镜像已构建: tubed:$NEW_VERSION${NC}"
fi

echo -e "${GREEN}🎉 发布完成!${NC}"
echo -e "${BLUE}版本: $NEW_VERSION${NC}"
echo -e "${BLUE}标签: v$NEW_VERSION${NC}"
echo ""
echo -e "${YELLOW}下一步操作:${NC}"
echo "1. 推送到远程仓库: git push origin main --tags"
if [ -f "Dockerfile" ]; then
    echo "2. 推送 Docker 镜像: docker push tubed:$NEW_VERSION"
fi
echo "3. 部署新版本到生产环境"