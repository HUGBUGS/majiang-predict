'use client';

import { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Select, Button, Tooltip, message } from 'antd';
import { CompassOutlined, HistoryOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { provinceOptions, getCityOptions, getAreaOptions } from '../utils/location';
import { PredictionParams } from '../api/mahjong-prediction/route';

const { Option } = Select;

interface FormValues {
  name: string;
  birthdate: Date;
  province: string;
  city: string;
  district: string;
}

export default function MahjongForm() {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [areas, setAreas] = useState<{ value: string; label: string }[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 当省份变化时，更新城市列表
  useEffect(() => {
    if (selectedProvince) {
      const cityOptions = getCityOptions(selectedProvince);
      setCities(cityOptions);
      // 清空已选择的城市和区县
      form.setFieldsValue({ city: undefined, district: undefined });
      setSelectedCity('');
      setAreas([]);
    }
  }, [selectedProvince, form]);

  // 当城市变化时，更新区县列表
  useEffect(() => {
    if (selectedCity) {
      const areaOptions = getAreaOptions(selectedCity);
      setAreas(areaOptions);
      // 清空已选择的区县
      form.setFieldsValue({ district: undefined });
    }
  }, [selectedCity, form]);

  const onProvinceChange = (value: string) => {
    setSelectedProvince(value);
  };

  const onCityChange = (value: string) => {
    setSelectedCity(value);
  };

  const onFinish = async (values: FormValues) => {
    try {
      setSubmitting(true);
      
      // 准备请求参数
      const params: PredictionParams = {
        name: values.name,
        birthdate: values.birthdate.toISOString().split('T')[0], // 格式化为 YYYY-MM-DD
        province: values.province,
        city: values.city,
        district: values.district
      };
      
      // 发送请求到 API
      const response = await fetch('/api/mahjong-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // 将预测结果存储在 localStorage 中
        localStorage.setItem('predictionResult', JSON.stringify(result.data));
        
        // 跳转到结果页面
        router.push('/result');
      } else {
        throw new Error(result.message || '生成预测结果失败');
      }
    } catch (err) {
      console.error('提交表单失败:', err);
      message.error('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="w-full"
      size="large"
    >
      <Form.Item
        name="name"
        label="姓名"
        rules={[
          { required: true, message: '请输入您的姓名' },
          { max: 10, message: '姓名不能超过10个字符' },
          { pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/, message: '姓名只能包含中文或英文字符' }
        ]}
      >
        <Input placeholder="请输入您的姓名" maxLength={10} />
      </Form.Item>

      <Form.Item
        name="birthdate"
        label="出生日期"
        rules={[{ required: true, message: '请选择您的出生日期' }]}
      >
        <DatePicker 
          className="w-full" 
          placeholder="选择日期"
          format="YYYY-MM-DD"
          inputReadOnly={true}
          popupStyle={{ zIndex: 1050 }}
        />
      </Form.Item>

      <Form.Item label="出生地" className="mb-6">
        <div className="grid grid-cols-3 gap-2">
          <Form.Item
            name="province"
            noStyle
            rules={[{ required: true, message: '请选择省份' }]}
          >
            <Select 
              placeholder="省份" 
              onChange={onProvinceChange}
              showSearch
              optionFilterProp="children"
              className="w-full"
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ minWidth: '120px' }}
            >
              {provinceOptions.map(province => (
                <Option key={province.value} value={province.value}>
                  <Tooltip title={province.label} placement="right">
                    <div className="truncate">{province.label}</div>
                  </Tooltip>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="city"
            noStyle
            rules={[{ required: true, message: '请选择城市' }]}
          >
            <Select 
              placeholder="城市" 
              onChange={onCityChange}
              disabled={!selectedProvince}
              showSearch
              optionFilterProp="children"
              className="w-full"
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ minWidth: '120px' }}
            >
              {cities.map(city => (
                <Option key={city.value} value={city.value}>
                  <Tooltip title={city.label} placement="right">
                    <div className="truncate">{city.label}</div>
                  </Tooltip>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="district"
            noStyle
            rules={[{ required: true, message: '请选择区县' }]}
          >
            <Select 
              placeholder="区县" 
              disabled={!selectedCity}
              showSearch
              optionFilterProp="children"
              className="w-full"
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ minWidth: '120px' }}
            >
              {areas.map(area => (
                <Option key={area.value} value={area.value}>
                  <Tooltip title={area.label} placement="right">
                    <div className="truncate">{area.label}</div>
                  </Tooltip>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          className="w-full h-12 text-lg mb-3"
          icon={<CompassOutlined />}
          loading={submitting}
        >
          开始测算
        </Button>
        <Link href="/history" className="block w-full">
          <Button 
            className="w-full h-12 text-lg"
            icon={<HistoryOutlined />}
          >
            查看历史记录
          </Button>
        </Link>
      </Form.Item>
    </Form>
  );
} 