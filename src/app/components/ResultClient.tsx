'use client';

import { useEffect, useState } from 'react';
import { Card, Typography, Divider, Button, Result, Spin } from 'antd';
import { HomeOutlined, HistoryOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PredictionResult } from '../api/mahjong-prediction/route';

const { Title, Text } = Typography;

export default function ResultClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const predictionId = searchParams.get('id');
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        
        // 如果有 ID 参数，从 API 获取预测结果
        if (predictionId) {
          const response = await fetch(`/api/prediction/${predictionId}`);
          
          if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result.success && result.data) {
            setPrediction(result.data);
          } else {
            throw new Error(result.message || '获取预测结果失败');
          }
        } else {
          // 否则从 localStorage 获取预测结果
          const storedResult = localStorage.getItem('predictionResult');
          
          if (storedResult) {
            try {
              const parsedResult = JSON.parse(storedResult);
              setPrediction(parsedResult);
            } catch (err) {
              console.error('解析预测结果失败:', err);
              throw new Error('解析预测结果失败');
            }
          } else {
            throw new Error('未找到预测结果');
          }
        }
      } catch (err) {
        console.error('获取预测结果失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrediction();
  }, [predictionId]);
  
  // 如果没有预测结果，显示错误信息并提供返回首页的链接
  if (!loading && !prediction) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-amber-100">
        <Result
          status="warning"
          title="未找到预测结果"
          subTitle="请先完成测算表单"
          extra={
            <Button type="primary" size="large" onClick={() => router.push('/')}>
              返回首页
            </Button>
          }
        />
      </main>
    );
  }
  
  // 加载中
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-amber-100">
        <Spin size="large" tip="加载中..." />
      </main>
    );
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="w-full max-w-2xl">
        <Card 
          className="mb-6 shadow-lg"
          bordered={false}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
        >
          <div className="text-center mb-6">
            <Title level={2}>麻将方位预测结果</Title>
            <Text type="secondary">
              {prediction?.date ? new Date(prediction.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </Text>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-5xl text-white font-bold">{prediction?.direction}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex justify-between">
              <Text strong>今日方位：</Text>
              <Text>{prediction?.direction}</Text>
            </div>
            <div className="flex justify-between">
              <Text strong>幸运数字：</Text>
              <Text>{prediction?.luckyNumber}</Text>
            </div>
            <div className="flex justify-between">
              <Text strong>幸运颜色：</Text>
              <Text>{prediction?.luckyColor}</Text>
            </div>
            <div className="flex justify-between">
              <Text strong>幸运物品：</Text>
              <Text>{prediction?.luckyItem}</Text>
            </div>
          </div>
          
          <Divider />
          
          <div className="mb-6">
            <Text strong className="block mb-2">今日建议：</Text>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Text>{prediction?.advice}</Text>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="block">
              <Button 
                icon={<HomeOutlined />} 
                size="large"
                className="w-full"
              >
                返回首页
              </Button>
            </Link>
            <Link href="/history" className="block">
              <Button 
                icon={<HistoryOutlined />} 
                size="large"
                className="w-full"
              >
                查看历史记录
              </Button>
            </Link>
          </div>
        </Card>
        
        <div className="text-center text-gray-500 text-xs sm:text-sm">
          <p>本预测结果仅供娱乐，请理性看待</p>
        </div>
      </div>
    </main>
  );
}