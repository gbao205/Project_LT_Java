import axios from 'axios';

// Tạo instance axios chung
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Tự động thêm Token vào mỗi request nếu có
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;