import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 暂时禁用standalone模式进行测试
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/images/:path*'
      }
    ]
  },
  // 统一设置缓存头，便于CDN按源站策略缓存
  async headers() {
    return [
      // Next 构建产物：强缓存 + immutable
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // 公开静态文件（按需调整TTL）
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      // 上传文件：URL 含时间戳+随机后缀，适合长期缓存
      // 注意：匹配的是“请求路径”，即使内部重写到 /api/images 也不受 /api/* 规则影响
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // API：默认不缓存，并避免因鉴权头产生跨用户缓存
      // 不影响上面的 /uploads/*
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'Vary', value: 'Authorization, Cookie' },
        ],
      },
    ]
  },
  images: {
    unoptimized: true,
    // 允许所有域名的图片（包括本地API路由）
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https', 
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
