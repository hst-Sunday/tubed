"use client"

// HTTP客户端工具，统一处理401响应和自动跳转登录页面

let isRedirecting = false

/**
 * 统一的fetch包装器，自动处理401响应
 */
export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  // 确保包含认证cookie
  const requestOptions: RequestInit = {
    credentials: "include",
    ...options,
  }

  try {
    const response = await fetch(url, requestOptions)

    // 如果是401且不是登录接口，且当前不在登录页面，自动跳转到登录页
    if (response.status === 401 && 
        !url.includes('/api/auth/login') && 
        !isRedirecting &&
        typeof window !== 'undefined' && 
        !window.location.pathname.startsWith('/login')) {
      
      isRedirecting = true
      
      // 清除本地认证状态
      // 触发全局事件，通知useAuth hook更新状态
      window.dispatchEvent(new CustomEvent('auth-401'))
      
      // 跳转到登录页
      window.location.href = '/login'
      
      // 重置重定向标志（延迟重置避免重复触发）
      setTimeout(() => {
        isRedirecting = false
      }, 1000)
    }

    return response
  } catch (error) {
    // 网络错误等其他错误直接抛出
    throw error
  }
}

/**
 * GET 请求的便捷方法
 */
export async function apiGet(url: string, options: RequestInit = {}): Promise<Response> {
  return apiRequest(url, {
    method: 'GET',
    ...options,
  })
}

/**
 * POST 请求的便捷方法
 */
export async function apiPost(url: string, data?: unknown, options: RequestInit = {}): Promise<Response> {
  const requestOptions: RequestInit = {
    method: 'POST',
    ...options,
  }

  // 如果是FormData，不要设置Content-Type，让浏览器自动设置
  if (data && !(data instanceof FormData)) {
    requestOptions.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    requestOptions.body = JSON.stringify(data)
  } else if (data instanceof FormData) {
    requestOptions.body = data
  }

  return apiRequest(url, requestOptions)
}

/**
 * DELETE 请求的便捷方法
 */
export async function apiDelete(url: string, options: RequestInit = {}): Promise<Response> {
  return apiRequest(url, {
    method: 'DELETE',
    ...options,
  })
}