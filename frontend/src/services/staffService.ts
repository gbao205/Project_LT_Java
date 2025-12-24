import api from './api';

export const staffService = {
    getAllClasses: () => api.get('/staff/classes'),
    toggleRegistration: (classId: number) => 
        api.patch(`/staff/classes/${classId}/toggle-registration`)
};