import { CascaderOption } from 'antd-mobile/es/components/cascader';
import provinces from 'china-division/dist/provinces.json';
import cities from 'china-division/dist/cities.json';
import areas from 'china-division/dist/areas.json';

// 将原始数据转换为级联选择器所需的格式
const formatData = () => {
  // 构建省份数据，包含城市子节点
  const provinceOptions: CascaderOption[] = provinces.map(province => {
    // 查找当前省份的所有城市
    const provinceCities = cities.filter(city => city.provinceCode === province.code);
    
    // 构建城市子节点，包含区县子节点
    const cityOptions = provinceCities.map(city => {
      // 查找当前城市的所有区县
      const cityAreas = areas.filter(area => area.cityCode === city.code);
      
      // 构建区县子节点
      const areaOptions = cityAreas.map(area => ({
        label: area.name,
        value: area.code
      }));
      
      return {
        label: city.name,
        value: city.code,
        children: areaOptions.length > 0 ? areaOptions : undefined
      };
    });
    
    return {
      label: province.name,
      value: province.code,
      children: cityOptions.length > 0 ? cityOptions : undefined
    };
  });
  
  return provinceOptions;
};

// 导出格式化后的地区数据
export const areaList: CascaderOption[] = formatData();

// 根据代码查找对应的名称
export const getAreaNameByCode = (code: string) => {
  if (code.length === 2) {
    // 省级代码
    const province = provinces.find(p => p.code === code);
    return province ? province.name : '';
  } else if (code.length === 4) {
    // 市级代码
    const city = cities.find(c => c.code === code);
    return city ? city.name : '';
  } else if (code.length === 6) {
    // 区县级代码
    const area = areas.find(a => a.code === code);
    return area ? area.name : '';
  }
  return '';
};

// 根据代码获取完整的地址（省市区）
export const getFullAddressByCode = (provinceCode: string, cityCode: string, areaCode: string) => {
  const provinceName = getAreaNameByCode(provinceCode);
  const cityName = getAreaNameByCode(cityCode);
  const areaName = getAreaNameByCode(areaCode);
  
  return [provinceName, cityName, areaName].filter(Boolean).join(' ');
}; 