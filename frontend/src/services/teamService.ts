import api from './api';

const teamService = {
    // Lấy thành viên của 1 nhóm [Khớp TeamController.java]
    getTeamMembers: async (teamId: number) => {
        const response = await api.get(`/teams/${teamId}/members`);
        return response.data;
    }
};

export default teamService;