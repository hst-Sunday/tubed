"use client"

import { useState, useEffect } from "react"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include" // 包含cookies
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 包含cookies
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
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
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