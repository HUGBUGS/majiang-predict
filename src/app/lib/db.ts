import mysql from 'mysql2/promise';

// 创建连接池
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'mahjong_app',
  password: process.env.MYSQL_PASSWORD || '您的密码',
  database: process.env.MYSQL_DATABASE || 'mahjong_prediction',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 执行查询的辅助函数
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

// 获取当天的运势数据
export async function getDailyFortune() {
  const sql = `
    SELECT 
      date, 
      lunar_date AS lunarDate, 
      chinese_zodiac AS chineseZodiac, 
      star_sign AS starSign, 
      lucky_direction AS luckyDirection, 
      lucky_number AS luckyNumber, 
      good_for AS goodFor, 
      bad_for AS badFor 
    FROM daily_fortunes 
    WHERE date = CURDATE() 
    LIMIT 1
  `;
  
  const results = await query(sql);
  
  if (Array.isArray(results) && results.length > 0) {
    const fortune = results[0] as any;
    
    // 解析 JSON 字符串
    if (typeof fortune.goodFor === 'string') {
      fortune.goodFor = JSON.parse(fortune.goodFor);
    }
    
    if (typeof fortune.badFor === 'string') {
      fortune.badFor = JSON.parse(fortune.badFor);
    }
    
    // 格式化日期
    if (fortune.date instanceof Date) {
      fortune.date = fortune.date.toISOString().split('T')[0];
    }
    
    return fortune;
  }
  
  return null;
}

// 保存预测结果并返回 ID
export async function savePrediction(params: {
  name: string;
  birthdate: string;
  province: string;
  city: string;
  district: string;
  direction: string;
  luckyNumber: number;
  luckyColor: string;
  luckyItem: string;
  advice: string;
  date: string;
}) {
  const sql = `
    INSERT INTO predictions (
      user_name, 
      birthdate, 
      province, 
      city, 
      district, 
      direction, 
      lucky_number, 
      lucky_color, 
      lucky_item, 
      advice, 
      prediction_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    params.name,
    params.birthdate,
    params.province,
    params.city,
    params.district,
    params.direction,
    params.luckyNumber,
    params.luckyColor,
    params.luckyItem,
    params.advice,
    params.date
  ];
  
  const result = await query(sql, values) as any;
  
  // 保存到历史记录
  if (result.insertId) {
    await saveHistory(params.name, result.insertId, params.date);
    return result.insertId;
  }
  
  return null;
}

// 保存历史记录
export async function saveHistory(userName: string, predictionId: number, predictionDate: string) {
  const sql = `
    INSERT INTO history (
      user_name, 
      prediction_id, 
      prediction_date
    ) VALUES (?, ?, ?)
  `;
  
  await query(sql, [userName, predictionId, predictionDate]);
}

// 获取预测结果
export async function getPrediction(id: number) {
  const sql = `
    SELECT 
      id,
      user_name AS name,
      direction,
      lucky_number AS luckyNumber,
      lucky_color AS luckyColor,
      lucky_item AS luckyItem,
      advice,
      prediction_date AS date
    FROM predictions 
    WHERE id = ?
  `;
  
  const results = await query(sql, [id]);
  
  if (Array.isArray(results) && results.length > 0) {
    const prediction = results[0] as any;
    
    // 格式化日期
    if (prediction.date instanceof Date) {
      prediction.date = prediction.date.toISOString().split('T')[0];
    }
    
    return prediction;
  }
  
  return null;
}

// 获取历史记录
export async function getHistory(limit = 10) {
  const sql = `
    SELECT 
      h.id,
      h.user_name AS name,
      p.direction,
      p.lucky_number AS luckyNumber,
      p.prediction_date AS date
    FROM history h
    JOIN predictions p ON h.prediction_id = p.id
    ORDER BY h.created_at DESC
    LIMIT ?
  `;
  
  const results = await query(sql, [limit]);
  
  if (Array.isArray(results)) {
    return results.map((record: any) => {
      // 格式化日期
      if (record.date instanceof Date) {
        record.date = record.date.toISOString().split('T')[0];
      }
      
      return record;
    });
  }
  
  return [];
}