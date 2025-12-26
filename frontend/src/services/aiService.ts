import api from "./api.ts";

export const aiService = {
    askAI: async (question: string, teamId: number) => {
        const response = await api.post('/ai/chat', { question, teamId });
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/ai/history');
        return response.data;
    },

    clearHistory: async () => {
        const response = await api.delete('/ai/history');
        return response.data;
    },

};