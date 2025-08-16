import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-middleware"

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份（可选，但为了一致性保留）
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return authResult.response!
    }

    // 直接返回成功响应，前端负责清除localStorage中的token
    return NextResponse.json(
      { 
        success: true,
        message: "退出登录成功" 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "退出登录失败" },
      { status: 500 }
    )
  }
}