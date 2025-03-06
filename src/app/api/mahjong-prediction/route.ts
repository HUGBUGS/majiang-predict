import { NextRequest, NextResponse } from 'next/server';
import { savePrediction } from '../../lib/db';

// 定义预测结果接口
export interface PredictionResult {
  id?: number; // 预测结果 ID
  direction: string; // 方位：东、南、西、北
  luckyNumber: number; // 幸运数字
  luckyColor: string; // 幸运颜色
  luckyItem: string; // 幸运物品
  advice: string; // 建议
  date: string; // 预测日期，格式为 YYYY-MM-DD
}

// 定义请求参数接口
export interface PredictionParams {
  name: string; // 姓名
  birthdate: string; // 出生日期，格式为 YYYY-MM-DD
  province: string; // 省份代码
  city: string; // 城市代码
  district: string; // 区县代码
}

// 生成预测结果
function generatePrediction(params: PredictionParams): PredictionResult {
  // 在实际应用中，这里可能会基于用户输入的信息进行复杂计算
  // 这里我们使用简单的随机算法
  
  const directions = ['东', '南', '西', '北'];
  const colors = ['红色', '黄色', '蓝色', '绿色', '紫色', '白色', '黑色'];
  const items = ['硬币', '红绳', '玉佩', '手链', '小挂件', '纸条', '茶叶'];
  const advices = [
    '今日宜打麻将，财运亨通',
    '今日适合短局，不宜久坐',
    '今日宜与好友同乐，忌独自出门',
    '今日宜主动出击，不宜被动防守',
    '今日宜稳健打法，不宜冒险',
    '今日宜早起打牌，下午运势转弱',
    '今日宜晚间打牌，上午运势不佳'
  ];
  
  // 使用姓名和生日生成伪随机数
  const nameSum = params.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const birthDate = new Date(params.birthdate);
  const birthSum = birthDate.getFullYear() + birthDate.getMonth() + birthDate.getDate();
  const today = new Date();
  const todaySum = today.getFullYear() + today.getMonth() + today.getDate();
  
  // 生成随机索引
  const seed = (nameSum + birthSum + todaySum) % 100;
  const directionIndex = seed % directions.length;
  const colorIndex = (seed * 7) % colors.length;
  const itemIndex = (seed * 13) % items.length;
  const adviceIndex = (seed * 19) % advices.length;
  const luckyNumber = (seed % 9) + 1; // 1-9 之间的数字
  
  // 格式化当前日期为 YYYY-MM-DD
  const formattedDate = today.toISOString().split('T')[0];
  
  return {
    direction: directions[directionIndex],
    luckyNumber,
    luckyColor: colors[colorIndex],
    luckyItem: items[itemIndex],
    advice: advices[adviceIndex],
    date: formattedDate
  };
}

// 处理 POST 请求
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const params: PredictionParams = await request.json();
    
    // 验证必要参数
    if (!params.name || !params.birthdate || !params.province || !params.city || !params.district) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 生成预测结果
    const prediction = generatePrediction(params);
    
    // 保存到数据库
    const predictionId = await savePrediction({
      ...prediction,
      name: params.name,
      birthdate: params.birthdate,
      province: params.province,
      city: params.city,
      district: params.district
    });
    
    // 如果保存成功，添加 ID 到结果中
    if (predictionId) {
      prediction.id = predictionId;
    }
    
    // 返回 JSON 响应
    return NextResponse.json({ 
      success: true, 
      data: prediction 
    });
  } catch (error) {
    console.error('生成预测结果失败:', error);
    return NextResponse.json(
      { success: false, message: '生成预测结果失败' },
      { status: 500 }
    );
  }
}