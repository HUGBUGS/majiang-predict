-- 添加生辰八字字段
ALTER TABLE predictions ADD COLUMN bazi_year VARCHAR(255) AFTER gender;
ALTER TABLE predictions ADD COLUMN bazi_month VARCHAR(255) AFTER bazi_year;
ALTER TABLE predictions ADD COLUMN bazi_day VARCHAR(255) AFTER bazi_month;
ALTER TABLE predictions ADD COLUMN bazi_hour VARCHAR(255) AFTER bazi_day;
ALTER TABLE predictions ADD COLUMN bazi_analysis TEXT AFTER bazi_hour;

-- 添加五行字段
ALTER TABLE predictions ADD COLUMN wuxing_summary TEXT AFTER bazi_analysis;
ALTER TABLE predictions ADD COLUMN wuxing_gold VARCHAR(255) AFTER wuxing_summary;
ALTER TABLE predictions ADD COLUMN wuxing_wood VARCHAR(255) AFTER wuxing_gold;
ALTER TABLE predictions ADD COLUMN wuxing_water VARCHAR(255) AFTER wuxing_wood;
ALTER TABLE predictions ADD COLUMN wuxing_fire VARCHAR(255) AFTER wuxing_water;
ALTER TABLE predictions ADD COLUMN wuxing_earth VARCHAR(255) AFTER wuxing_fire;

-- 添加命宫字段
ALTER TABLE predictions ADD COLUMN minggong TEXT AFTER wuxing_earth;

-- 修改十二宫字段
ALTER TABLE predictions DROP COLUMN IF EXISTS twelve_palaces_summary;
ALTER TABLE predictions DROP COLUMN IF EXISTS twelve_palaces_career;
ALTER TABLE predictions DROP COLUMN IF EXISTS twelve_palaces_relationship;

-- 添加新的十二宫字段
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS twelve_palaces_minggong TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS twelve_palaces_health TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS twelve_palaces_travel TEXT;

-- 确保其他必要的字段存在
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS minggong TEXT;

-- 添加大运和流年字段
ALTER TABLE predictions ADD COLUMN dayun TEXT AFTER twelve_palaces_minggong;
ALTER TABLE predictions ADD COLUMN liunian TEXT AFTER dayun;

-- 添加神煞字段
ALTER TABLE predictions ADD COLUMN shenshas TEXT AFTER liunian; 