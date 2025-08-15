import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-middleware"

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份（可选，但为了一致性保留）
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return authResult.response!
    }

    // 清除认证cookie
    const response = NextResponse.json(
      { 
        success: true,
        message: "退出登录成功" 
      },
      { status: 200 }
    )

    // 删除cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0 // 立即过期
    })

    return response

  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "退出登录失败" },
      { status: 500 }
    )
  }
}