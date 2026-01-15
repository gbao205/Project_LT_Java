// frontend/src/services/
// deleteCheckpoint: (id: number) => api.delete(`/api/workspace/checkpoints/${id}`),.ts
import api from './api';

export const workspaceService = {
    // Milestones
    getMilestones: (teamId: number) => api.get(`/workspace/teams/${teamId}/milestones`),

    submitMilestoneAnswer: (teamId: number, milestoneId: number, answer: string, taskIds: number[]) => 
        api.post(`/workspace/teams/${teamId}/milestones/${milestoneId}/answer`, { answer, taskIds}),

    markMilestoneDone: (teamId: number, milestoneId: number) => 
        api.put(`/workspace/teams/${teamId}/milestones/${milestoneId}/complete`),

    // Checkpoints
    getCheckpoints: (teamId: number) => api.get(`/workspace/teams/${teamId}/checkpoints`),
    createCheckpoint: (teamId: number, data: any) => api.post(`/workspace/teams/${teamId}/checkpoints`, data),
    toggleCheckpoint: (checkpointId: number) => api.put(`/workspace/checkpoints/${checkpointId}/toggle`),
    deleteCheckpoint: (id: number) => api.delete(`/workspace/checkpoints/${id}`),

    // Resources
    getResources: (teamId: number) => api.get(`/workspace/teams/${teamId}/resources`),
    uploadResource: (teamId: number, formData: FormData) => 
        api.post(`/workspace/teams/${teamId}/resources`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    deleteResource: (id: number) => api.delete(`/workspace/resources/${id}`),
};