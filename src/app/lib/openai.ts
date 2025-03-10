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
          content: '你是一个简洁高效的命理师，专注于生成今日运势预测。直接返回JSON格式数据，不要多余解释。'
        },
        {
          role: 'user',
          content: `生成今日(${year}年${month}月${day}日)运势预测，直接返回JSON格式：
{
  "lunarDate": "农历X月X日",
  "chineseZodiac": "生肖喜神",
  "goodFor": ["宜做事项1", "宜做事项2", "宜做事项3"],
  "badFor": ["忌做事项1", "忌做事项2", "忌做事项3"],
  "starSign": "今日星宿",
  "luckyDirection": "吉利方位",
  "luckyNumber": 数字(1-9),
  "luckyColor": "幸运颜色",
  "luckyItem": "幸运物品",
  "advice": "简短运势建议"
}`
        }
      ],
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: "json_object" }
    })
  });
  
  if (!response.ok) {
    throw new Error(`AI API 请求失败: ${response.status}`);
  }
  
  const data = await response.json();
  
  // 解析 AI 返回的 JSON
  const content = data.choices[0].message.content;
  const parsedData = JSON.parse(content);
  
  // 调试输出
  console.log('AI 返回的原始数据:', content);
  console.log('解析后的数据 baziAnalysis:', parsedData.baziAnalysis);
  
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

// 获取中国传统时辰
function getChineseHour(hour: number): string {
  const chineseHours = [
    '子时(23:00-00:59)', '丑时(01:00-02:59)', '寅时(03:00-04:59)', '卯时(05:00-06:59)',
    '辰时(07:00-08:59)', '巳时(09:00-10:59)', '午时(11:00-12:59)', '未时(13:00-14:59)',
    '申时(15:00-16:59)', '酉时(17:00-18:59)', '戌时(19:00-20:59)', '亥时(21:00-22:59)'
  ];
  
  // 将小时转换为对应的时辰索引
  let index = Math.floor((hour + 1) % 24 / 2);
  if (hour === 23) index = 0; // 23点属于子时
  
  return chineseHours[index];
}

/**
 * 从 AI 服务获取个人化的麻将预测结果
 * @param {PredictionParams} params 用户个人信息
 * @returns {Promise<FortuneData>} 个性化的预测结果
 */
