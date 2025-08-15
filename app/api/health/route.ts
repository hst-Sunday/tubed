import { NextResponse } from "next/server"
import { existsSync } from "fs"
import path from "path"
import { getFileStats } from "@/lib/database"

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  uptime: number
  version: string
  environment: string
  database?: {
    status: string
    totalFiles?: number
    totalSize?: number
    categories?: number
    error?: string
  }
  storage?: {
    uploadsDirectory: {
      exists: boolean
      path: string
      warning?: string
    }
  }
  config?: {
    authConfigured: boolean
    jwtConfigured: boolean
    warning?: string
  }
  responseTime?: number
}

/**
 * 健康检查路由
 * 提供应用程序运行状态、数据库连接状态和系统信息
 * 不需要认证，用于监控和负载均衡器的健康检查
 */
export async function GET() {
  try {
    const startTime = Date.now()
    
    // 检查基本系统状态
    const health: HealthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "development"
    }

    // 检查数据库状态
    try {
      const stats = getFileStats()
      health.database = {
        status: "connected",
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize,
        categories: Object.keys(stats.categories).length
      }
    } catch (dbError) {
      health.database = {
        status: "error",
        error: dbError instanceof Error ? dbError.message : "Database connection failed"
      }
      health.status = "degraded"
    }

    // 检查上传目录状态
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    health.storage = {
      uploadsDirectory: {
        exists: existsSync(uploadsDir),
        path: uploadsDir
      }
    }

    if (!health.storage.uploadsDirectory.exists) {
      health.status = "degraded"
      health.storage.uploadsDirectory.warning = "Uploads directory does not exist"
    }

    // 检查环境变量
    health.config = {
      authConfigured: !!process.env.AUTH_CODE,
      jwtConfigured: !!process.env.JWT_SECRET
    }

    if (!health.config.authConfigured) {
      health.status = "degraded"
      health.config.warning = "AUTH_CODE not configured"
    }

    // 计算响应时间
    health.responseTime = Date.now() - startTime

    // 根据健康状态返回对应的HTTP状态码
    const statusCode = health.status === "healthy" ? 200 : 
                      health.status === "degraded" ? 200 : 503

    return NextResponse.json(health, { status: statusCode })

  } catch (error) {
    console.error("Health check error:", error)
    
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Health check failed",
      uptime: process.uptime()
    }, { status: 503 })
  }
}

/**
 * 简化的健康检查端点
 * 仅返回基本状态信息，适用于负载均衡器
 */
export async function HEAD() {
  try {
    // 快速检查数据库
    getFileStats()
    
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}