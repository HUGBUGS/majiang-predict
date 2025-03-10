/**
 * 设备指纹生成工具
 * 使用 FingerprintJS 库生成唯一的设备指纹并存储在localStorage中
 */
import * as FingerprintJSLib from '@fingerprintjs/fingerprintjs';

// 存储指纹的key
const FINGERPRINT_KEY = 'device_fingerprint';

// 创建 FingerprintJS 实例
let fpPromise: Promise<FingerprintJSLib.Agent> | null = null;

/**
 * 初始化 FingerprintJS
 * @returns FingerprintJS 实例的 Promise
 */
function initFingerprint(): Promise<FingerprintJSLib.Agent> {
  if (!fpPromise && typeof window !== 'undefined') {
    // 在客户端环境中加载 FingerprintJS
    fpPromise = FingerprintJSLib.load();
  }
  return fpPromise as Promise<FingerprintJSLib.Agent>;
}

/**
 * 生成设备指纹
 * 如果localStorage中已存在，则返回已有的指纹
 * 否则使用 FingerprintJS 生成一个新的指纹并存储
 * @returns 设备指纹
 */
export async function getDeviceFingerprintAsync(): Promise<string> {
  // 检查是否在浏览器环境
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    // 服务器端渲染时返回一个临时指纹
    return `server-${Date.now()}`;
  }
  
  // 尝试从localStorage获取已存在的指纹
  let fingerprint = localStorage.getItem(FINGERPRINT_KEY);
  
  // 如果不存在，则使用 FingerprintJS 生成一个新的指纹
  if (!fingerprint) {
    try {
      const fp = await initFingerprint();
      const result = await fp.get();
      
      // 使用 FingerprintJS 生成的 visitorId 作为指纹
      fingerprint = result.visitorId;
      
      // 存储到localStorage
      localStorage.setItem(FINGERPRINT_KEY, fingerprint);
    } catch (error) {
      console.error('生成设备指纹失败:', error);
      // 如果 FingerprintJS 失败，使用备用方法
      fingerprint = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem(FINGERPRINT_KEY, fingerprint);
    }
  }
  
  return fingerprint || `error-${Date.now()}`;
}

/**
 * 同步获取设备指纹（用于兼容现有代码）
 * 如果localStorage中已存在，则返回已有的指纹
 * 否则返回一个临时指纹，并在后台异步生成真正的指纹
 * @returns 设备指纹
 */
export function getDeviceFingerprint(): string {
  // 检查是否在浏览器环境
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    // 服务器端渲染时返回一个临时指纹
    return `server-${Date.now()}`;
  }
  
  // 尝试从localStorage获取已存在的指纹
  const fingerprint = localStorage.getItem(FINGERPRINT_KEY);
  
  // 如果不存在，则返回一个临时指纹，并在后台异步生成真正的指纹
  if (!fingerprint) {
    // 临时指纹
    const tempFingerprint = `temp-${Date.now()}`;
    localStorage.setItem(FINGERPRINT_KEY, tempFingerprint);
    
    // 在后台异步生成真正的指纹
    getDeviceFingerprintAsync().then(realFingerprint => {
      localStorage.setItem(FINGERPRINT_KEY, realFingerprint);
    }).catch(error => {
      console.error('异步生成设备指纹失败:', error);
    });
    
    return tempFingerprint;
  }
  
  return fingerprint;
}

/**
 * 重置设备指纹
 * 删除localStorage中存储的指纹
 */
export function resetDeviceFingerprint(): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.removeItem(FINGERPRINT_KEY);
  }
} 