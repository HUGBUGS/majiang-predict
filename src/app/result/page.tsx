'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  lunarDate?: string;
  chineseZodiac?: string;
  starSign?: string;
  bazi?: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  wuxing?: {
    summary: string;
    gold: string;
    wood: string;
    water: string;
    fire: string;
    earth: string;
  };
  twelvePalaces?: {
    minggong: string; // 命宫
    wealth: string;   // 财帛宫
    health: string;   // 疾厄宫
    travel: string;   // 迁移宫
  };
  dayun?: string;
  liunian?: string;
  shenshas?: Array<{
    name: string;
    type: string;
    description: string;
    effect: string;
  }>;
  goodFor?: string[];
  badFor?: string[];
  baziAnalysis?: string;
}

// 主页面组件
export default function ResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        // 从 URL 获取 ID
        const url = new URL(window.location.href);
        const id = url.searchParams.get('id');
        
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

        console.log('API 返回的预测结果:', data.data);
        console.log('baziAnalysis 字段:', data.data.baziAnalysis);
        setResult(data.data);
      } catch (error) {
        console.error('获取预测结果失败:', error);
        setError(error instanceof Error ? error.message : '获取预测结果失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, []);

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
          {result.lunarDate && <span> ({result.lunarDate})</span>}
        </div>

        {result.bazi && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>四柱</h3>
            
            <div className={styles.baziGrid}>
              <div className={styles.baziColumn}>
                <div className={styles.baziLabel}>年柱</div>
                <div className={styles.baziValue}>{result.bazi.year}</div>
              </div>
              <div className={styles.baziColumn}>
                <div className={styles.baziLabel}>月柱</div>
                <div className={styles.baziValue}>{result.bazi.month}</div>
              </div>
              <div className={styles.baziColumn}>
                <div className={styles.baziLabel}>日柱</div>
                <div className={styles.baziValue}>{result.bazi.day}</div>
              </div>
              <div className={styles.baziColumn}>
                <div className={styles.baziLabel}>时柱</div>
                <div className={styles.baziValue}>{result.bazi.hour}</div>
              </div>
            </div>
            
            <div className={styles.baziAnalysis}>
              <div className={styles.analysisLabel}>今日麻将运势分析</div>
              <div className={styles.analysisContent}>
                {result.baziAnalysis || "暂无分析数据，请重新生成预测。"}
              </div>
            </div>
          </div>
        )}

        {result.wuxing && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>五行</h3>
            
            <div className={styles.wuxingGrid}>
              <div className={styles.wuxingColumn}>
                <div className={styles.wuxingLabel}>金</div>
                <div className={styles.wuxingValue}>{result.wuxing.gold}</div>
              </div>
              <div className={styles.wuxingColumn}>
                <div className={styles.wuxingLabel}>木</div>
                <div className={styles.wuxingValue}>{result.wuxing.wood}</div>
              </div>
              <div className={styles.wuxingColumn}>
                <div className={styles.wuxingLabel}>水</div>
                <div className={styles.wuxingValue}>{result.wuxing.water}</div>
              </div>
              <div className={styles.wuxingColumn}>
                <div className={styles.wuxingLabel}>火</div>
                <div className={styles.wuxingValue}>{result.wuxing.fire}</div>
              </div>
              <div className={styles.wuxingColumn}>
                <div className={styles.wuxingLabel}>土</div>
                <div className={styles.wuxingValue}>{result.wuxing.earth}</div>
              </div>
            </div>
            
            <div className={styles.wuxingAnalysis}>
              <div className={styles.analysisLabel}>今日麻将五行分析</div>
              <div className={styles.analysisContent}>
                {result.wuxing.summary || "暂无五行分析数据"}
              </div>
            </div>
          </div>
        )}

        {result.twelvePalaces && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>十二宫</h3>
            
            <div className={styles.twelvePalacesGrid}>
              <div className={styles.palaceColumn}>
                <div className={styles.palaceLabel}>命宫</div>
                <div className={styles.palaceValue}>{result.twelvePalaces.minggong}</div>
              </div>
              <div className={styles.palaceColumn}>
                <div className={styles.palaceLabel}>财帛宫</div>
                <div className={styles.palaceValue}>{result.twelvePalaces.wealth}</div>
              </div>
              <div className={styles.palaceColumn}>
                <div className={styles.palaceLabel}>疾厄宫</div>
                <div className={styles.palaceValue}>{result.twelvePalaces.health}</div>
              </div>
              <div className={styles.palaceColumn}>
                <div className={styles.palaceLabel}>迁移宫</div>
                <div className={styles.palaceValue}>{result.twelvePalaces.travel}</div>
              </div>
            </div>
          </div>
        )}

        {(result.dayun || result.liunian || (result.shenshas && result.shenshas.length > 0)) && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>命理运势</h3>
            
            <div className={styles.fortuneGrid}>
              {result.dayun && (
                <div className={styles.fortuneColumn}>
                  <div className={styles.fortuneLabel}>大运</div>
                  <div className={styles.fortuneValue}>{result.dayun}</div>
                </div>
              )}
              
              {result.liunian && (
                <div className={styles.fortuneColumn}>
                  <div className={styles.fortuneLabel}>流年</div>
                  <div className={styles.fortuneValue}>{result.liunian}</div>
                </div>
              )}
            </div>
            
            {result.shenshas && result.shenshas.length > 0 && (
              <div className={styles.shenshasContainer}>
                <div className={styles.fortuneLabel}>神煞</div>
                <div className={styles.shenshasGrid}>
                  {result.shenshas.map((shensha, index) => (
                    <div key={index} className={styles.shenshaCard}>
                      <div className={styles.shenshaHeader}>
                        <span className={styles.shenshaName}>{shensha.name}</span>
                        <span className={`${styles.shenshaType} ${shensha.type.includes('吉') ? styles.shenshaGood : styles.shenshaBad}`}>
                          {shensha.type}
                        </span>
                      </div>
                      <div className={styles.shenshaDescription}>{shensha.description}</div>
                      <div className={styles.shenshaEffect}>{shensha.effect}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>麻将运势</h3>
          
          <div className={styles.mahjongGrid}>
            {result.chineseZodiac && (
              <div className={styles.mahjongColumn}>
                <div className={styles.mahjongLabel}>生肖</div>
                <div className={styles.mahjongValue}>{result.chineseZodiac}</div>
              </div>
            )}
            
            {result.starSign && (
              <div className={styles.mahjongColumn}>
                <div className={styles.mahjongLabel}>星座</div>
                <div className={styles.mahjongValue}>{result.starSign}</div>
              </div>
            )}
            
            <div className={styles.mahjongColumn}>
              <div className={styles.mahjongLabel}>今日宜坐方位</div>
              <div className={styles.mahjongValue}>{result.direction}</div>
            </div>
            
            <div className={styles.mahjongColumn}>
              <div className={styles.mahjongLabel}>幸运数字</div>
              <div className={styles.mahjongValue}>{result.luckyNumber}</div>
            </div>
            
            <div className={styles.mahjongColumn}>
              <div className={styles.mahjongLabel}>幸运颜色</div>
              <div className={styles.mahjongValue}>{result.luckyColor}</div>
            </div>
            
            <div className={styles.mahjongColumn}>
              <div className={styles.mahjongLabel}>幸运物品</div>
              <div className={styles.mahjongValue}>{result.luckyItem}</div>
            </div>
            
            {result.goodFor && result.goodFor.length > 0 && (
              <div className={styles.mahjongColumn}>
                <div className={styles.mahjongLabel}>今日宜</div>
                <div className={styles.mahjongValue}>{result.goodFor.join('、')}</div>
              </div>
            )}
            
            {result.badFor && result.badFor.length > 0 && (
              <div className={styles.mahjongColumn}>
                <div className={styles.mahjongLabel}>今日忌</div>
                <div className={styles.mahjongValue}>{result.badFor.join('、')}</div>
              </div>
            )}
          </div>
          
          <div className={styles.mahjongAdvice}>
            <div className={styles.analysisLabel}>今日建议</div>
            <div className={styles.analysisContent}>{result.advice}</div>
          </div>
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