import axios from 'axios';

export const BASE_URL = 'https://collabsphere-backend-mk5g.onrender.com';
//export const BASE_URL = 'http://localhost:8080';

const API_URL = `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
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
