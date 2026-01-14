import api from './api';
import type { Subject } from '../types/Subject';

// --- HÀM 1: Lấy danh sách ---
export const getSubjects = async (): Promise<Subject[]> => {
    try {
        // Gọi thẳng api.get, nó sẽ tự nối với link Render
        const response = await api.get('/subject');
        return response.data;
    } catch (error) {
        console.error("Lỗi gọi API:", error);
        return [];
    }
};

// --- HÀM 2: Tạo mới ---
export const createSubject = async (subject: Omit<Subject, 'id'>): Promise<Subject | null> => {
    try {
        const response = await api.post('/subjects', subject);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo môn học:", error);
        return null;
    }
};
// Sửa môn học - Gọi đến endpoint của Staff
export const updateSubject = async (id: number, data: Subject) => {
    try {
        const response = await api.put(`/staff/subjects/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật môn học:", error);
        throw error;
    }
};

// Xóa môn học - Gọi đến endpoint của Staff
export const deleteSubject = async (id: number) => {
    try {
        const response = await api.delete(`/staff/subjects/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa môn học:", error);
        throw error;
    }
};

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const getStaffSubjects = async (
  page = 0,
  size = 5
): Promise<PageResponse<Subject>> => {
  try {
    const response = await api.get('/staff/subject', {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi gọi API staff:", error);
    throw error;
  }
};