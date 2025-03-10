'use client';

import { useEffect, useState } from 'react';
import { Card, Tag, Skeleton } from 'antd-mobile';
import { FortuneData } from '../api/daily-fortune/route';
import styles from './DailyFortune.module.css';

export default function DailyFortune() {
  const [fortune, setFortune] = useState<FortuneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFortune = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/daily-fortune');
        const result = await response.json();

        if (result.success) {
          setFortune(result.data);
        } else {
          setError(result.message || '获取运势数据失败');
        }
      } catch (err) {
        console.error('获取运势数据出错:', err);
        setError('网络错误，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchFortune();
  }, []);

  if (loading) {
    return (
      <div className={styles.dailyFortune}>
        <Card className={styles.fortuneCard}>
          <div style={{ padding: '20px' }}>
            <Skeleton.Title animated />
            <Skeleton.Paragraph lineCount={5} animated />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dailyFortune}>
        <Card className={styles.fortuneCard}>
          <div className={styles.errorMessage}>
            <span>⚠️ {error}</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!fortune) {
    return null;
  }

  return (
    <div className={styles.dailyFortune}>
      <Card className={styles.fortuneCard}>
        <div className={styles.cardTitle}>今日运势</div>
        
        <div className={styles.dateRow}>
          <div className={styles.solarDate}>{fortune.date}</div>
          <div className={styles.lunarDate}>{fortune.lunarDate}</div>
        </div>
        
        <div className={styles.infoContainer}>
          <div className={styles.infoItem}>
            <span className={styles.label}>喜神生肖</span>
            <span className={styles.value}>{fortune.chineseZodiac}</span>
          </div>
          
          <div className={styles.infoItem}>
            <span className={styles.label}>幸运星座</span>
            <span className={styles.value}>{fortune.starSign}</span>
          </div>
        </div>
        
        <div className={styles.fortuneSection}>
          <div className={styles.sectionTitle}>宜</div>
          <div className={styles.tagsContainer}>
            {fortune.goodFor.map((item, index) => (
              <Tag key={`good-${index}`} color="#4caf50" fill="outline" className={styles.fortuneTag}>{item}</Tag>
            ))}
          </div>
        </div>
        
        <div className={styles.fortuneSection}>
          <div className={styles.sectionTitle}>忌</div>
          <div className={styles.tagsContainer}>
            {fortune.badFor.map((item, index) => (
              <Tag key={`bad-${index}`} color="#f44336" fill="outline" className={styles.fortuneTag}>{item}</Tag>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
} 