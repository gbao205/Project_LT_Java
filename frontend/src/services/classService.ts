import api from './api';

export interface TimeTable {
    id: number;
    dayOfWeek: number;
    slot: number;
    room: string;
    weeks: string;
}

export interface ClassRoom {
    id: number;
    name: string;
    classCode: string;
    semester: string;
    startDate: string;
    endDate: string;
    maxCapacity: number;
    currentEnrollment?: number;
    isRegistered?: boolean;
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
    timeTables?: TimeTable[];
    isRegistrationOpen?: boolean;
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

// Lấy danh sách lớp đã đăng ký của User hiện tại
export const getMyClasses = async () => {
    const res = await api.get('/classes/my-classes');
    return res.data;
};

// Lấy chi tiết lớp
export const getClassDetails = async (classId: string) => {
    const res = await api.get(`/classes/${classId}/details`);
    return res.data;
};

// Tạo tài liệu mới
export const createMaterial = async (classId: string, data: any) => {
    return api.post(`/classes/${classId}/materials`, data);
};

// Tạo bài tập mới
export const createAssignment = async (classId: string, data: any) => {
    return api.post(`/classes/${classId}/assignments`, data);
};

// Nộp bài tập
export const submitAssignment = async (assignmentId: number, data: any) => {
    return api.post(`/classes/assignments/${assignmentId}/submit`, data);
};