import api from './api';

const chatService = {
    // --- LẤY LỊCH SỬ CHAT NHÓM ---
    getChatHistory: async (teamId: number) => {
        const response = await api.get(`/chat/history/${teamId}`);
        return response.data;
    },

    // --- XÓA TOÀN BỘ CHAT NHÓM ---
    clearChat: async (teamId: number) => {
        return await api.delete(`/chat/clear/${teamId}`);
    }
};

export default chatService;