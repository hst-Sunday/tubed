import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-middleware"
import Database from "better-sqlite3"
import { existsSync } from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return authResult.response!
    }

    // 连接数据库
    const dbPath = path.join(process.cwd(), 'data', 'tubed.db')
    const db = new Database(dbPath)
    
    // 获取所有文件记录
    const files = db.prepare('SELECT * FROM files').all() as Array<{
      id: string
      name: string
      url: string
      size: number
      type: string
      category: string
      uploadedAt: string
    }>
    
    const orphanedFiles: typeof files = []
    
    // 检查每个文件是否存在
    for (const file of files) {
      const filePath = path.join(process.cwd(), 'public', file.url)
      if (!existsSync(filePath)) {
        orphanedFiles.push(file)
      }
    }
    
    if (orphanedFiles.length > 0) {
      // 删除孤立的记录
      const deleteStmt = db.prepare('DELETE FROM files WHERE id = ?')
      const transaction = db.transaction((files: typeof orphanedFiles) => {
        for (const file of files) {
          deleteStmt.run(file.id)
        }
      })
      
      transaction(orphanedFiles)
    }
    
    db.close()
    
    return NextResponse.json({
      success: true,
      message: `清理完成，删除了 ${orphanedFiles.length} 个孤立的文件记录`,
      deletedFiles: orphanedFiles.map(f => ({ id: f.id, name: f.name, url: f.url })),
      remainingCount: files.length - orphanedFiles.length
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to cleanup orphaned files', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}