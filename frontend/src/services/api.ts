import axios from 'axios';

// Tự động nhận diện môi trường
// Nếu có biến môi trường VITE_API_URL thì dùng nó, không thì dùng localhost
const API_URL = 'https://collabsphere-be.onrender.com/api';

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