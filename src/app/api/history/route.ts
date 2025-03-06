import { NextResponse } from 'next/server';
import { getHistory } from '../../lib/db';

// 定义历史记录接口
export interface HistoryRecord {
  id: number;
  name: string;
  direction: string;
  luckyNumber: number;
  date: string;
}

// 处理 GET 请求
export async function GET() {
  try {
    // 从数据库获取历史记录
    const history = await getHistory(20); // 获取最近 20 条记录
    
    // 返回 JSON 响应
    return NextResponse.json({ 
      success: true, 
      data: history 
    });
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json(
      { success: false, message: '获取历史记录失败' },
      { status: 500 }
    );
  }
} 