export async function getPersonalizedFortune(params: PredictionParams): Promise<FortuneData> {
  try {
    // 获取性别文本
    const genderText = params.gender === 'male' ? '男' : '女';
    
    // 获取今天的日期
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // 解析出生时间
    const birthDate = new Date(params.birthdate);
    const birthHour = birthDate.getHours();
    const birthMinute = birthDate.getMinutes();
    const birthSecond = birthDate.getSeconds();
    
    // 获取中国传统时辰
    const chineseHour = getChineseHour(birthHour);
    
    // 调用 OpenAI API
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
            content: '你是一个精通命理学的麻将运势专家，能够根据用户的生辰八字、五行、神煞等信息，精准预测麻将运势。你熟悉农历历书和天干地支的转换，能够准确计算用户的四柱八字。请直接返回JSON格式数据，不要多余解释。如果无法精确计算某些信息，请基于已知信息进行合理推断，不要在返回结果中表达不确定性。'
          },
          {
            role: 'user',
            content: `请根据以下信息，为我进行一次麻将运势分析，并以JSON格式返回结果：

姓名：${params.name}
性别：${genderText}
出生日期：${params.birthdate}（公历）
出生时间：${birthHour}时${birthMinute}分${birthSecond}秒 ${chineseHour}时
出生地点：${params.province}${params.city}${params.district}
今天日期：${formattedDate}

请提供以下分析结果，并确保返回的是有效的JSON格式：

{
  "lunarDate": "农历X月X日",
  "chineseZodiac": "用户生肖",
  "bazi": {
    "year": "年柱（天干地支，如甲子）",
    "month": "月柱（天干地支，如乙丑）",
    "day": "日柱（天干地支，如丙寅）",
    "hour": "时柱（天干地支，如丁卯）"
  },
  "baziAnalysis": "分析用户生辰八字与今日麻将运势的关联",
  "wuxing": {
    "summary": "分析用户五行与今日麻将运势的关系",
    "gold": "金的强弱",
    "wood": "木的强弱",
    "water": "水的强弱",
    "fire": "火的强弱",
    "earth": "土的强弱"
  },
  "twelvePalaces": {
    "minggong": "命宫分析",
    "wealth": "财帛宫分析",
    "health": "疾厄宫分析",
    "travel": "迁移宫分析"
  },
  "dayun": "大运分析",
  "liunian": "流年分析",
  "shenshas": [
    {
      "name": "神煞名称1",
      "type": "吉神/凶神",
      "description": "该神煞的含义解释",
      "effect": "对麻将的具体影响"
    }
  ],
  "goodFor": ["宜做事项1", "宜做事项2", "宜做事项3"],
  "badFor": ["忌做事项1", "忌做事项2", "忌做事项3"],
  "starSign": "用户星座",
  "luckyDirection": "麻将吉利方位",
  "luckyNumber": 数字(1-9),
  "luckyColor": "幸运颜色",
  "luckyItem": "幸运物品",
  "advice": "麻将运势建议"
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI API 请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 解析 AI 返回的 JSON
    const content = data.choices[0].message.content;
    let parsedData;
    
    try {
      // 尝试直接解析
      parsedData = JSON.parse(content);
    } catch (e) {
      console.error('JSON 解析错误，尝试清理内容后再解析', e);
      
      // 尝试清理内容后再解析
      // 移除可能的代码块标记和其他非JSON内容
      const cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/^\s*\n/gm, '')
        .trim();
      
      try {
        parsedData = JSON.parse(cleanedContent);
      } catch (e2) {
        console.error('清理后仍无法解析JSON', e2);
        throw new Error('无法解析AI返回的数据');
      }
    }
    
    // 调试输出
    console.log('AI 返回的原始数据:', content);
    
    // 获取五行中最强的元素
    function getStrongestElement(wuxing: any) {
      if (!wuxing) return '金';
      
      const elements = [
        { name: '金', value: wuxing.gold },
        { name: '木', value: wuxing.wood },
        { name: '水', value: wuxing.water },
        { name: '火', value: wuxing.fire },
        { name: '土', value: wuxing.earth }
      ];
      
      // 按照描述中的强弱程度排序
      const sortedElements = elements.sort((a, b) => {
        const aStrength = a.value && a.value.includes('旺') ? 3 : 
                         a.value && a.value.includes('强') ? 2 : 
                         a.value && a.value.includes('平') ? 1 : 0;
        const bStrength = b.value && b.value.includes('旺') ? 3 : 
                         b.value && b.value.includes('强') ? 2 : 
                         b.value && b.value.includes('平') ? 1 : 0;
        return bStrength - aStrength;
      });
      
      return sortedElements[0].name;
    }
    
    // 确保所有必要的字段都存在
    if (!parsedData.lunarDate || !parsedData.chineseZodiac || 
        !Array.isArray(parsedData.goodFor) || !Array.isArray(parsedData.badFor) || 
        !parsedData.starSign || !parsedData.luckyDirection || 
        typeof parsedData.luckyNumber !== 'number' ||
        !parsedData.luckyColor || !parsedData.luckyItem || !parsedData.advice) {
      throw new Error('AI 返回的数据格式不正确');
    }
    
    // 确保 baziAnalysis 字段存在，如果不存在则设置默认值
    if (!parsedData.baziAnalysis) {
      console.log('AI 返回的数据中缺少 baziAnalysis 字段，设置默认值');
      parsedData.baziAnalysis = `根据${params.name}的生辰八字分析，今日麻将运势较为平稳。建议选择${parsedData.luckyDirection}方位入座，可提升手气。`;
    }
    
    // 确保五行分析概述与麻将相关
    if (!parsedData.wuxing || !parsedData.wuxing.summary || !parsedData.wuxing.summary.includes('麻将')) {
      console.log('AI 返回的五行分析概述不符合要求，设置默认值');
      
      // 创建或更新 wuxing 对象
      parsedData.wuxing = parsedData.wuxing || {};
      
      // 设置默认的五行分析概述
      parsedData.wuxing.summary = `根据${params.name}的五行分析，今日麻将运势中${getStrongestElement(parsedData.wuxing)}较为旺盛，有利于牌局发展。建议在打牌时多关注与${getStrongestElement(parsedData.wuxing)}相关的牌型，可能会带来好运。选择${parsedData.luckyDirection}方位入座，搭配${parsedData.luckyColor}色物品，将进一步增强运势。`;
    }
    
    const fortuneData: FortuneData = {
      date: formattedDate,
      lunarDate: parsedData.lunarDate,
      chineseZodiac: parsedData.chineseZodiac,
      bazi: parsedData.bazi,
      baziAnalysis: parsedData.baziAnalysis,
      wuxing: parsedData.wuxing,
      twelvePalaces: parsedData.twelvePalaces,
      dayun: parsedData.dayun,
      liunian: parsedData.liunian,
      shenshas: parsedData.shenshas,
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
  } catch (error: any) {
    console.error('AI 服务调用失败:', error);
    throw new Error(`AI 服务调用失败: ${error.message || '未知错误'}`);
  }
}

export async function generateMahjongPrediction(params: {
  name: string;
  gender: 'male' | 'female';
  birthdate: string;
  birthtime: string;
  province: string;
  city: string;
  district: string;
}) {
  try {
    // 获取性别文本
    const genderText = params.gender === 'male' ? '男' : '女';
    
    // 获取今天的日期
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // 解析出生时间
    const [birthHour, birthMinute, birthSecond] = (params.birthtime || '00:00:00').split(':').map(Number);
    
    // 获取中国时辰
    const chineseHour = getChineseHour(birthHour);
    
    // 调用 OpenAI API
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
            content: '你是一个精通命理学的麻将运势专家，能够根据用户的生辰八字、五行、神煞等信息，精准预测麻将运势。你熟悉农历历书和天干地支的转换，能够准确计算用户的四柱八字。请直接返回JSON格式数据，不要多余解释。如果无法精确计算某些信息，请基于已知信息进行合理推断，不要在返回结果中表达不确定性。'
          },
          {
            role: 'user',
            content: `请根据以下信息，为我进行一次麻将运势分析：

姓名：${params.name}
性别：${genderText}
出生日期：${params.birthdate}（公历）
出生时间：${birthHour}时${birthMinute}分${birthSecond}秒 ${chineseHour}时
出生地点：${params.province}${params.city}${params.district}
今天日期：${formattedDate}

请提供以下分析结果：

1. 生辰八字：
   - 年柱：天干地支（例如：甲子）
   - 月柱：天干地支（例如：乙丑）
   - 日柱：天干地支（例如：丙寅）
   - 时柱：天干地支（例如：丁卯）

2. 五行分析：
   - 总体分析：分析八字中五行的强弱
   - 金：分析金在八字中的表现
   - 木：分析木在八字中的表现
   - 水：分析水在八字中的表现
   - 火：分析火在八字中的表现
   - 土：分析土在八字中的表现

3. 命宫：分析命宫的位置和特点

4. 十二宫分析（仅需分析以下四宫）：
   - 命宫：分析命宫的特点和影响
   - 财帛宫：分析财运和财富状况
   - 疾厄宫：分析健康状况
   - 迁移宫：分析出行和变动运势

5. 大运：分析当前所在大运的特点和影响

6. 流年：分析今年流年的特点和影响

7. 神煞：
   - 请列出与麻将相关的神煞（至少3个），每个神煞包括：
     - 名称：神煞的名称
     - 类型：吉神或凶神
     - 描述：神煞的基本含义
     - 对麻将的影响：这个神煞如何影响麻将运势

8. 今日麻将运势：
   - 吉利方位：最适合坐的方位
   - 幸运数字：今日的幸运数字
   - 幸运颜色：今日的幸运颜色
   - 幸运物品：可以带来好运的物品
   - 建议：打麻将时应该注意的事项

请确保分析准确、详细，并且与麻将运势紧密相关。`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI API 请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 解析 AI 返回的 JSON
    const content = data.choices[0].message.content;
    const parsedData = JSON.parse(content);
    
    // 调试输出
    console.log('AI 返回的原始数据:', content);
    console.log('解析后的数据 baziAnalysis:', parsedData.baziAnalysis);
    
    // 确保所有必要的字段都存在
    if (!parsedData.lunarDate || !parsedData.chineseZodiac || 
        !Array.isArray(parsedData.goodFor) || !Array.isArray(parsedData.badFor) || 
        !parsedData.starSign || !parsedData.luckyDirection || 
        typeof parsedData.luckyNumber !== 'number' ||
        !parsedData.luckyColor || !parsedData.luckyItem || !parsedData.advice) {
      throw new Error('AI 返回的数据格式不正确');
    }
    
    // 确保 baziAnalysis 字段存在，如果不存在则设置默认值
    if (!parsedData.baziAnalysis) {
      console.log('AI 返回的数据中缺少 baziAnalysis 字段，设置默认值');
      parsedData.baziAnalysis = `根据${params.name}的生辰八字分析，今日麻将运势较为平稳。建议选择${parsedData.luckyDirection}方位入座，可提升手气。`;
    }
    
    // 获取五行中最强的元素
    function getStrongestElement(wuxing: any) {
      if (!wuxing) return '金';
      
      const elements = [
        { name: '金', value: wuxing.gold },
        { name: '木', value: wuxing.wood },
        { name: '水', value: wuxing.water },
        { name: '火', value: wuxing.fire },
        { name: '土', value: wuxing.earth }
      ];
      
      // 按照描述中的强弱程度排序
      const sortedElements = elements.sort((a, b) => {
        const aStrength = a.value && a.value.includes('旺') ? 3 : 
                         a.value && a.value.includes('强') ? 2 : 
                         a.value && a.value.includes('平') ? 1 : 0;
        const bStrength = b.value && b.value.includes('旺') ? 3 : 
                         b.value && b.value.includes('强') ? 2 : 
                         b.value && b.value.includes('平') ? 1 : 0;
        return bStrength - aStrength;
      });
      
      return sortedElements[0].name;
    }
    
    // 确保五行分析概述与麻将相关
    if (!parsedData.wuxing || !parsedData.wuxing.summary || !parsedData.wuxing.summary.includes('麻将')) {
      console.log('AI 返回的五行分析概述不符合要求，设置默认值');
      
      // 创建或更新 wuxing 对象
      parsedData.wuxing = parsedData.wuxing || {};
      
      // 设置默认的五行分析概述
      parsedData.wuxing.summary = `根据${params.name}的五行分析，今日麻将运势中${getStrongestElement(parsedData.wuxing)}较为旺盛，有利于牌局发展。建议在打牌时多关注与${getStrongestElement(parsedData.wuxing)}相关的牌型，可能会带来好运。选择${parsedData.luckyDirection}方位入座，搭配${parsedData.luckyColor}色物品，将进一步增强运势。`;
    }
    
    const fortuneData: FortuneData = {
      date: formattedDate,
      lunarDate: parsedData.lunarDate,
      chineseZodiac: parsedData.chineseZodiac,
      bazi: parsedData.bazi,
      baziAnalysis: parsedData.baziAnalysis,
      wuxing: parsedData.wuxing,
      twelvePalaces: parsedData.twelvePalaces,
      dayun: parsedData.dayun,
      liunian: parsedData.liunian,
      shenshas: parsedData.shenshas,
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
  } catch (error: any) {
    console.error('AI 服务调用失败:', error);
    throw new Error(`AI 服务调用失败: ${error.message || '未知错误'}`);
  }
}