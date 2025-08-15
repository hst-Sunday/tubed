import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { insertFiles, getFileStats, type FileRecord } from './database'

interface OldFileRecord {
  id: string
  name: string
  url: string
  size: number
  type: string
  category: string
  uploadedAt: string
}

export function migrateFromJSON(): {
  success: boolean
  message: string
  migratedCount?: number
} {
  try {
    const jsonPath = path.join(process.cwd(), 'uploads-metadata.json')
    
    // 检查JSON文件是否存在
    if (!existsSync(jsonPath)) {
      return {
        success: true,
        message: 'No JSON file found to migrate'
      }
    }

    // 读取JSON数据
    const jsonContent = readFileSync(jsonPath, 'utf-8')
    const oldFiles: OldFileRecord[] = JSON.parse(jsonContent)

    if (!Array.isArray(oldFiles) || oldFiles.length === 0) {
      return {
        success: true,
        message: 'No files found in JSON to migrate'
      }
    }

    // 检查数据库是否已有数据
    const stats = getFileStats()
    if (stats.totalFiles > 0) {
      return {
        success: false,
        message: 'Database already contains files. Migration aborted to prevent duplicates.'
      }
    }

    // 转换数据格式（基本上相同，但确保类型正确）
    const filesToInsert: FileRecord[] = oldFiles.map(file => ({
      id: file.id,
      name: file.name,
      url: file.url,
      size: file.size,
      type: file.type,
      category: file.category,
      uploadedAt: file.uploadedAt
    }))

    // 批量插入到数据库
    insertFiles(filesToInsert)

    return {
      success: true,
      message: `Successfully migrated ${filesToInsert.length} files from JSON to database`,
      migratedCount: filesToInsert.length
    }

  } catch (error) {
    console.error('Migration error:', error)
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// 在模块加载时自动执行迁移（仅在服务器端）
if (typeof window === 'undefined') {
  // 延迟执行，避免在模块导入时立即执行
  process.nextTick(() => {
    const result = migrateFromJSON()
    if (result.success && result.migratedCount) {
      console.log('🔄 Migration completed:', result.message)
    }
  })
}