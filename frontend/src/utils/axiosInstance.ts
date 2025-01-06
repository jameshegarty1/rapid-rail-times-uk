// axiosInstance.ts
import axios from 'axios';
//baseURL: import.meta.env.REACT_APP_API_URL,

// Set the base URL for the API
const axiosInstance = axios.create({
    // todo: change the name from REACT_APP
    baseURL: "http://localhost:8000"
});

console.log(axiosInstance);

// Add a request interceptor to include the token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {}; // Ensure headers is an object
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`Sending request to: ${fullUrl}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

