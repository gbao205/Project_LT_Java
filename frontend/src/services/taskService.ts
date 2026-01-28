import api from './api';
import { type Task, type CreateTaskRequest, type UpdateStatusRequest, TaskStatus } from '../types/Task';

const TASK_URL = '/tasks';

const taskService = {
    // Lấy danh sách Task theo Team ID
    getTasksByTeam: async (teamId: number): Promise<Task[]> => {
        try {
            const response = await api.get<Task[]>(`${TASK_URL}/team/${teamId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi lấy danh sách task:", error);
            return [];
        }
    },

    // Tạo Task mới
    createTask: async (data: CreateTaskRequest): Promise<Task> => {
        const response = await api.post<Task>('/tasks', data);
        return response.data;
    },

    // Cập nhật trạng thái Task (FSM)
    updateTaskStatus: async (taskId: number, newStatus: TaskStatus): Promise<Task> => {
        const response = await api.put<Task>(`/tasks/${taskId}/status`, { newStatus });
        return response.data;
    },

    // Lấy chi tiết Task (nếu cần sau này)
    getTaskById: async (taskId: number): Promise<Task | null> => {
        try {
            const response = await api.get<Task>(`${TASK_URL}/${taskId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },

    // Xóa Task theo ID
    deleteTask: async (taskId: number): Promise<void> => {
        try {
            // Gọi API Delete đã định nghĩa ở Backend
            await api.delete(`${TASK_URL}/${taskId}`);
        } catch (error) {
            console.error("Lỗi khi xóa nhiệm vụ:", error);
            throw error; // Ném lỗi để UI (Component) xử lý hiển thị thông báo
        }
    },

    // gán task cho người khác
    updateTask: async (taskId: number, data: Partial<CreateTaskRequest>): Promise<Task> => {
        try {
            const response = await api.put<Task>(`${TASK_URL}/${taskId}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật nhiệm vụ:", error);
            throw error;
        }
    },

    // lấy task chưa hoàn thành
    getMyTaskCount: async () => {
        const response = await api.get(`${TASK_URL}/student/count-active`);
        return response.data;
    },
};

export default taskService;