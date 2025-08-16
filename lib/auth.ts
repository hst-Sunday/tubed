"use client"

import { useState, useEffect } from "react"
import { apiRequest } from "./http-client"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()

    // 监听401事件，自动更新认证状态
    const handle401 = () => {
      setIsAuthenticated(false)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-401', handle401)
      
      return () => {
        window.removeEventListener('auth-401', handle401)
      }
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await apiRequest("/api/auth/verify", {
        method: "GET"
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(data.authenticated)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (authCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ authCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsAuthenticated(true)
        return { success: true }
      } else {
        return { success: false, error: data.error || "登录失败" }
      }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error: "网络错误，请重试" }
    }
  }

  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST"
      })
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsAuthenticated(false)
    }
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  }
}