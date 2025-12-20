// src/types/evaluation.ts

export interface EvaluationRequest {
  score: number;        // Backend nhận BigDecimal, ta gửi number hoặc string
  comment: string;
  studentId?: number;   // ID sinh viên (nếu chấm cá nhân)
  teamId?: number;      // ID team (nếu chấm nhóm)
  milestoneId: number;  // Chấm cho cột mốc nào
  type: 'TEAM_MILESTONE' | 'INDIVIDUAL_TASK';
}

export interface EvaluationResponse {
  id: number;
  score: number;
  comment: string;
  graderName: string;
}