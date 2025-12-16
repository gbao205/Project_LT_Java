import api from './api';

// --- Types ---
export interface CreateTeamRequest {
    teamName: string;
    classId: number;
}

export interface ProjectRegistrationRequest {
    projectName: string;
    description: string;
    existingProjectId?: number | null;
}

export interface Milestone {
    id: number;
    title: string;
    description: string;
    startDate: string;
    dueDate: string;
}

// --- Service ---
const studentService = {
    // 1. Tạo nhóm mới
    createTeam: async (data: CreateTeamRequest) => {
        const response = await api.post('/student/teams', data);
        return response.data;
    },

    // 2. Tham gia nhóm (bằng ID)
    joinTeam: async (teamId: number) => {
        await api.post(`/student/teams/${teamId}/join`);
    },

    // 3. Đăng ký đề tài (Cho Leader)
    registerProject: async (data: ProjectRegistrationRequest) => {
        const response = await api.post('/student/project/register', data);
        return response.data;
    },

    // 4. Xem Milestone của lớp
    getClassMilestones: async (classId: number): Promise<Milestone[]> => {
        const response = await api.get<Milestone[]>(`/student/classes/${classId}/milestones`);
        return response.data;
    }
};

export default studentService;