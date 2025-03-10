import { query } from './db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('开始执行数据库迁移...');
    
    // 读取迁移脚本
    const migrationPath = path.join(process.cwd(), 'src', 'app', 'lib', 'db-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // 按语句分割
    const statements = migrationSQL
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // 逐条执行
    for (const statement of statements) {
      try {
        console.log(`执行: ${statement}`);
        await query(statement);
        console.log('执行成功');
      } catch (error) {
        console.error(`执行失败: ${statement}`, error);
        // 继续执行下一条语句
      }
    }
    
    console.log('数据库迁移完成');
  } catch (error) {
    console.error('数据库迁移失败:', error);
  }
}

// 执行迁移
runMigration(); 