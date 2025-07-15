import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://storesync-backend1.onrender.com/api', // Change if backend runs elsewhere
});

// Add a request interceptor to include the token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance; 
