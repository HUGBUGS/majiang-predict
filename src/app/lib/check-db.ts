import { query } from './db';

async function checkDatabaseStructure() {
  try {
    console.log('检查数据库表结构...');
    
    // 检查 predictions 表结构
    const tableInfo = await query(`DESCRIBE predictions`);
    console.log('predictions 表结构:', tableInfo);
    
    // 检查是否有数据
    const data = await query(`SELECT * FROM predictions LIMIT 1`);
    console.log('predictions 表数据示例:', data);
    
    console.log('数据库检查完成');
  } catch (error) {
    console.error('数据库检查失败:', error);
  }
}

// 执行检查
checkDatabaseStructure(); 