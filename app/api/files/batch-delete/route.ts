import { NextRequest, NextResponse } from "next/server"
import { getFileById, deleteFile } from "@/lib/database"
import path from "path"
import { unlink } from "fs/promises"

export async function POST(request: NextRequest) {
  try {
    const { fileIds }: { fileIds: string[] } = await request.json()
    
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid file IDs provided' },
        { status: 400 }
      )
    }

    const results = {
      successful: [] as string[],
      failed: [] as { id: string; error: string }[],
      totalSize: 0
    }

    // 处理每个文件的删除
    for (const fileId of fileIds) {
      try {
        // 获取文件信息
        const file = getFileById(fileId)
        
        if (!file) {
          results.failed.push({ id: fileId, error: 'File not found' })
          continue
        }

        // 从数据库中删除记录
        const deleted = deleteFile(fileId)
        
        if (!deleted) {
          results.failed.push({ id: fileId, error: 'Failed to delete from database' })
          continue
        }

        // 删除实际文件
        try {
          const filePath = path.join(process.cwd(), 'public', file.url)
          await unlink(filePath)
        } catch (fileError) {
          console.error(`Failed to delete physical file for ${fileId}:`, fileError)
          // 继续执行，因为数据库记录已经删除了
        }

        results.successful.push(fileId)
        results.totalSize += file.size
        
      } catch (error) {
        console.error(`Error deleting file ${fileId}:`, error)
        results.failed.push({ 
          id: fileId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${results.successful.length} files`,
      results
    })

  } catch (error) {
    console.error('Batch delete error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process batch delete', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}