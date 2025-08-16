import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const AUTH_CODE = process.env.AUTH_CODE

export interface AuthResult {
  success: boolean
  response?: NextResponse
  decoded?: jwt.JwtPayload
  authMethod?: 'jwt' | 'authcode'
}

/**
 * 验证认证的中间件函数
 * 支持两种认证方式：
 * 1. JWT Token (从cookie中获取)
 * 2. 直接AUTH_CODE (从请求头或请求体中获取)
 * @param request - NextRequest对象
 * @returns AuthResult - 包含验证结果和可能的错误响应
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // 方式1: 检查是否直接提供了AUTH_CODE
    const authResult = await checkDirectAuthCode(request)
    if (authResult.success) {
      return authResult
    }

    // 方式2: 验证JWT token
    return verifyJWTToken(request)

  } catch (error) {
    console.error("Authentication verification error:", error)
    return {
      success: false,
      response: NextResponse.json(
        { error: "认证验证失败" },
        { status: 500 }
      )
    }
  }
}

/**
 * 检查直接提供的AUTH_CODE
 * 支持从以下位置获取AUTH_CODE：
 * - Authorization header: "Bearer your-auth-code"
 * - x-auth-code header: "your-auth-code"  
 */
async function checkDirectAuthCode(request: NextRequest): Promise<AuthResult> {
  if (!AUTH_CODE) {
    return { success: false }
  }

  let providedAuthCode: string | null = null

  // 1. 从Authorization header获取
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    providedAuthCode = authHeader.slice(7) // 移除 "Bearer " 前缀
  }

  // 2. 从x-auth-code header获取
  if (!providedAuthCode) {
    providedAuthCode = request.headers.get("x-auth-code")
  }

  // 注意：不从请求体读取AUTH_CODE，避免与后续API处理冲突
  // 如需要在请求体中传递AUTH_CODE，请使用header方式：
  // - Authorization: "Bearer your-auth-code"  
  // - x-auth-code: "your-auth-code"

  // 验证AUTH_CODE
  if (providedAuthCode && providedAuthCode === AUTH_CODE) {
    return {
      success: true,
      authMethod: 'authcode'
    }
  }

  return { success: false }
}

/**
 * 验证JWT token
 */
function verifyJWTToken(request: NextRequest): AuthResult {
  try {
    // 优先从Authorization header获取token，fallback到cookie
    let token: string | undefined
    
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7) // 移除 "Bearer " 前缀
    } else {
      // fallback到cookie方式（保持向后兼容）
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "未找到认证token或AUTH_CODE，请先登录或提供有效的AUTH_CODE" },
          { status: 401 }
        )
      }
    }

    // 验证JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload

    // 检查token是否包含必要的信息
    if (!decoded.authenticated) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "无效的认证token" },
          { status: 401 }
        )
      }
    }

    return {
      success: true,
      decoded,
      authMethod: 'jwt'
    }

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "认证已过期，请重新登录或使用AUTH_CODE" },
          { status: 401 }
        )
      }
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "无效的认证token，请重新登录或使用AUTH_CODE" },
          { status: 401 }
        )
      }
    }

    console.error("Token verification error:", error)
    return {
      success: false,
      response: NextResponse.json(
        { error: "认证验证失败" },
        { status: 500 }
      )
    }
  }
}