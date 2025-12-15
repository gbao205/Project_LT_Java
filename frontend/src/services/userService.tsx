import api from './api';

// Hàm lấy danh sách users
export const getAllUsers = async (keyword: string = "") => {
    // Gọi API: /api/users?search=...
    const url = keyword ? `/users?search=${keyword}` : '/users';
    return api.get(url);
};

// Hàm khóa/mở khóa user
export const toggleUserStatus = async (id: number) => {
    // Gọi API: /api/users/{id}/status
    return api.put(`/users/${id}/status`);
};

// Tạo user (Gọi API Register có sẵn)
export const createUser = async (userData: any) => {
    return api.post('/auth/register', userData);
};

// Cập nhật thông tin user (Tên, Email, Role...)
export const updateUser = async (id: number, data: any) => {
    return api.put(`/users/${id}`, data);
};

// Reset mật khẩu (Admin đổi pass cho user)
export const resetUserPassword = async (id: number, password: string) => {
    return api.put(`/users/${id}/reset-password`, { password });
};

// Hàm xóa user
export const deleteUser = async (id: number) => {
    return api.delete(`/users/${id}`);
};