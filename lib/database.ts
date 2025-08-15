import Database from 'better-sqlite3'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

export interface FileRecord {
  id: string
  name: string
  url: string
  size: number
  type: string
  category: string
  uploadedAt: string
}

export interface FileStats {
  totalFiles: number
  totalSize: number
  categories: Record<string, number>
}

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (db) {
    return db
  }

  // 确保数据库目录存在
  const dbDir = path.join(process.cwd(), 'data')
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  const dbPath = path.join(dbDir, 'tubed.db')
  
  // 创建数据库连接
  db = new Database(dbPath)
  
  // 优化数据库设置
  db.pragma('journal_mode = WAL')  // 写前日志，提高并发性能
  db.pragma('synchronous = NORMAL')  // 平衡安全性和性能
  db.pragma('cache_size = 1000')  // 设置缓存大小
  db.pragma('temp_store = memory')  // 临时表存储在内存中
  
  // 初始化数据库表
  initializeDatabase(db)
  
  return db
}

function initializeDatabase(database: Database.Database) {
  // 创建 files 表
  const createFilesTable = `
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      size INTEGER NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      uploadedAt TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
  
  // 创建索引以提高查询性能
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_files_category ON files(category)',
    'CREATE INDEX IF NOT EXISTS idx_files_uploadedAt ON files(uploadedAt)',
    'CREATE INDEX IF NOT EXISTS idx_files_type ON files(type)',
    'CREATE INDEX IF NOT EXISTS idx_files_size ON files(size)',
    'CREATE INDEX IF NOT EXISTS idx_files_createdAt ON files(createdAt)'
  ]
  
  // 执行数据库初始化
  try {
    database.exec(createFilesTable)
    createIndexes.forEach(indexSql => database.exec(indexSql))
    
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// 插入文件记录
export function insertFile(file: FileRecord): FileRecord {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO files (id, name, url, size, type, category, uploadedAt)
    VALUES (@id, @name, @url, @size, @type, @category, @uploadedAt)
  `)
  
  try {
    stmt.run(file)
    return file
  } catch (error) {
    console.error('Failed to insert file:', error)
    throw new Error('Failed to save file metadata')
  }
}

// 批量插入文件记录（用于迁移）
export function insertFiles(files: FileRecord[]): void {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO files (id, name, url, size, type, category, uploadedAt)
    VALUES (@id, @name, @url, @size, @type, @category, @uploadedAt)
  `)
  
  const transaction = db.transaction((files: FileRecord[]) => {
    for (const file of files) {
      stmt.run(file)
    }
  })
  
  try {
    transaction(files)
  } catch (error) {
    console.error('Failed to insert files:', error)
    throw new Error('Failed to save files metadata')
  }
}

// 获取文件列表
export function getFiles(options: {
  limit?: number
  offset?: number
  category?: string
  sortBy?: 'uploadedAt' | 'name' | 'size'
  sortOrder?: 'ASC' | 'DESC'
} = {}): FileRecord[] {
  const db = getDatabase()
  const {
    limit = 50,
    offset = 0,
    category,
    sortBy = 'uploadedAt',
    sortOrder = 'DESC'
  } = options
  
  let query = 'SELECT * FROM files'
  const params: Record<string, string | number> = {}
  
  // 添加分类筛选
  if (category) {
    query += ' WHERE category = @category'
    params.category = category
  }
  
  // 添加排序
  query += ` ORDER BY ${sortBy} ${sortOrder}`
  
  // 添加分页
  query += ' LIMIT @limit OFFSET @offset'
  params.limit = limit
  params.offset = offset
  
  try {
    const stmt = db.prepare(query)
    return stmt.all(params) as FileRecord[]
  } catch (error) {
    console.error('Failed to get files:', error)
    return []
  }
}

// 根据ID获取文件
export function getFileById(id: string): FileRecord | null {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM files WHERE id = ?')
  
  try {
    return (stmt.get(id) as FileRecord) || null
  } catch (error) {
    console.error('Failed to get file by id:', error)
    return null
  }
}

// 根据URL获取文件
export function getFileByUrl(url: string): FileRecord | null {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM files WHERE url = ?')
  
  try {
    return (stmt.get(url) as FileRecord) || null
  } catch (error) {
    console.error('Failed to get file by url:', error)
    return null
  }
}

// 删除文件记录
export function deleteFile(id: string): boolean {
  const db = getDatabase()
  const stmt = db.prepare('DELETE FROM files WHERE id = ?')
  
  try {
    const result = stmt.run(id)
    return result.changes > 0
  } catch (error) {
    console.error('Failed to delete file:', error)
    return false
  }
}

// 获取文件统计信息
export function getFileStats(): FileStats {
  const db = getDatabase()
  
  try {
    // 总文件数和总大小
    const totalStmt = db.prepare('SELECT COUNT(*) as count, SUM(size) as totalSize FROM files')
    const totalResult = totalStmt.get() as { count: number; totalSize: number | null }
    
    // 按分类统计
    const categoryStmt = db.prepare('SELECT category, COUNT(*) as count FROM files GROUP BY category')
    const categoryResults = categoryStmt.all() as { category: string; count: number }[]
    
    const categories: Record<string, number> = {}
    categoryResults.forEach(result => {
      categories[result.category] = result.count
    })
    
    return {
      totalFiles: totalResult.count,
      totalSize: totalResult.totalSize || 0,
      categories
    }
  } catch (error) {
    console.error('Failed to get file stats:', error)
    return {
      totalFiles: 0,
      totalSize: 0,
      categories: {}
    }
  }
}

// 搜索文件
export function searchFiles(query: string, options: {
  limit?: number
  offset?: number
  category?: string
} = {}): FileRecord[] {
  const db = getDatabase()
  const {
    limit = 50,
    offset = 0,
    category
  } = options
  
  let sql = 'SELECT * FROM files WHERE name LIKE @query'
  const params: Record<string, string | number> = { query: `%${query}%` }
  
  if (category) {
    sql += ' AND category = @category'
    params.category = category
  }
  
  sql += ' ORDER BY uploadedAt DESC LIMIT @limit OFFSET @offset'
  params.limit = limit
  params.offset = offset
  
  try {
    const stmt = db.prepare(sql)
    return stmt.all(params) as FileRecord[]
  } catch (error) {
    console.error('Failed to search files:', error)
    return []
  }
}

// 关闭数据库连接（用于优雅关闭）
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}

// 在进程退出时自动关闭数据库
process.on('exit', closeDatabase)
process.on('SIGINT', closeDatabase)
process.on('SIGTERM', closeDatabase)