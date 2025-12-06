// @ts-ignore
import axios from 'axios';
import type {Subject} from '../types/Subject';

// Địa chỉ của Backend (Port 8080)
const API_URL = 'http://localhost:8080/api/subjects';

export const getSubjects = async (): Promise<Subject[]> => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Lỗi gọi API:", error);
        return [];
    }
};