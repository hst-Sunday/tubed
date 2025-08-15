import { NextResponse } from "next/server"

export async function POST() {
  try {
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