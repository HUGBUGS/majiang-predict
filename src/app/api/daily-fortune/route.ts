import { NextResponse } from 'next/server';
import { getDailyFortune } from '../../lib/db';

// 定义运势数据接口
export interface FortuneData {
  lunarDate: string;
  chineseZodiac: string;
  goodFor: string[];
  badFor: string[];
  starSign: string;
  luckyDirection: string;
  luckyNumber: number;
  date: string; // 当前日期，格式为 YYYY-MM-DD
}

// 生成随机运势数据（作为备用，当数据库中没有数据时使用）
function generateFortuneData(): FortuneData {
  const goodActivities = ['打牌', '聚会', '投资', '出行', '谈判', '签约', '装修', '搬家', '开业', '求财', '祭祀', '结婚'];
  const badActivities = ['动土', '安葬', '诉讼', '远行', '开张', '交易', '入宅', '开工', '破土', '安门'];
  const directions = ['东', '南', '西', '北', '东南', '西南', '东北', '西北'];
  const starSigns = ['角宿', '亢宿', '氐宿', '房宿', '心宿', '尾宿', '箕宿', '斗宿', '牛宿', '女宿', '虚宿', '危宿', '室宿', '壁宿', '奎宿', '娄宿', '胃宿', '昴宿', '毕宿', '觜宿', '参宿', '井宿', '鬼宿', '柳宿', '星宿', '张宿', '翼宿', '轸宿'];
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  
  // 随机选择宜忌项目
  const shuffleArray = (array: string[]) => [...array].sort(() => Math.random() - 0.5);
  const goodFor = shuffleArray(goodActivities).slice(0, 3 + Math.floor(Math.random() * 3));
  const badFor = shuffleArray(badActivities).slice(0, 2 + Math.floor(Math.random() * 3));
  
  // 获取今天的农历日期（这里简化处理，实际应用中应使用农历转换库）
  const today = new Date();
  const lunarMonth = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'][today.getMonth()];
  const lunarDay = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', 
                    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'][today.getDate() % 30];
  
  // 格式化当前日期为 YYYY-MM-DD
  const formattedDate = today.toISOString().split('T')[0];
  
  return {
    lunarDate: `${lunarMonth}月${lunarDay}`,
    chineseZodiac: zodiacs[Math.floor(Math.random() * zodiacs.length)],
    goodFor,
    badFor,
    starSign: starSigns[Math.floor(Math.random() * starSigns.length)],
    luckyDirection: directions[Math.floor(Math.random() * directions.length)],
    luckyNumber: Math.floor(Math.random() * 9) + 1,
    date: formattedDate
  };
}

// 处理 GET 请求
export async function GET() {
  try {
    // 从数据库获取今日运势数据
    let fortuneData = await getDailyFortune();
    
    // 如果数据库中没有数据，则生成随机数据
    if (!fortuneData) {
      fortuneData = generateFortuneData();
    }
    
    // 返回 JSON 响应
    return NextResponse.json({ 
      success: true, 
      data: fortuneData 
    });
  } catch (error) {
    console.error('获取运势数据失败:', error);
    return NextResponse.json(
      { success: false, message: '获取运势数据失败' },
      { status: 500 }
    );
  }
} 