const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

function cleanupOrphanedFiles() {
  try {
    // 连接数据库
    const dbPath = path.join(process.cwd(), 'data', 'tubed.db');
    const db = new Database(dbPath);
    
    console.log('🔍 开始检查孤立的文件记录...');
    
    // 获取所有文件记录
    const files = db.prepare('SELECT * FROM files').all();
    console.log(`📊 数据库中共有 ${files.length} 个文件记录`);
    
    let orphanedCount = 0;
    const orphanedFiles = [];
    
    // 检查每个文件是否存在
    for (const file of files) {
      const filePath = path.join(process.cwd(), 'public', file.url);
      if (!fs.existsSync(filePath)) {
        console.log(`❌ 文件不存在: ${file.url} (ID: ${file.id})`);
        orphanedFiles.push(file);
        orphanedCount++;
      }
    }
    
    console.log(`\n📋 发现 ${orphanedCount} 个孤立的文件记录`);
    
    if (orphanedCount > 0) {
      console.log('\n🗑️ 正在清理孤立的记录...');
      
      const deleteStmt = db.prepare('DELETE FROM files WHERE id = ?');
      const transaction = db.transaction((files) => {
        for (const file of files) {
          deleteStmt.run(file.id);
          console.log(`✅ 已删除记录: ${file.name} (${file.url})`);
        }
      });
      
      transaction(orphanedFiles);
      console.log(`\n🎉 清理完成! 删除了 ${orphanedCount} 个孤立的文件记录`);
    } else {
      console.log('\n✨ 没有发现孤立的文件记录，数据库状态良好！');
    }
    
    // 显示清理后的统计
    const remainingFiles = db.prepare('SELECT COUNT(*) as count FROM files').get();
    console.log(`📊 清理后数据库中还有 ${remainingFiles.count} 个文件记录`);
    
    db.close();
    
  } catch (error) {
    console.error('❌ 清理过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  cleanupOrphanedFiles();
}

module.exports = { cleanupOrphanedFiles };