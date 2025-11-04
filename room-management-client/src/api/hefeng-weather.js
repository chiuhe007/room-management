import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/weather';

// 获取实时天气
export const getNowWeather = (locationId = '101030100') => {
  return axios.get(`${BASE_URL}/now`, {
    params: { locationId }
  }).then(res => res.data);
};