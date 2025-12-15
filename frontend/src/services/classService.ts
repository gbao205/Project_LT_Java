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

// Lấy danh sách lớp kèm trạng thái đăng ký
export const getRegistrationClasses = async () => {
    const res = await api.get('/classes/registration');
    return res.data;
};

// Đăng ký
export const enrollClass = async (classId: number) => {
    const res = await api.post(`/classes/${classId}/enroll`);
    return res.data;
};

// Hủy đăng ký
export const cancelClass = async (classId: number) => {
    const res = await api.post(`/classes/${classId}/cancel`);
    return res.data;
};