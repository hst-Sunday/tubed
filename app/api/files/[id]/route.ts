import { NextRequest, NextResponse } from "next/server"
import { getFileById, deleteFile } from "@/lib/database"
import { verifyAuth } from "@/lib/auth-middleware"
import path from "path"
import { unlink } from "fs/promises"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    // 验证用户身份
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return authResult.response!
    }
    const file = getFileById(params.id)
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      file
    })
  } catch (error) {
    console.error('Get file error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    // 验证用户身份
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return authResult.response!
    }
    // 先获取文件信息
    const file = getFileById(params.id)
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // 从数据库中删除记录
    const deleted = deleteFile(params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete file from database' },
        { status: 500 }
      )
    }

    // 删除实际文件
    try {
      const filePath = path.join(process.cwd(), 'public', file.url)
      await unlink(filePath)
    } catch (fileError) {
      console.error('Failed to delete physical file:', fileError)
      // 继续执行，因为数据库记录已经删除了
    }

    return NextResponse.json({
      success: true,
      message: `File ${file.name} deleted successfully`
    })

  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}