'use client';

import React from 'react';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#d32029',
          borderRadius: 8,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
} 