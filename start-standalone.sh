#!/bin/bash

# 构建项目
npm run build

# 复制静态文件到 standalone 目录
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# 启动 standalone 服务器
cd .next/standalone && node server.js