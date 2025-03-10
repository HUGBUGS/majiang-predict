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
  // 获取当前日期，使用中国时区 (UTC+8)
  const today = new Date();
  // 调整为中国时区
  const chinaDate = new Date(today.getTime() + 8 * 60 * 60 * 1000);
  const formattedDate = chinaDate.toISOString().split('T')[0];
  
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
    WHERE DATE(date) = ? 
    LIMIT 1
  `;
  
  const results = await query(sql, [formattedDate]);
  
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
      // 调整为中国时区
      const chinaDate = new Date(fortune.date.getTime() + 8 * 60 * 60 * 1000);
      fortune.date = chinaDate.toISOString().split('T')[0];
    }
    
    return fortune;
  }
  
  return null;
}

// 保存每日运势数据
export async function saveDailyFortune(fortune: {
  date: string;
  lunarDate: string;
  chineseZodiac: string;
  starSign: string;
  luckyDirection: string;
  luckyNumber: number;
  goodFor: string[];
  badFor: string[];
}) {
  const sql = `
    INSERT INTO daily_fortunes (
      date, 
      lunar_date, 
      chinese_zodiac, 
      star_sign, 
      lucky_direction, 
      lucky_number, 
      good_for, 
      bad_for
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    fortune.date,
    fortune.lunarDate,
    fortune.chineseZodiac,
    fortune.starSign,
    fortune.luckyDirection,
    fortune.luckyNumber,
    JSON.stringify(fortune.goodFor),
    JSON.stringify(fortune.badFor)
  ];
  
  try {
    const result = await query(sql, values) as any;
    return result.insertId;
  } catch (error) {
    console.error('保存运势数据失败:', error);
    return null;
  }
}

// 获取或创建用户（基于设备指纹）
export async function getOrCreateUser(deviceFingerprint: string) {
  // 首先查询是否存在该设备指纹的用户
  const checkSql = `
    SELECT 
      id,
      device_fingerprint AS deviceFingerprint,
      created_at AS createdAt,
      last_login_at AS lastLoginAt
    FROM users 
    WHERE device_fingerprint = ?
  `;
  
  const users = await query(checkSql, [deviceFingerprint]);
  
  // 如果用户存在，更新最后登录时间并返回用户信息
  if (Array.isArray(users) && users.length > 0) {
    const user = users[0] as Record<string, any>;
    
    // 更新最后登录时间
    const updateSql = `
      UPDATE users 
      SET last_login_at = NOW() 
      WHERE id = ?
    `;
    
    await query(updateSql, [user.id]);
    
    return user;
  }
  
  // 如果用户不存在，创建新用户
  const insertSql = `
    INSERT INTO users (
      device_fingerprint,
      created_at,
      last_login_at
    ) VALUES (?, NOW(), NOW())
  `;
  
  const result = await query(insertSql, [deviceFingerprint]) as Record<string, any>;
  
  // 返回新创建的用户信息
  return {
    id: result.insertId,
    deviceFingerprint,
    createdAt: new Date(),
    lastLoginAt: new Date()
  };
}

// 检查用户今日测算次数
export async function checkUserPredictionCount(userId: number): Promise<number> {
  // 获取当前日期，使用中国时区 (UTC+8)
  const today = new Date();
  const chinaDate = new Date(today.getTime() + 8 * 60 * 60 * 1000);
  const formattedDate = chinaDate.toISOString().split('T')[0];
  
  const sql = `
    SELECT COUNT(*) AS count
    FROM predictions
    WHERE user_id = ? AND DATE(created_at) = ?
  `;
  
  const results = await query(sql, [userId, formattedDate]);
  
  if (Array.isArray(results) && results.length > 0) {
    const result = results[0] as Record<string, any>;
    return result.count || 0;
  }
  
  return 0;
}

