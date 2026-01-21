import api from './api';

export const staffService = {
    // ======================== CLASS & TIMETABLE ========================
    getAllClasses: () => api.get('/staff/classes'),
    
    status: (classId: number) => 
        api.patch(`/staff/classes/${classId}/status`),
    
    getClasses: (params: {
        page: number;
        size: number;
        id?: number;
        classCode?: string;
        name?: string;
        semester?: string;
        subjectName?: string;
        lecturerName?: string;
        isRegistrationOpen?: boolean;
    }) => api.get('/staff/classes', { params }),

    getClassTimeTable: (classCode: string) => 
        api.get(`/staff/classes/${classCode}/timetable`),

    updateClassDates: (classCode: string, data: { startDate: string }) => 
        api.patch(`/staff/classes/${classCode}/dates`, data),

    // ======================== SUBJECTS (MÔN HỌC) ========================
    // ĐÃ THÊM: Cập nhật môn học theo subjectCode
    updateSubject: (subjectCode: string, data: { name: string; specialization: string }) => 
        api.patch(`/staff/subjects/${subjectCode}`, data),

    // ======================== IMPORT HÀNG LOẠT ========================
    importUser: (formData: FormData) => 
        api.post('/staff/import-user', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    importClass: (formData: FormData) => 
        api.post('/staff/import-classes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    importSubject: (formData: FormData) => 
        api.post('/staff/import-subject', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    importSyllabus: (formData: FormData) => 
        api.post('/staff/import-syllabus', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }), 

    importTimeTable: (formData: FormData) => 
        api.post("/staff/import-timetable", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    // ======================== GÁN NHÂN SỰ & SINH VIÊN ========================
    searchUsers: (search?: string) => 
        api.get('/staff/search-user', { params: { search } }),

    assignLecturer: (classCode: string, cccd: string) => 
        api.patch(`/staff/classes/${classCode}/assign-lecturer-cccd/${cccd}`),

    assignStudents: (classCode: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post(`/staff/classes/${classCode}/assign-students`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    getStudentsInClass: (classCode: string) => 
        api.get(`/staff/classes/${classCode}/students`),
    // ======================== STUDENTS (MỚI TÁCH) ========================
    getStudents: (params: { page: number; size: number; keyword?: string }) => 
        api.get('/staff/students', { params }),

    getStudentDetail: (id: number) => 
        api.get(`/staff/students/${id}`),

    // ======================== LECTURERS (MỚI TÁCH) ========================
    getLecturers: (params: { page: number; size: number; keyword?: string }) => 
        api.get('/staff/lecturers', { params }),
};