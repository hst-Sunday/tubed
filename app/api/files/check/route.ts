import { NextRequest, NextResponse } from "next/server"
import { existsSync } from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileUrl = searchParams.get('url')
  
  if (!fileUrl) {
    return NextResponse.json({ error: 'No file URL provided' }, { status: 400 })
  }
  
  try {
    // 构建文件路径
    const filePath = path.join(process.cwd(), 'public', fileUrl)
    
    // 安全检查：确保路径在 public 目录内
    const publicDir = path.join(process.cwd(), 'public')
    const resolvedPath = path.resolve(filePath)
    if (!resolvedPath.startsWith(publicDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 })
    }
    
    const exists = existsSync(filePath)
    
    return NextResponse.json({
      url: fileUrl,
      exists,
      filePath: resolvedPath,
      debug: {
        requested: fileUrl,
        resolved: resolvedPath,
        publicDir
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}