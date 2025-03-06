import { NextRequest, NextResponse } from 'next/server';
import { getPrediction } from '../../../lib/db';

// 处理 GET 请求
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: '无效的 ID' },
        { status: 400 }
      );
    }
    
    // 从数据库获取预测结果
    const prediction = await getPrediction(id);
    
    if (!prediction) {
      return NextResponse.json(
        { success: false, message: '未找到预测结果' },
        { status: 404 }
      );
    }
    
    // 返回 JSON 响应
    return NextResponse.json({ 
      success: true, 
      data: prediction 
    });
  } catch (error) {
    console.error('获取预测结果失败:', error);
    return NextResponse.json(
      { success: false, message: '获取预测结果失败' },
      { status: 500 }
    );
  }
} 