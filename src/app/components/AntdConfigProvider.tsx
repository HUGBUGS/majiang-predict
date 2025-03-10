'use client';

import React from 'react';
import { ConfigProvider } from 'antd-mobile';
import zhCN from 'antd-mobile/es/locales/zh-CN';

export default function AntdConfigProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ConfigProvider locale={zhCN}>
      {children}
    </ConfigProvider>
  );
}