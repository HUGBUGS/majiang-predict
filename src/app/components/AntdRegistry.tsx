'use client';

import React from 'react';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { useServerInsertedHTML } from 'next/navigation';

export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  const cache = React.useMemo(() => createCache(), []);
  
  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `</script>${extractStyle(cache)}<script>`,
        }}
      />
    );
  });
  
  return <StyleProvider cache={cache}>{children}</StyleProvider>;
} 