// src/services/evaluationService.ts
import api from './api';
import { EvaluationRequest, EvaluationResponse } from '../types/evaluation';

export const evaluationService = {
  // Gửi đánh giá mới
  submitEvaluation: async (data: EvaluationRequest): Promise<EvaluationResponse> => {
    const response = await api.post<EvaluationResponse>('/evaluations', data);
    return response.data;
  },

  // Lấy đánh giá cũ (nếu muốn sửa)
  getEvaluation: async (milestoneId: number, studentId?: number, teamId?: number) => {
    // Logic query params tùy chỉnh theo backend
    const params = { milestoneId, studentId, teamId };
    const response = await api.get<EvaluationResponse>('/evaluations/detail', { params });
    return response.data;
  }
};