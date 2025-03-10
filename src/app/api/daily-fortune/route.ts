import { NextResponse } from 'next/server';
import { getDailyFortune, saveDailyFortune } from '../../lib/db';
import { getFortuneFromOpenAI } from '../../lib/openai';

// 定义运势数据接口
export interface FortuneData {
  lunarDate: string;
  chineseZodiac: string;
  goodFor: string[];
  badFor: string[];
  starSign: string;
  luckyDirection: string;
  luckyNumber: number;
  luckyColor: string; // 幸运颜色
  luckyItem: string; // 幸运物品
  advice?: string; // 建议文本
  date: string; // 当前日期，格式为 YYYY-MM-DD
}

// 处理 GET 请求
export async function GET() {
  try {
    // 1. 先从数据库获取今日运势数据
    let fortuneData = await getDailyFortune();
    
    // 2. 如果数据库中没有数据，则调用 AI 服务生成
    if (!fortuneData) {
      console.log('数据库中没有今日运势数据，调用 AI 服务生成...');
      
      try {
        // 调用 AI 服务生成运势数据
        fortuneData = await getFortuneFromOpenAI();
        
        // 将生成的数据保存到数据库
        if (fortuneData) {
          console.log('保存 AI 生成的运势数据到数据库...');
          await saveDailyFortune(fortuneData);
        }
      } catch (apiError) {
        console.error('调用 AI 服务生成运势数据失败:', apiError);
        // 如果 AI 服务调用失败，返回错误信息
        return NextResponse.json(
          { success: false, message: '无法获取运势数据，请稍后再试' },
          { status: 503 }
        );
      }
    }
    
    // 3. 如果数据库和 AI 服务都没有提供数据，返回错误
    if (!fortuneData) {
      return NextResponse.json(
        { success: false, message: '无法获取运势数据，请稍后再试' },
        { status: 404 }
      );
    }
    
    // 返回 JSON 响应
    return NextResponse.json({ 
      success: true, 
      data: fortuneData 
    });
  } catch (error) {
    console.error('获取运势数据失败:', error);
    return NextResponse.json(
      { success: false, message: '获取运势数据失败' },
      { status: 500 }
    );
  }
} 