import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { lookup } from "mime-types"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 解析params
    const resolvedParams = await params
    
    // 构建文件路径
    const imagePath = resolvedParams.path.join('/')
    const filePath = path.join(process.cwd(), 'public', 'uploads', imagePath)
    
    // 调试信息
    console.log(`[Image API] Raw params:`, resolvedParams.path)
    console.log(`[Image API] Requesting: ${imagePath}`)
    console.log(`[Image API] File path: ${filePath}`)
    console.log(`[Image API] Exists: ${existsSync(filePath)}`)
    
    // 安全检查：确保路径在 public 目录内
    const publicDir = path.join(process.cwd(), 'public')
    const resolvedPath = path.resolve(filePath)
    if (!resolvedPath.startsWith(publicDir)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return new NextResponse('Not Found', { status: 404 })
    }
    
    // 读取文件
    const fileBuffer = await readFile(filePath)
    
    // 获取MIME类型
    const mimeType = lookup(filePath) || 'application/octet-stream'
    
    // 返回文件
    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Image serving error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}