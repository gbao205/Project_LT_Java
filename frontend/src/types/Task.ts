// frontend/src/types/Task.ts

export enum TaskStatus {
    TO_DO = "TO_DO",
    IN_PROGRESS = "IN_PROGRESS",
    REVIEW = "REVIEW",
    DONE = "DONE",
    CANCELED = "CANCELED"
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    dueDate?: string; // ISO Date string
    team: {
        id: number;
        teamName: string;
    };
    assignedTo?: {
        id: number;
        fullName: string;
        email: string;
    };
    milestone?: {
        id: number;
        title: string;
    };
}

// DTO gửi lên khi tạo mới
export interface CreateTaskRequest {
    title: string;
    description?: string;
    teamId: number;
    assignedToId?: number;
    milestoneId?: number;
    dueDate?: string;
}

// DTO gửi lên khi đổi trạng thái
export interface UpdateStatusRequest {
    newStatus: TaskStatus;
}