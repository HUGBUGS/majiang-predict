import { NextRequest, NextResponse } from 'next/server';
import { getUserHistory, getOrCreateUser } from '../../lib/db';

// 定义历史记录接口
export interface HistoryRecord {
  id: number;
  name: string;
  direction: string;
  luckyNumber: number;
  date: string;
}

// 处理 GET 请求
export async function GET(request: NextRequest) {
  try {
    // 从查询参数中获取设备指纹
    const url = new URL(request.url);
    const deviceFingerprint = url.searchParams.get('deviceFingerprint');
    
    // 验证必要参数
    if (!deviceFingerprint) {
      return NextResponse.json(
        { success: false, message: '缺少设备指纹参数' },
        { status: 400 }
      );
    }
    
    // 获取用户信息
    const user = await getOrCreateUser(deviceFingerprint);
    
    // 获取用户的历史记录
    const history = await getUserHistory(user.id, 20); // 获取最近 20 条记录
    
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