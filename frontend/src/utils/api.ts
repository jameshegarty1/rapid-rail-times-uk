import axios from 'axios';
import { BACKEND_URL } from '../config';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
});

// Add a request interceptor to include the token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {}; // Ensure headers is an object
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

