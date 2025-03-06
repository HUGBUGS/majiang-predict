'use client';

import { Card, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { FortuneData } from '../api/daily-fortune/route';

const { Text } = Typography;

export default function DailyFortune() {
  const [fortune, setFortune] = useState<FortuneData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // 从 API 获取今日运势数据
    const fetchFortuneData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/daily-fortune');
        
        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setFortune(result.data);
        } else {
          throw new Error(result.message || '获取运势数据失败');
        }
      } catch (err) {
        console.error('获取运势数据失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFortuneData();
  }, []);
  
  // 显示加载状态
  if (loading) {
    return (
      <Card 
        title="今日运势"
        className="w-full max-w-4xl mb-6"
        bordered={false}
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
        loading={true}
      />
    );
  }
  
  // 显示错误信息
  if (error || !fortune) {
    return (
      <Card 
        title="今日运势"
        className="w-full max-w-4xl mb-6"
        bordered={false}
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
      >
        <div className="text-center text-red-500">
          {error || '无法加载运势数据'}
        </div>
      </Card>
    );
  }
  
  return (
    <Card 
      title={
        <div className="flex justify-between items-center">
          <span>今日运势</span>
          <span className="text-sm font-normal text-gray-500">
            {new Date(fortune.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      }
      className="w-full max-w-4xl mb-6"
      bordered={false}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between mb-2">
            <Text strong>农历日期：</Text>
            <Text>{fortune.lunarDate}</Text>
          </div>
          <div className="flex justify-between mb-2">
            <Text strong>今日星宿：</Text>
            <Text>{fortune.starSign}</Text>
          </div>
          <div className="flex justify-between mb-2">
            <Text strong>生肖喜神：</Text>
            <Text>{fortune.chineseZodiac}</Text>
          </div>
          <div className="flex justify-between mb-2">
            <Text strong>吉利方位：</Text>
            <Text>{fortune.luckyDirection}</Text>
          </div>
          <div className="flex justify-between mb-2">
            <Text strong>幸运数字：</Text>
            <Text>{fortune.luckyNumber}</Text>
          </div>
        </div>
        
        <div>
          <div className="mb-3">
            <Text strong className="block mb-2">今日宜：</Text>
            <div>
              {fortune.goodFor.map((item, index) => (
                <Tag key={index} color="success" className="mb-1 mr-1">{item}</Tag>
              ))}
            </div>
          </div>
          
          <div>
            <Text strong className="block mb-2">今日忌：</Text>
            <div>
              {fortune.badFor.map((item, index) => (
                <Tag key={index} color="error" className="mb-1 mr-1">{item}</Tag>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 