import api from './api';

// Kiểu dữ liệu gửi lên
export interface LoginRequest {
    email: string;
    password: string;
}

// Kiểu dữ liệu trả về
export interface LoginResponse {
    token: string;
    id: number;
    email: string;
    fullName: string;
    role: string;
}

// Hàm Đăng nhập
export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
    try {
        // Sử dụng 'api' đã cấu hình sẵn link Render bên api.ts
        const response = await api.post('/auth/login', data);

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
export const changePassword = async (data: any) => {
    return api.post('/auth/change-password', data);
};