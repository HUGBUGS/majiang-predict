import provinces from 'china-division/dist/provinces.json';
import cities from 'china-division/dist/cities.json';
import areas from 'china-division/dist/areas.json';

// 省份数据
export const provinceOptions = provinces.map(province => ({
  value: province.code,
  label: province.name
}));

// 根据省份代码获取城市数据
export const getCityOptions = (provinceCode: string) => {
  return cities
    .filter(city => city.provinceCode === provinceCode)
    .map(city => ({
      value: city.code,
      label: city.name
    }));
};

// 根据城市代码获取区县数据
export const getAreaOptions = (cityCode: string) => {
  return areas
    .filter(area => area.cityCode === cityCode)
    .map(area => ({
      value: area.code,
      label: area.name
    }));
};

// 根据代码获取名称
export const getLocationName = (code: string) => {
  if (!code) return '';
  
  // 省份
  if (code.endsWith('0000')) {
    const province = provinces.find(p => p.code === code);
    return province ? province.name : '';
  }
  
  // 城市
  if (code.endsWith('00')) {
    const city = cities.find(c => c.code === code);
    return city ? city.name : '';
  }
  
  // 区县
  const area = areas.find(a => a.code === code);
  return area ? area.name : '';
}; 