import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    // 从cookie中获取token
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "未找到认证token" },
        { status: 401 }
      )
    }

    // 验证JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload

    // 检查token是否包含必要的信息
    if (!decoded.authenticated) {
      return NextResponse.json(
        { authenticated: false, error: "无效的token" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        authenticated: true,
        expiresAt: decoded.exp ? decoded.exp * 1000 : null // 转换为毫秒
      },
      { status: 200 }
    )

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { authenticated: false, error: "Token已过期" },
        { status: 401 }
      )
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { authenticated: false, error: "无效的token" },
        { status: 401 }
      )
    }

    console.error("Token verification error:", error)
    return NextResponse.json(
      { authenticated: false, error: "验证失败" },
      { status: 500 }
    )
  }
}