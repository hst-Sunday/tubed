import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const AUTH_CODE = process.env.AUTH_CODE

export async function POST(request: NextRequest) {
  try {
    const { authCode } = await request.json()

    // 验证必要的环境变量
    if (!AUTH_CODE) {
      return NextResponse.json(
        { error: "服务器配置错误" },
        { status: 500 }
      )
    }

    // 验证授权码
    if (!authCode || authCode !== AUTH_CODE) {
      return NextResponse.json(
        { error: "授权码无效" },
        { status: 401 }
      )
    }

    // 生成JWT token
    const token = jwt.sign(
      { 
        authenticated: true,
        timestamp: Date.now()
      },
      JWT_SECRET,
      { 
        expiresIn: "24h" // 24小时过期
      }
    )

    // 设置httpOnly cookie
    const response = NextResponse.json(
      { 
        success: true,
        message: "登录成功" 
      },
      { status: 200 }
    )

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 // 24小时
    })

    return response

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "登录失败，请重试" },
      { status: 500 }
    )
  }
}