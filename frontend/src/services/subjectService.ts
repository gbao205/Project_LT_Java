import axios from 'axios';
import type { Subject } from '../types/Subject';

const API_URL = 'http://localhost:8080/api/subjects';

// Tạo instance axios có kèm token
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- HÀM 1: Lấy danh sách ---
export const getSubjects = async (): Promise<Subject[]> => {
    try {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Lỗi gọi API:", error);
        return [];
    }
};

// --- HÀM 2: Tạo mới (Phải nằm ngoài hàm 1) ---
export const createSubject = async (subject: Omit<Subject, 'id'>): Promise<Subject | null> => {
    try {
        const response = await axiosInstance.post(API_URL, subject);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo môn học:", error);
        return null;
    }
};