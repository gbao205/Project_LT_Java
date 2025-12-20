// src/components/evaluation/EvaluationForm.tsx

import React, { useState, useEffect } from 'react';
import { evaluationService } from '../../services/evaluationService';
import { EvaluationRequest } from '../../types/evaluation';

interface EvaluationFormProps {
  milestoneId: number;
  targetName: string; // Tên sinh viên hoặc tên nhóm
  studentId?: number; // Truyền vào nếu chấm sinh viên
  teamId?: number;    // Truyền vào nếu chấm nhóm
  onSuccess: () => void; // Callback khi chấm xong để reload lại danh sách bên ngoài
  onCancel: () => void;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  milestoneId,
  targetName,
  studentId,
  teamId,
  onSuccess,
  onCancel
}) => {
  // --- STATE MANAGEMENT ---
  // 1. Form State (Controlled Components)
  const [score, setScore] = useState<string>(''); // Dùng string để xử lý trường hợp input rỗng dễ hơn
  const [comment, setComment] = useState<string>('');

  // 2. UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- HANDLERS ---

  // Xử lý thay đổi điểm số (Validation logic)
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Regex cho phép số thực dương
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      // Chặn nếu số lớn hơn 10
      if (Number(value) > 10) return;
      setScore(value);
    }
  };

  // Xử lý Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn reload trang
    setError(null);

    // Validate cơ bản
    if (score === '') {
      setError('Vui lòng nhập điểm số.');
      return;
    }

    setIsLoading(true);

    const payload: EvaluationRequest = {
      score: parseFloat(score),
      comment: comment,
      milestoneId,
      studentId,
      teamId,
      type: teamId ? 'TEAM_MILESTONE' : 'INDIVIDUAL_TASK'
    };

    try {
      await evaluationService.submitEvaluation(payload);
      // Reset form hoặc thông báo thành công
      alert('Đánh giá thành công!');
      onSuccess(); // Gọi callback để component cha cập nhật lại UI
    } catch (err: any) {
      console.error(err);
      setError('Có lỗi xảy ra khi lưu đánh giá. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Đánh giá: <span className="text-blue-600">{targetName}</span>
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* CONTROLLED COMPONENT: Input Score */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Điểm số (0 - 10)
          </label>
          <input
            type="number"
            step="0.01" // Cho phép nhập số lẻ
            min="0"
            max="10"
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="VD: 8.5"
            value={score}
            onChange={handleScoreChange}
            required
          />
        </div>

        {/* CONTROLLED COMPONENT: Textarea Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhận xét & Góp ý
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 h-24"
            placeholder="Nhập nhận xét chi tiết về bài làm..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
            disabled={isLoading}
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            className={`px-4 py-2 text-white rounded transition ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Đang lưu...' : 'Xác nhận chấm điểm'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvaluationForm;