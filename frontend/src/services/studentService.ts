import api from './api';

// --- Types ---
export interface CreateTeamRequest {
    teamName: string;
    classId: number;
    memberIds?: number[];
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

export interface StudentProfileData {
    gender?: string;
    nativePlace?: string;
    ethnicity?: string;
    religion?: string;
    nationality?: string;
    unionDate?: string;
    partyDate?: string;
    phoneNumber?: string;
    idCardNumber?: string;
    idCardIssueDate?: string;
    idCardExpiryDate?: string;
    idCardIssuePlace?: string;
    insuranceCode?: string;
    placeOfBirth?: string;
    homeTown?: string;
    permanentAddress?: string;
    temporaryAddress?: string;
}

export interface Student {
    id: number;
    user: {
        id: number;
        email: string;
        fullName: string;
    };
    studentId: string;
    eduLevel: string;
    batch: string;
    dob: string;
    trainingType: string;
    admissionDate: string;
    studentStatus: string;
    faculty: string;
    major: string;
    specialization: string;
    profile: StudentProfileData;
}

// --- Service ---
const studentService = {

    // Lấy thông tin hồ sơ hiện tại
    getProfile: async (): Promise<Student> => {
        const response = await api.get<Student>('/student/profile');
        return response.data;
    },

    // Cập nhật hồ sơ sinh viên
    updateProfile: async (data: Student) => {
        const response = await api.put<Student>('/student/profile', data);
        return response.data;
    },

    // Tạo nhóm mới
    createTeam: async (data: { teamName: string, classId: number }) => {
        return api.post('/student/teams/create', data);
    },

    getStudentsNoTeam: async (classId: string | number) => {
        const res = await api.get(`/student/classes/${classId}/students-no-team`);
        return res.data;
    },

    // Tham gia nhóm (bằng ID)
     joinTeam: async (data: { teamId: number }) => {
        return api.post('/student/teams/join', data);
    },

    // Đăng ký đề tài (Cho Leader)
    registerProject: async (data: ProjectRegistrationRequest) => {
        const response = await api.post('/student/project/register', data);
        return response.data;
    },

    // API Chuyển quyền Leader
    assignLeader: async (data: { teamId: number, newLeaderId: number }) => {
        return api.post('/student/teams/assign-leader', data);
    },

    // API Rời nhóm
    leaveTeam: async (data: { teamId: number }) => {
        return api.post('/student/teams/leave', data);
    },

    // Xem Milestone của lớp
    getClassMilestones: async (classId: number): Promise<Milestone[]> => {
        const response = await api.get<Milestone[]>(`/student/classes/${classId}/milestones`);
        return response.data;
    },

    // Lấy thông tin nhóm của sinh viên trong lớp
    getMyTeam: async (classId: string) => {
        const res = await api.get(`/student/classes/${classId}/my-team`);
        return res.data;
    },
    
    // Lấy danh sách các nhóm trong lớp
    getTeamsInClass: async (classId: string) => {
        const res = await api.get(`/student/classes/${classId}/teams`);
        return res.data;
    },
};

export default studentService;
