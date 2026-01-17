import api from './api';

export const staffService = {
    getAllClasses: () => api.get('/staff/classes'),
    toggleRegistration: (classId: number) => 
        api.patch(`/staff/classes/${classId}/toggle-registration`),
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
};