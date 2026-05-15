
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});


export const predictSign = async (imageBase64) => {
  const response = await api.post('/predict', { image: imageBase64 });
  return response.data;
};

export default api;