// 保存预测结果并返回 ID（修改版，包含用户ID）
export async function savePrediction(params: {
  userId: number;
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
      user_id,
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
      prediction_date,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  
  const values = [
    params.userId,
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
  
  const result = await query(sql, values) as Record<string, any>;
  
  // 保存到历史记录
  if (result.insertId) {
    await saveHistory(params.userId, params.name, result.insertId, params.date);
    return result.insertId;
  }
  
  return null;
}

// 保存历史记录（修改版，包含用户ID）
export async function saveHistory(userId: number, userName: string, predictionId: number, predictionDate: string) {
  const sql = `
    INSERT INTO history (
      user_id,
      user_name, 
      prediction_id, 
      prediction_date,
      created_at
    ) VALUES (?, ?, ?, ?, NOW())
  `;
  
  await query(sql, [userId, userName, predictionId, predictionDate]);
}

// 获取用户的历史记录
export async function getUserHistory(userId: number, limit = 10) {
  const sql = `
    SELECT 
      h.id,
      h.user_name AS name,
      p.direction,
      p.lucky_number AS luckyNumber,
      p.lucky_color AS luckyColor,
      p.lucky_item AS luckyItem,
      p.advice,
      p.prediction_date AS date,
      h.created_at AS createdAt
    FROM history h
    JOIN predictions p ON h.prediction_id = p.id
    WHERE h.user_id = ?
    ORDER BY h.created_at DESC
    LIMIT ${limit}
  `;
  
  const results = await query(sql, [userId]);
  
  if (Array.isArray(results)) {
    return results.map((record: Record<string, any>) => {
      // 格式化日期
      if (record.date instanceof Date) {
        // 调整为中国时区
        const chinaDate = new Date(record.date.getTime() + 8 * 60 * 60 * 1000);
        record.date = chinaDate.toISOString().split('T')[0];
      }
      if (record.createdAt instanceof Date) {
        // 调整为中国时区
        const chinaCreatedAt = new Date(record.createdAt.getTime() + 8 * 60 * 60 * 1000);
        record.createdAt = chinaCreatedAt.toISOString();
      }
      
      return record;
    });
  }
  
  return [];
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
      // 调整为中国时区
      const chinaDate = new Date(prediction.date.getTime() + 8 * 60 * 60 * 1000);
      prediction.date = chinaDate.toISOString().split('T')[0];
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
    LIMIT ${limit}
  `;
  
  const results = await query(sql, []);
  
  if (Array.isArray(results)) {
    return results.map((record: any) => {
      // 格式化日期
      if (record.date instanceof Date) {
        // 调整为中国时区
        const chinaDate = new Date(record.date.getTime() + 8 * 60 * 60 * 1000);
        record.date = chinaDate.toISOString().split('T')[0];
      }
      
      return record;
    });
  }
  
  return [];
}

/**
 * 根据用户姓名、出生日期、出生地点和当前日期查询已存在的预测结果
 * @param name 用户姓名
 * @param birthdate 出生日期
 * @param province 省份
 * @param city 城市
 * @param district 区县
 * @returns 预测结果，如果不存在则返回null
 */
export async function getExistingPrediction(
  name: string,
  birthdate: string,
  province: string,
  city: string,
  district: string
) {
  // 获取当前日期，使用中国时区 (UTC+8)
  const today = new Date();
  const chinaDate = new Date(today.getTime() + 8 * 60 * 60 * 1000);
  const formattedDate = chinaDate.toISOString().split('T')[0];
  
  const sql = `
    SELECT 
      id,
      direction,
      lucky_number AS luckyNumber,
      lucky_color AS luckyColor,
      lucky_item AS luckyItem,
      advice,
      prediction_date AS date
    FROM predictions
    WHERE 
      user_name = ? AND
      birthdate = ? AND
      province = ? AND
      city = ? AND
      district = ? AND
      DATE(prediction_date) = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  const results = await query(sql, [
    name,
    birthdate,
    province,
    city,
    district,
    formattedDate
  ]);
  
  if (Array.isArray(results) && results.length > 0) {
    const prediction = results[0] as any;
    
    // 格式化日期
    if (prediction.date instanceof Date) {
      // 调整为中国时区
      const chinaDate = new Date(prediction.date.getTime() + 8 * 60 * 60 * 1000);
      prediction.date = chinaDate.toISOString().split('T')[0];
    }
    
    return prediction;
  }
  
  return null;
}