"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen digital-rain flex items-center justify-center">
        <div className="scan-lines fixed inset-0 pointer-events-none z-10"></div>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto neon-glow"></div>
          <p className="text-primary font-medium text-glow">验证身份中...</p>
        </div>
      </div>
    )
  }

  // 如果未认证，不渲染子组件（将重定向到登录页）
  if (!isAuthenticated) {
    return null
  }

  // 已认证，渲染受保护的内容
  return <>{children}</>
}