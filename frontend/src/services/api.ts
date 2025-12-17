import axios from 'axios';

const API_URL = 'https://collabsphere-backend-mk5g.onrender.com/api';
<<<<<<< HEAD
=======
//const API_URL = 'http://localhost:8080/api';
>>>>>>> 581074333974f2ca249aebbbb95ef00dd53af137

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
