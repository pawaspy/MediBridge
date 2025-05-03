import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000', // Updated to match the backend server port
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor for logging and adding auth tokens
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for common error handling
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

export default instance; 