'use client';

import { useEffect, useState } from 'react';
import { Button, List, DotLoading, Empty } from 'antd-mobile';
import { useRouter } from 'next/navigation';
import { getDeviceFingerprint } from '../utils/fingerprint';
import styles from './HistoryClient.module.css';

// 定义历史记录接口
interface HistoryItem {
  id: number;
  name: string;
  direction: string;
  date: string;
}

export default function HistoryClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        
        // 获取设备指纹
        const deviceFingerprint = getDeviceFingerprint();
        
        // 获取历史记录
        const response = await fetch(`/api/history?deviceFingerprint=${encodeURIComponent(deviceFingerprint)}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '获取历史记录失败');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || '获取历史记录失败');
        }

        setHistory(data.data || []);
      } catch (error) {
        console.error('获取历史记录失败:', error);
        setError(error instanceof Error ? error.message : '获取历史记录失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleBackHome = () => {
    router.push('/');
  };

  const handleViewResult = (id: number) => {
    router.push(`/result?id=${id}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <DotLoading color='primary' />
        <p>正在获取历史记录...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>出错了</h2>
        <p>{error}</p>
        <Button color='primary' onClick={handleBackHome}>返回首页</Button>
      </div>
    );
  }

  return (
    <div className={styles.historyContainer}>
      <div className={styles.historyCard}>
        <h2 className={styles.cardTitle}>预测历史记录</h2>
        
        {history.length === 0 ? (
          <Empty
            description="暂无历史记录"
            className={styles.emptyContainer}
          />
        ) : (
          <List className={styles.historyList}>
            {history.map((item) => (
              <List.Item
                key={item.id}
                onClick={() => handleViewResult(item.id)}
                arrow
                className={styles.historyItem}
              >
                <div className={styles.historyItemContent}>
                  <div className={styles.historyItemName}>{item.name}</div>
                  <div className={styles.historyItemInfo}>
                    <span className={styles.historyItemDirection}>方位: {item.direction}</span>
                    <span className={styles.historyItemDate}>{item.date}</span>
                  </div>
                </div>
              </List.Item>
            ))}
          </List>
        )}
        
        <Button 
          color='primary' 
          onClick={handleBackHome}
          className={styles.backButton}
        >
          返回首页
        </Button>
      </div>
    </div>
  );
} 