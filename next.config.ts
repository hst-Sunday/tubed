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
