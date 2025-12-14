import api from './api';
import type { Subject } from '../types/Subject';

// --- HÀM 1: Lấy danh sách ---
export const getSubjects = async (): Promise<Subject[]> => {
    try {
        // Gọi thẳng api.get, nó sẽ tự nối với link Render
        const response = await api.get('/subjects');
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