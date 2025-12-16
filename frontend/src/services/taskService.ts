import api from './api';
import { type Task, type CreateTaskRequest, type UpdateStatusRequest, TaskStatus } from '../types/Task';

const TASK_URL = '/tasks';

const taskService = {
    // 1. Lấy danh sách Task theo Team ID
    getTasksByTeam: async (teamId: number): Promise<Task[]> => {
        try {
            const response = await api.get<Task[]>(`${TASK_URL}/team/${teamId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi lấy danh sách task:", error);
            return [];
        }
    },

    // 2. Tạo Task mới
    createTask: async (data: CreateTaskRequest): Promise<Task> => {
        const response = await api.post<Task>(TASK_URL, data);
        return response.data;
    },

    // 3. Cập nhật trạng thái Task (FSM)
    updateTaskStatus: async (taskId: number, newStatus: TaskStatus): Promise<Task> => {
        const payload: UpdateStatusRequest = { newStatus };
        const response = await api.put<Task>(`${TASK_URL}/${taskId}/status`, payload);
        return response.data;
    },

    // 4. Lấy chi tiết Task (nếu cần sau này)
    getTaskById: async (taskId: number): Promise<Task | null> => {
        try {
            const response = await api.get<Task>(`${TASK_URL}/${taskId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }
};

export default taskService;