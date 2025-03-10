import { NextRequest, NextResponse } from 'next/server';
import { savePrediction, getOrCreateUser, checkUserPredictionCount, getExistingPrediction } from '../../lib/db';
import { getPersonalizedFortune } from '../../lib/openai';

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
  birthdate: string; // 出生日期，格式为 YYYY-MM-DD HH:mm:ss
  province: string; // 省份代码
  city: string; // 城市代码
  district: string; // 区县代码
  deviceFingerprint: string; // 设备指纹
}

// 每日最大测算次数
const MAX_PREDICTIONS_PER_DAY = 3;

// 生成预测结果
async function generatePrediction(params: PredictionParams): Promise<PredictionResult> {
  // 获取当前日期，使用中国时区 (UTC+8)
  const today = new Date();
  // 调整为中国时区
  const chinaDate = new Date(today.getTime() + 8 * 60 * 60 * 1000);
  const formattedDate = chinaDate.toISOString().split('T')[0];
  
  try {
    // 调用 AI 生成个性化预测结果
    const fortuneData = await getPersonalizedFortune(params);
    
    // 确保 advice 不为 undefined
    const advice = fortuneData.advice || `${params.name}今日宜坐${fortuneData.luckyDirection}方，带上${fortuneData.luckyNumber}元${fortuneData.luckyItem}作为幸运物。${fortuneData.goodFor.join('，')}。避免${fortuneData.badFor.join('，')}。`;
    
    // 直接使用 AI 生成的个性化预测结果
    return {
      direction: fortuneData.luckyDirection,
      luckyNumber: fortuneData.luckyNumber,
      luckyColor: fortuneData.luckyColor,
      luckyItem: fortuneData.luckyItem,
      advice,
      date: formattedDate
    };
  } catch (error) {
    console.error('生成预测结果失败:', error);
    throw new Error('生成预测结果失败');
  }
}

// 处理 POST 请求
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const params: PredictionParams = await request.json();
    
    // 验证必要参数
    if (!params.name || !params.birthdate || !params.province || !params.city || !params.district || !params.deviceFingerprint) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 获取或创建用户
    const user = await getOrCreateUser(params.deviceFingerprint);
    
    // 检查用户今日测算次数
    const predictionCount = await checkUserPredictionCount(user.id);
    
    // 如果超过每日最大测算次数，返回错误
    if (predictionCount >= MAX_PREDICTIONS_PER_DAY) {
      return NextResponse.json(
        { success: false, message: `您今日已达到最大测算次数（${MAX_PREDICTIONS_PER_DAY}次），请明天再来` },
        { status: 429 }
      );
    }
    
    // 检查是否已存在相同条件的预测结果
    const existingPrediction = await getExistingPrediction(
      params.name,
      params.birthdate,
      params.province,
      params.city,
      params.district
    );
    
    let prediction;
    let predictionId;
    
    if (existingPrediction) {
      // 如果存在相同条件的预测结果，直接使用
      console.log('找到已存在的预测结果，直接返回');
      prediction = existingPrediction;
      predictionId = existingPrediction.id;
    } else {
      // 否则生成新的预测结果
      console.log('生成新的预测结果');
      prediction = await generatePrediction(params);
      
      // 保存到数据库
      predictionId = await savePrediction({
        userId: user.id,
        name: params.name,
        birthdate: params.birthdate,
        province: params.province,
        city: params.city,
        district: params.district,
        direction: prediction.direction,
        luckyNumber: prediction.luckyNumber,
        luckyColor: prediction.luckyColor,
        luckyItem: prediction.luckyItem,
        advice: prediction.advice,
        date: prediction.date
      });
    }
    
    // 如果保存成功，添加 ID 到结果中
    if (predictionId && !prediction.id) {
      prediction.id = predictionId;
    }
    
    // 返回 JSON 响应
    return NextResponse.json({ 
      success: true, 
      data: prediction,
      remainingCount: MAX_PREDICTIONS_PER_DAY - (predictionCount + (existingPrediction ? 0 : 1))
    });
  } catch (error) {
    console.error('生成预测结果失败:', error);
    return NextResponse.json(
      { success: false, message: '生成预测结果失败' },
      { status: 500 }
    );
  }
}