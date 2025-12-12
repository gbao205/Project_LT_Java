import axios from 'axios';

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

export const loginUser = async (data: LoginRequest): Promise<LoginResponse | null> => {
    try {
        const response = await axios.post(`${API_URL}/login`, data);
        if (response.data.token) {
            // Lưu token vào LocalStorage để dùng cho các request sau
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};