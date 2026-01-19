import api from './api';

export const staffService = {
    getAllClasses: () => api.get('/staff/classes'),
    status: (classId: number) => 
        api.patch(`/staff/classes/${classId}/status`),
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
    searchUsers: (search?: string) => 
        api.get('/staff/search-user', { params: { search } }),
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
};