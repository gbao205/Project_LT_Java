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