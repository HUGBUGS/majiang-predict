import { FortuneData } from '../api/daily-fortune/route';
import { PredictionParams } from '../api/mahjong-prediction/route';

// API 配置
const API_KEY = process.env.OPENAI_API_KEY || '';
const BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const MODEL = process.env.AI_MODEL || 'deepseek-chat'; // 默认使用 deepseek-chat 模型

/**
 * 从 AI 服务获取今日运势数据
 * @returns {Promise<FortuneData>} 运势数据
 */
export async function getFortuneFromOpenAI(): Promise<FortuneData> {
  // 获取当前日期，使用中国时区 (UTC+8)
  const today = new Date();
  // 调整为中国时区
  const chinaDate = new Date(today.getTime() + 8 * 60 * 60 * 1000);
  
  // 格式化为 YYYY-MM-DD
  const formattedDate = chinaDate.toISOString().split('T')[0];
  
  // 获取年、月、日，用于明确告知 AI
  const year = chinaDate.getFullYear();
  const month = chinaDate.getMonth() + 1; // 月份从 0 开始，需要 +1
  const day = chinaDate.getDate();
  
  // 构建 API 请求
  const response = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的命理师，擅长预测每日运势。你需要根据提供的公历日期计算准确的农历日期，并生成今日运势预测。'
        },
        {
          role: 'user',
          content: `今天是公历 ${year}年${month}月${day}日，请为我生成今日运势预测。
          
请先计算今天的准确农历日期（注意闰月和大小月），然后生成运势预测。
          
请以JSON格式返回，包含以下字段：
- lunarDate: 农历日期，格式为"X月X日"
- chineseZodiac: 今日生肖喜神
- goodFor: 宜做事项，数组格式
- badFor: 忌做事项，数组格式
- starSign: 今日星宿
- luckyDirection: 吉利方位
- luckyNumber: 幸运数字，1-9之间的整数
- luckyColor: 幸运颜色
- luckyItem: 幸运物品
- advice: 今日运势建议

请确保农历日期的准确性，这很重要。`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })
  });
  
  if (!response.ok) {
    throw new Error(`AI API 请求失败: ${response.status}`);
  }
  
  const data = await response.json();
  
  // 解析 AI 返回的 JSON 字符串
  // 尝试从 AI 的回复中提取 JSON
  const content = data.choices[0].message.content;
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*?})/);
  
  let parsedData;
  if (jsonMatch && jsonMatch[1]) {
    parsedData = JSON.parse(jsonMatch[1]);
  } else {
    parsedData = JSON.parse(content);
  }
  
  // 确保所有必要的字段都存在
  if (!parsedData.lunarDate || !parsedData.chineseZodiac || 
      !Array.isArray(parsedData.goodFor) || !Array.isArray(parsedData.badFor) || 
      !parsedData.starSign || !parsedData.luckyDirection || 
      typeof parsedData.luckyNumber !== 'number' ||
      !parsedData.luckyColor || !parsedData.luckyItem) {
    throw new Error('AI 返回的数据格式不正确');
  }
  
  const fortuneData: FortuneData = {
    date: formattedDate,
    lunarDate: parsedData.lunarDate,
    chineseZodiac: parsedData.chineseZodiac,
    goodFor: parsedData.goodFor,
    badFor: parsedData.badFor,
    starSign: parsedData.starSign,
    luckyDirection: parsedData.luckyDirection,
    luckyNumber: parsedData.luckyNumber,
    luckyColor: parsedData.luckyColor,
    luckyItem: parsedData.luckyItem,
    advice: parsedData.advice
  };
  
  return fortuneData;
}

/**
 * 从 AI 服务获取个人化的麻将预测结果
 * @param {PredictionParams} params 用户个人信息
 * @returns {Promise<FortuneData>} 个性化的预测结果
 */
export async function getPersonalizedFortune(params: PredictionParams): Promise<FortuneData> {
  // 获取当前日期，使用中国时区 (UTC+8)
  const today = new Date();
  // 调整为中国时区
  const chinaDate = new Date(today.getTime() + 8 * 60 * 60 * 1000);
  const formattedDate = chinaDate.toISOString().split('T')[0];
  
  // 解析出生日期
  const birthDate = new Date(params.birthdate);
  const birthYear = birthDate.getFullYear();
  const birthMonth = birthDate.getMonth() + 1;
  const birthDay = birthDate.getDate();
  const birthHour = birthDate.getHours();
  const birthMinute = birthDate.getMinutes();
  
  // 构建 API 请求
  const response = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的命理师，擅长根据个人信息预测麻将运势。你需要根据提供的出生日期、姓名和出生地点，生成个性化的麻将方位预测。'
        },
        {
          role: 'user',
          content: `请为以下用户生成个性化的麻将方位预测：
          
用户信息：
- 姓名：${params.name}
- 出生日期：${birthYear}年${birthMonth}月${birthDay}日 ${birthHour}时${birthMinute}分
- 出生地点：${params.province} ${params.city} ${params.district}
- 当前日期：${formattedDate}

请根据用户的八字命理和当前日期，生成个性化的麻将方位预测。

请以JSON格式返回，包含以下字段：
- lunarDate: 当前农历日期，格式为"X月X日"
- chineseZodiac: 用户的生肖
- goodFor: 用户今日宜做事项，数组格式
- badFor: 用户今日忌做事项，数组格式
- starSign: 用户的星座
- luckyDirection: 用户今日麻将吉利方位（东、南、西、北、东南、西南、东北、西北）
- luckyNumber: 用户今日幸运数字，1-9之间的整数
- luckyColor: 用户今日幸运颜色
- luckyItem: 用户今日幸运物品
- advice: 给用户的个性化麻将运势建议，包含方位、数字、颜色和物品的应用

请确保预测结果具有个性化，与用户的出生信息相关。`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });
  
  if (!response.ok) {
    throw new Error(`AI API 请求失败: ${response.status}`);
  }
  
  const data = await response.json();
  
  // 解析 AI 返回的 JSON 字符串
  const content = data.choices[0].message.content;
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*?})/);
  
  let parsedData;
  if (jsonMatch && jsonMatch[1]) {
    parsedData = JSON.parse(jsonMatch[1]);
  } else {
    parsedData = JSON.parse(content);
  }
  
  // 确保所有必要的字段都存在
  if (!parsedData.lunarDate || !parsedData.chineseZodiac || 
      !Array.isArray(parsedData.goodFor) || !Array.isArray(parsedData.badFor) || 
      !parsedData.starSign || !parsedData.luckyDirection || 
      typeof parsedData.luckyNumber !== 'number' ||
      !parsedData.luckyColor || !parsedData.luckyItem || !parsedData.advice) {
    throw new Error('AI 返回的数据格式不正确');
  }
  
  const fortuneData: FortuneData = {
    date: formattedDate,
    lunarDate: parsedData.lunarDate,
    chineseZodiac: parsedData.chineseZodiac,
    goodFor: parsedData.goodFor,
    badFor: parsedData.badFor,
    starSign: parsedData.starSign,
    luckyDirection: parsedData.luckyDirection,
    luckyNumber: parsedData.luckyNumber,
    luckyColor: parsedData.luckyColor,
    luckyItem: parsedData.luckyItem,
    advice: parsedData.advice
  };
  
  return fortuneData;
} 