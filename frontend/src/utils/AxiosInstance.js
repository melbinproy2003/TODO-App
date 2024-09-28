import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/user/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to dynamically include the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from local storage before each request
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
