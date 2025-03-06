'use client';

import Image from 'next/image';
import MahjongForm from './MahjongForm';
import DailyFortune from './DailyFortune';
import { useEffect, useState } from 'react';

export default function HomeClient() {
  // 添加响应式状态
  const [isMobile, setIsMobile] = useState(false);

  // 检测窗口大小变化
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初始检查
    checkMobile();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);
    
    // 清理监听器
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-amber-100">
      {/* 麻将banner图 */}
      <div className="relative w-full max-w-4xl h-36 sm:h-48 mb-6 sm:mb-8 overflow-hidden rounded-lg shadow-md">
        <Image 
          src="/mahjong-banner.jpg" 
          alt="麻将背景图" 
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg">麻将方位预测</h1>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <MahjongForm />
      </div>

      {/* 今日运势 */}
      <DailyFortune />

      {/* 麻将元素装饰 - 在非移动设备上显示 */}
      {!isMobile && (
        <div className="flex justify-center gap-4 mb-6 sm:mb-8">
          <div className="w-10 h-14 sm:w-12 sm:h-16 bg-white rounded-md shadow-md flex items-center justify-center text-xl sm:text-2xl transform rotate-3">🀄</div>
          <div className="w-10 h-14 sm:w-12 sm:h-16 bg-white rounded-md shadow-md flex items-center justify-center text-xl sm:text-2xl transform -rotate-2">🀑</div>
          <div className="w-10 h-14 sm:w-12 sm:h-16 bg-white rounded-md shadow-md flex items-center justify-center text-xl sm:text-2xl transform rotate-1">🀘</div>
          <div className="w-10 h-14 sm:w-12 sm:h-16 bg-white rounded-md shadow-md flex items-center justify-center text-xl sm:text-2xl transform -rotate-3">🀂</div>
        </div>
      )}

      <footer className="text-center text-gray-500 text-xs sm:text-sm mt-auto py-4">
        麻将方位预测 © {new Date().getFullYear()} - 仅供娱乐
      </footer>
    </main>
  );
} 