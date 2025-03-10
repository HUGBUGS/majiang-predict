'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, DotLoading } from 'antd-mobile';
import styles from './result.module.css';

// 定义预测结果接口
interface PredictionResult {
  id: number;
  direction: string;
  luckyNumber: number;
  luckyColor: string;
  luckyItem: string;
  advice: string;
  date: string;
}

// 创建一个包装组件，用于处理 useSearchParams
function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const id = searchParams.get('id');
        if (!id) {
          setError('未找到预测ID，请返回首页重新预测');
          setLoading(false);
          return;
        }

        // 获取预测结果
        const response = await fetch(`/api/prediction/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '获取预测结果失败');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || '获取预测结果失败');
        }

        setResult(data.data);
      } catch (error) {
        console.error('获取预测结果失败:', error);
        setError(error instanceof Error ? error.message : '获取预测结果失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [searchParams]);

  const handleBackHome = () => {
    router.push('/');
  };

  const handleViewHistory = () => {
    router.push('/history');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <DotLoading color='primary' />
        <p>正在获取预测结果...</p>
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

  if (!result) {
    return (
      <div className={styles.errorContainer}>
        <h2>未找到预测结果</h2>
        <p>请返回首页重新预测</p>
        <Button color='primary' onClick={handleBackHome}>返回首页</Button>
      </div>
    );
  }

  return (
    <div className={styles.resultContainer}>
      <div className={styles.resultCard}>
        <h2 className={styles.cardTitle}>麻将方位预测结果</h2>
        
        <div className={styles.resultDate}>
          预测日期: {result.date}
        </div>
        
        <div className={styles.resultItem}>
          <div className={styles.itemLabel}>今日宜坐方位</div>
          <div className={styles.itemValue}>{result.direction}</div>
        </div>
        
        <div className={styles.resultItem}>
          <div className={styles.itemLabel}>幸运数字</div>
          <div className={styles.itemValue}>{result.luckyNumber}</div>
        </div>
        
        <div className={styles.resultItem}>
          <div className={styles.itemLabel}>幸运颜色</div>
          <div className={styles.itemValue}>{result.luckyColor}</div>
        </div>
        
        <div className={styles.resultItem}>
          <div className={styles.itemLabel}>幸运物品</div>
          <div className={styles.itemValue}>{result.luckyItem}</div>
        </div>
        
        <div className={styles.resultItem}>
          <div className={styles.itemLabel}>今日建议</div>
          <div className={styles.itemValue}>{result.advice}</div>
        </div>
        
        <div className={styles.buttonGroup}>
          <Button 
            color='primary' 
            onClick={handleBackHome}
            className={styles.button}
          >
            返回首页
          </Button>
          <Button 
            color='default' 
            onClick={handleViewHistory}
            className={styles.button}
          >
            查看历史
          </Button>
        </div>
      </div>
    </div>
  );
}

// 主页面组件，使用 Suspense 包裹 ResultContent
export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className={styles.loadingContainer}>
        <DotLoading color='primary' />
        <p>正在加载...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
} 