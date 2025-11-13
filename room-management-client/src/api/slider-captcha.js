import request from './index.js';

/**
 * 获取滑块验证码
 * @returns {Promise} 验证码数据
 */
export const getSliderCaptcha = () => {
  console.log('🎯 请求滑块验证码...');
  
  return request({
    url: '/captcha/slider',
    method: 'GET'
  }).then(data => {
    console.log('📸 验证码数据:', {
      success: data.success,
      captchaId: data.captchaId,
      backgroundLength: data.backgroundImage?.length,
      sliderLength: data.sliderImage?.length
    });
    return data;
  }).catch(error => {
    console.error('❌ 获取验证码失败:', error);
    throw error;
  });
};

/**
 * 验证滑块验证码
 * @param {Object} data - 验证数据
 * @param {string} data.captchaId - 验证码ID
 * @param {number} data.slideX - 滑动距离
 * @returns {Promise} 验证结果
 */
export const verifySliderCaptcha = (data) => {
  console.log('🔍 验证滑块验证码:', data);
  
  return request({
    url: '/captcha/verify',
    method: 'POST',
    data
  }).then(result => {
    console.log('✅ 验证结果:', result);
    return result;
  }).catch(error => {
    console.error('❌ 验证失败:', error);
    throw error;
  });
};