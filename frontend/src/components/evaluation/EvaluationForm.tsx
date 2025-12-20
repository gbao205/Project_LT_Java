// frontend/src/components/evaluation/EvaluationForm.tsx

import React, { useState } from 'react';
import api from '../../services/api'; // Đảm bảo bạn đã có file api.ts

interface EvaluationFormProps {
  milestoneId: number;
  targetName: string; // Tên sinh viên hoặc tên nhóm
  studentId?: number; // Truyền vào nếu chấm sinh viên
  teamId?: number;    // Truyền vào nếu chấm nhóm
  onSuccess: () => void; // Callback khi chấm xong
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
  const [score, setScore] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Regex chỉ cho nhập số và dấu chấm (số thập phân)
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      if (Number(value) > 10) return; // Không cho nhập quá 10
      setScore(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (score === '') {
      setError('Vui lòng nhập điểm số.');
      return;
    }

    setIsLoading(true);

    // Payload gửi xuống Backend
    const payload = {
      score: parseFloat(score),
      comment: comment,
      milestoneId,
      studentId,
      teamId,
      // Tự động xác định loại đánh giá dựa trên việc có studentId hay không
      type: studentId ? 'INDIVIDUAL_TASK' : 'TEAM_MILESTONE' // Hoặc PEER_REVIEW tùy logic
    };

    try {
        // Gọi API tạo đánh giá (Evaluation)
        // Lưu ý: Đảm bảo Backend có endpoint POST /api/evaluations
      await api.post('/evaluations', payload);
      alert('Đánh giá thành công!');
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError('Có lỗi xảy ra khi lưu đánh giá. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Đánh giá: <span className="text-blue-600">{targetName}</span>
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Điểm số (0 - 10)
          </label>
          <input
            type="text" // Dùng text để handle regex tốt hơn
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="VD: 8.5"
            value={score}
            onChange={handleScoreChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhận xét & Góp ý
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 h-24"
            placeholder="Nhập nhận xét chi tiết..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

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
            {isLoading ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvaluationForm;