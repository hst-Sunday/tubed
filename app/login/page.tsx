"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/auth"

export default function LoginPage() {
  const [authCode, setAuthCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // 如果已认证，重定向到主页
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await login(authCode)
      
      if (result.success) {
        router.push("/")
      } else {
        setError(result.error || "授权码无效，请重新输入")
        setAuthCode("")
      }
    } catch {
      setError("登录失败，请重试")
      setAuthCode("")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen digital-rain flex items-center justify-center p-4">
      <div className="scan-lines fixed inset-0 pointer-events-none z-10"></div>
      
      <Card className="w-full max-w-md p-8 space-y-8 neon-glow holographic relative">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center mx-auto neon-glow float">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-[var(--font-dm-sans)] text-primary text-glow">安全验证</h1>
            <p className="text-muted-foreground">请输入授权码以访问 CyberHost</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="authCode" className="text-sm font-medium text-secondary">
              授权码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="authCode"
                type={showPassword ? "text" : "password"}
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder-muted-foreground neon-glow-green transition-all duration-300"
                placeholder="请输入授权码"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-destructive text-sm text-center neon-glow-red">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground py-3 neon-glow hover:scale-105 transition-all duration-300"
            disabled={isLoading || !authCode.trim()}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                <span>验证中...</span>
              </div>
            ) : (
              "进入 CyberHost"
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          <p>© 2025 CyberHost. 安全访问，赛博朋克图床服务</p>
        </div>
      </Card>
    </div>
  )
}