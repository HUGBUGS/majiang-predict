'use client';

import { useState } from 'react';
import { Form, Input, Button, Cascader, DatePicker, Radio, SpinLoading } from 'antd-mobile';
import { useRouter } from 'next/navigation';
import { CascaderValue } from 'antd-mobile/es/components/cascader';
import { RadioValue } from 'antd-mobile/es/components/radio';
import { areaList, getAreaNameByCode } from '../utils/areaData';
import { getDeviceFingerprint } from '../utils/fingerprint';
import { showToast } from '../utils/toast';
import styles from './PredictionForm.module.css';

// 定义表单数据接口
interface FormData {
  name: string;
  gender: 'male' | 'female';
  birthDateTime?: Date;
  area?: CascaderValue[];
}

// 定义提交数据接口
interface SubmitData {
  name: string;
  gender: 'male' | 'female';
  birthdate?: string;
  province?: string;
  city?: string;
  district?: string;
  deviceFingerprint: string;
}

export default function PredictionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [genderValue, setGenderValue] = useState<'male' | 'female'>('male');
  const [birthDateValue, setBirthDateValue] = useState<Date | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [areaPickerVisible, setAreaPickerVisible] = useState(false);
  const [selectedArea, setSelectedArea] = useState<CascaderValue[]>([]);
  const [form] = Form.useForm();
  
  // 验证姓名是否只包含中文
  const validateChineseName = (value: string) => {
    const chineseRegex = /^[\u4e00-\u9fa5]+$/;
    return chineseRegex.test(value);
  };
  
  // 处理姓名输入变化
  const handleNameChange = (value: string) => {
    // 如果输入为空或者只包含中文，则更新值
    if (value === '' || validateChineseName(value)) {
      // 限制长度不超过10个字符
      if (value.length <= 10) {
        setNameValue(value);
      }
    }
  };
  
  // 处理性别选择变化
  const handleGenderChange = (val: RadioValue) => {
    const value = val.toString();
    setGenderValue(value as 'male' | 'female');
    form.setFieldValue('gender', value);
  };
  
  const onFinish = async (values: FormData) => {
    try {
      setLoading(true);
      
      // 使用状态中的日期，因为表单可能没有正确捕获
      if (!birthDateValue) {
        console.log('显示提示：请选择出生日期时间');
        showToast('请选择出生日期时间', 'bottom');
        setLoading(false);
        return;
      }
      
      // 检查地区选择
      if (!values.area || values.area.length < 3) {
        console.log('显示提示：请完整选择省市区');
        showToast('请完整选择省市区', 'bottom');
        setLoading(false);
        return;
      }
      
      // 创建新的日期对象，但将秒和毫秒设置为0
      const dateWithoutSeconds = new Date(birthDateValue);
      dateWithoutSeconds.setSeconds(0, 0);
      
      // 格式化为 MySQL 兼容的日期时间格式 'YYYY-MM-DD HH:MM:SS'
      const year = dateWithoutSeconds.getFullYear();
      const month = String(dateWithoutSeconds.getMonth() + 1).padStart(2, '0');
      const day = String(dateWithoutSeconds.getDate()).padStart(2, '0');
      const hours = String(dateWithoutSeconds.getHours()).padStart(2, '0');
      const minutes = String(dateWithoutSeconds.getMinutes()).padStart(2, '0');
      
      const birthdate = `${year}-${month}-${day} ${hours}:${minutes}:00`;
      
      // 获取选中的区域代码
      const [provinceCode, cityCode, districtCode] = values.area.map(String);
      
      // 获取区域名称
      const province = getAreaNameByCode(provinceCode);
      const city = getAreaNameByCode(cityCode);
      const district = getAreaNameByCode(districtCode);
      
      // 获取设备指纹
      const deviceFingerprint = getDeviceFingerprint();
      
      // 准备提交的数据
      const data: SubmitData = {
        name: values.name,
        gender: values.gender,
        birthdate,
        province,
        city,
        district,
        deviceFingerprint
      };
      
      // 检查所有必要参数
      if (!data.name || !data.gender || !data.birthdate || !data.province || !data.city || !data.district || !data.deviceFingerprint) {
        console.error('缺少必要参数:', data);
        showToast('表单数据不完整，请检查所有字段', 'bottom');
        setLoading(false);
        return;
      }
      
      // 发送预测请求
      console.log('发送预测请求，数据:', JSON.stringify(data));
      const response = await fetch('/api/mahjong-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      // 关闭加载提示（无论成功失败）
      document.querySelectorAll('[data-toast-loading="true"]').forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      
      console.log('接口响应状态:', response.status, response.statusText);
      
      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        console.error('接口返回错误:', response.status, errorText);
        
        // 特别处理 429 状态码（达到最大测算次数）
        if (response.status === 429) {
          try {
            // 尝试解析错误响应为 JSON
            const errorJson = JSON.parse(errorText);
            console.log('显示最大测算次数提示');
            showToast(errorJson.message || '您今日已达到最大测算次数，请明天再来', 'center', 3000);
          } catch {
            // 如果解析失败，显示默认消息
            console.log('显示默认最大测算次数提示');
            showToast('您今日已达到最大测算次数，请明天再来', 'center', 3000);
          }
          setLoading(false);
          return;
        }
        
        throw new Error(`接口返回错误: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log('接口返回数据:', result);
      
      if (result.success) {
        // 直接跳转到结果页面
        router.push(`/result?id=${result.data.id}`);
      } else {
        // 处理其他错误情况
        showToast(result.message || '预测失败，请重试', 'bottom');
      }
    } catch (error) {
      console.error('预测请求失败:', error);
      const errorMessage = error instanceof Error ? error.message : '网络错误，请稍后再试';
      
      // 检查错误消息中是否包含"最大测算次数"
      if (errorMessage.includes('最大测算次数')) {
        showToast('您今日已达到最大测算次数，请明天再来', 'center', 3000);
      } else {
        showToast(errorMessage, 'bottom');
      }
    } finally {
      setLoading(false);
      
      // 确保关闭加载提示
      document.querySelectorAll('[data-toast-loading="true"]').forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    }
  };
  
  // 处理日期选择
  const handleDateSelect = (val: Date) => {
    setBirthDateValue(val);
    form.setFieldValue('birthDateTime', val);
    setDatePickerVisible(false);
  };
  
  // 处理地区选择
  const handleAreaSelect = (val: CascaderValue[]) => {
    setSelectedArea(val);
    form.setFieldValue('area', val);
    setAreaPickerVisible(false);
  };
  
  // 格式化显示选择的地区
  const formatSelectedArea = () => {
    if (selectedArea.length === 0) return '请选择省市区';
    
    const formattedArea = selectedArea.map((code) => {
      if (typeof code !== 'string') return '';
      
      return getAreaNameByCode(code);
    }).filter(Boolean);
    
    return formattedArea.join(' - ');
  };
  
  return (
    <div className={styles.predictionForm}>
      <div className={styles.formCard}>
        <h2 className={styles.cardTitle}>麻将方位预测</h2>
        
        <Form
          layout="vertical"
          onFinish={onFinish}
          form={form}
          className={styles.form}
          initialValues={{
            name: '',
            gender: 'male',
            birthDateTime: undefined,
            area: []
          }}
        >
          <Form.Item
            name="name"
            label="姓名"
            className={styles.formItem}
            rules={[
              { required: true, message: '请输入姓名' },
              { min: 2, message: '姓名至少需要2个字' },
              { max: 10, message: '姓名不能超过10个字' },
              { 
                validator: (_, value) => {
                  if (value && !validateChineseName(value)) {
                    return Promise.reject('姓名只能包含中文字符');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input 
              placeholder="请输入您的姓名（仅限中文）" 
              className={styles.input}
              value={nameValue}
              onChange={handleNameChange}
              maxLength={10}
            />
          </Form.Item>
          
          <Form.Item
            name="gender"
            label="性别"
            className={styles.formItem}
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Radio.Group 
              value={genderValue} 
              onChange={handleGenderChange}
            >
              <div className={styles.radioButtons}>
                <Radio value="male" className={styles.radioButton}>男</Radio>
                <Radio value="female" className={styles.radioButton}>女</Radio>
              </div>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="birthDateTime"
            label="出生日期时间"
            className={styles.formItem}
            rules={[{ required: true, message: '请选择出生日期时间' }]}
          >
            <div 
              className={styles.datePicker} 
              onClick={() => setDatePickerVisible(true)}
            >
              <span className={styles.datePickerText}>
                {birthDateValue ? birthDateValue.toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }) : '请选择出生日期时间'}
              </span>
            </div>
          </Form.Item>
          
          <Form.Item
            name="area"
            label="出生地区"
            className={styles.formItem}
            rules={[{ required: true, message: '请选择出生地区' }]}
          >
            <div 
              className={styles.datePicker}
              onClick={() => setAreaPickerVisible(true)}
            >
              <span className={styles.datePickerText}>
                {formatSelectedArea()}
              </span>
            </div>
          </Form.Item>
          
          <Button 
            block 
            type="submit" 
            loading={loading}
            className={styles.submitButton}
          >
            {loading ? '正在预测中...' : '开始预测'}
          </Button>
          
          {loading && (
            <div className={styles.loadingTip}>
              <SpinLoading color='primary' />
              <p>正在生成预测结果，请耐心等待（约需1分钟）...</p>
            </div>
          )}
        </Form>
      </div>
      
      <DatePicker
        visible={datePickerVisible}
        precision="minute"
        value={birthDateValue || new Date(1997, 1, 19, 14, 5, 0)}
        min={new Date(1900, 0, 1)}
        max={new Date()}
        onClose={() => setDatePickerVisible(false)}
        onConfirm={handleDateSelect}
        title="选择出生日期时间"
        renderLabel={(type, data) => {
          switch (type) {
            case 'year': return data + '年';
            case 'month': return data + '月';
            case 'day': return data + '日';
            case 'hour': return data + '时';
            case 'minute': return data + '分';
            default: return data;
          }
        }}
      />
      
      <Cascader
        options={areaList}
        visible={areaPickerVisible}
        onClose={() => setAreaPickerVisible(false)}
        onConfirm={handleAreaSelect}
        onSelect={(val, extend) => {
          console.log('级联选择:', val, extend);
          // 不要在onSelect中立即关闭，让用户可以继续选择下一级
          if (val.length === 3) {
            // 当选择到第三级（区/县）时，才自动确认并关闭
            handleAreaSelect(val);
          }
        }}
        title="选择出生地区"
        placeholder="请选择"
      />
    </div>
  );
} 