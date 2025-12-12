import axios from 'axios';
import api from './api';
const API_URL = 'http://localhost:8080/api/auth';

// Kiểu dữ liệu gửi lên
export interface LoginRequest {
    email: string;
    password: string;
}

// Kiểu dữ liệu trả về
export interface LoginResponse {
    token: string;
    email: string;
    fullName: string;
    role: string;
}

// Hàm Đăng nhập
export const loginUser = async (data: LoginRequest): Promise<LoginResponse | null> => {
    try {
        // Login không cần Token nên dùng axios thường
        const response = await axios.post(`${API_URL}/login`, data);

        if (response.data.token) {
            // Lưu token và thông tin user vào LocalStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        throw error;
    }
};

// Hàm Đăng xuất
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Hàm Đổi mật khẩu
// Sử dụng 'api' từ file api.ts để tự động đính kèm Token vào Header
export const changePassword = async (data: any) => {
    return api.post('/auth/change-password', data);
};