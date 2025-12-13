import api from './api';

export interface ClassRoom {
    id: number;
    name: string;
    semester: string;
    subject: {
        id: number;
        name: string;
        subjectCode: string;
    };
    lecturer: {
        id: number;
        fullName: string;
        email: string;
    };
}

// Lấy danh sách lớp
export const getAllClasses = async () => {
    const res = await api.get('/classes');
    return res.data;
};

// Tạo lớp mới
export const createClass = async (data: { name: string; semester: string; subjectId: number; lecturerId: number }) => {
    const res = await api.post('/classes', data);
    return res.data;
};