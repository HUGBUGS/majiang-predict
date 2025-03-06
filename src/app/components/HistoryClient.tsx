'use client';

import { useEffect, useState } from 'react';
import { Table, Card, Button, Typography, Empty, Spin } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { HistoryRecord } from '../api/history/route';

const { Title } = Typography;

export default function HistoryClient() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // 从 API 获取历史记录
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/history');
        
        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setHistory(result.data);
        } else {
          throw new Error(result.message || '获取历史记录失败');
        }
      } catch (err) {
        console.error('获取历史记录失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);
  
  // 表格列定义
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '方位',
      dataIndex: 'direction',
      key: 'direction',
    },
    {
      title: '幸运数字',
      dataIndex: 'luckyNumber',
      key: 'luckyNumber',
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: HistoryRecord) => (
        <Link href={`/result?id=${record.id}`}>
          <Button type="link" size="small">查看详情</Button>
        </Link>
      ),
    },
  ];
  
  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="w-full max-w-4xl">
        <Card 
          className="mb-6 shadow-lg"
          bordered={false}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
        >
          <div className="flex justify-between items-center mb-6">
            <Title level={2} className="m-0">历史记录</Title>
            <Link href="/">
              <Button icon={<HomeOutlined />}>返回首页</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" tip="加载中..." />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              {error}
            </div>
          ) : history.length === 0 ? (
            <Empty description="暂无历史记录" />
          ) : (
            <Table 
              dataSource={history} 
              columns={columns} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
        
        <div className="text-center text-gray-500 text-xs sm:text-sm">
          <p>本预测结果仅供娱乐，请理性看待</p>
        </div>
      </div>
    </main>
  );
} 