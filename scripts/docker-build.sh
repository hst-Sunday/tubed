#!/bin/bash

# TuBed Docker Build Script
# 使用动态版本号构建 Docker 镜像

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 获取版本信息
VERSION=$(node -p "require('./package.json').version")
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo -e "${BLUE}🐳 构建 TuBed Docker 镜像${NC}"
echo -e "${YELLOW}版本: $VERSION${NC}"
echo -e "${YELLOW}构建时间: $BUILD_TIME${NC}"
echo -e "${YELLOW}Git 提交: $GIT_COMMIT${NC}"

# 构建参数
DOCKER_ARGS="--build-arg VERSION=$VERSION --build-arg BUILD_TIME=$BUILD_TIME --build-arg GIT_COMMIT=$GIT_COMMIT"

# 构建镜像
echo -e "${YELLOW}📦 开始构建...${NC}"
docker build $DOCKER_ARGS -t tubed:$VERSION -t tubed:latest .

echo -e "${GREEN}✅ 构建完成!${NC}"
echo -e "${BLUE}镜像标签:${NC}"
echo "  - tubed:$VERSION"
echo "  - tubed:latest"

# 显示镜像信息
echo -e "${BLUE}📊 镜像信息:${NC}"
docker images tubed --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"