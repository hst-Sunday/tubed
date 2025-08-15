import { NextRequest, NextResponse } from "next/server"
import { getFiles, getFileStats, searchFiles } from "@/lib/database"
// 导入迁移模块以确保在首次使用数据库时执行迁移
import "@/lib/migrate"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 获取查询参数
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || undefined
    const sortBy = searchParams.get('sortBy') as 'uploadedAt' | 'name' | 'size' || 'uploadedAt'
    const sortOrder = searchParams.get('sortOrder') as 'ASC' | 'DESC' || 'DESC'
    const search = searchParams.get('search') || undefined
    const stats = searchParams.get('stats') === 'true'

    // 如果请求统计信息
    if (stats) {
      const statistics = getFileStats()
      return NextResponse.json({
        success: true,
        stats: statistics
      })
    }

    const offset = (page - 1) * limit

    let files
    if (search) {
      // 搜索文件
      files = searchFiles(search, { 
        limit, 
        offset, 
        category 
      })
    } else {
      // 获取文件列表
      files = getFiles({ 
        limit, 
        offset, 
        category, 
        sortBy, 
        sortOrder 
      })
    }

    // 获取统计信息用于分页
    const statistics = getFileStats()
    const totalFiles = category 
      ? statistics.categories[category] || 0 
      : statistics.totalFiles

    const totalPages = Math.ceil(totalFiles / limit)

    return NextResponse.json({
      success: true,
      files,
      pagination: {
        currentPage: page,
        totalPages,
        totalFiles,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: statistics
    })

  } catch (error) {
    console.error('Files API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch files', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}