'use client';

export type ToastPosition = 'top' | 'bottom' | 'center';

/**
 * 显示 Toast 提示
 * @param content 提示内容
 * @param position 提示位置，可选 'top'、'bottom'、'center'
 * @param duration 显示时长，单位毫秒，设为 0 则不自动关闭
 */
export function showToast(content: string, position: ToastPosition = 'center', duration: number = 2000) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log('服务器端调用 showToast，忽略');
    return;
  }
  
  console.log('显示 Toast:', content);
  
  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  overlay.style.zIndex = '999998';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  
  // 如果是加载提示，添加标记
  if (duration === 0) {
    overlay.setAttribute('data-toast-loading', 'true');
  }
  
  // 创建 Toast 元素
  const toast = document.createElement('div');
  
  // 设置基本样式
  toast.style.position = 'fixed';
  toast.style.zIndex = '999999';
  toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  toast.style.color = 'white';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '8px';
  toast.style.fontSize = '14px';
  toast.style.maxWidth = '80%';
  toast.style.textAlign = 'center';
  toast.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
  toast.style.transition = 'all 0.3s ease';
  
  // 设置位置
  if (position === 'top') {
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
  } else if (position === 'bottom') {
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
  } else { // center
    toast.style.top = '50%';
    toast.style.left = '50%';
    toast.style.transform = 'translate(-50%, -50%)';
  }
  
  // 设置内容
  toast.textContent = content;
  
  // 添加到 body
  document.body.appendChild(overlay);
  document.body.appendChild(toast);
  
  // 自动关闭（如果 duration 不为 0）
  if (duration > 0) {
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, duration);
  }
} 