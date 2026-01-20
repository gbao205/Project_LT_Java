import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { 
  X, Check, Star, Users, FileText, Layout, 
  Eye, Download, Clock, AlertCircle, Save, ChevronRight 
} from 'lucide-react';

// --- INTERFACES ---
interface StudentDTO {
  id: number;
  fullName: string;
  email: string;
  code?: string;
}

interface TeamMemberDTO {
  id: number;
  student: StudentDTO;
  role: 'LEADER' | 'MEMBER';
  finalGrade?: number; // Điểm tổng kết
}

// Interface cho bài tập và bài làm của sinh viên
interface StudentAssignmentDTO {
  id: number; // Assignment ID
  title: string;
  description: string; // Đề bài giáo viên gửi
  deadline: string;
  status: 'SUBMITTED' | 'LATE' | 'MISSING' | 'PENDING';
  submissionDate?: string;
  submissionFile?: string; // Link bài làm
  score?: number; // Điểm của bài này
  feedback?: string;
}

const TeamDetail: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();

  // --- STATE DỮ LIỆU ---
  const [members, setMembers] = useState<TeamMemberDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- STATE UI & MODAL ---
  const [selectedMember, setSelectedMember] = useState<TeamMemberDTO | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // State quản lý việc chấm điểm chi tiết
  const [assignments, setAssignments] = useState<StudentAssignmentDTO[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  
  // Form chấm điểm
  const [currentScore, setCurrentScore] = useState('');
  const [currentFeedback, setCurrentFeedback] = useState('');

  // --- FETCH MEMBERS ---
  const fetchTeamMembers = async () => {
    if (!teamId) return;
    setLoading(true);
    try {
        const response = await api.get<TeamMemberDTO[]>(`/teams/${teamId}/members`);
        setMembers(response.data);
    } catch (error) {
        console.error("Lỗi khi tải danh sách thành viên:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [teamId]);

  // --- FETCH ASSIGNMENTS KHI MỞ MODAL ---
  const fetchStudentAssignments = async (studentId: number) => {
    setLoadingAssignments(true);
    try {
        // Gọi API lấy danh sách bài tập kèm trạng thái nộp của sinh viên này
        const response = await api.get(`/lecturer/student-assignments/${studentId}/${teamId}`);
        setAssignments(response.data);
        
        // Mặc định chọn bài đầu tiên
        if (response.data && response.data.length > 0) {
            selectAssignmentForGrading(response.data[0]);
        }
    } catch (error) {
        console.error("Lỗi tải bài tập:", error);
        // Mock data nếu API chưa có (để bạn test UI)
        const mockData: StudentAssignmentDTO[] = [
            {
                id: 1, title: 'Thiết kế Database', description: 'Vẽ ERD và map sang lược đồ quan hệ.', deadline: '2024-02-20',
                status: 'SUBMITTED', submissionDate: '2024-02-19 10:00', submissionFile: 'erd_design.pdf', score: 8.5, feedback: 'Làm tốt'
            },
            {
                id: 2, title: 'Frontend Prototype', description: 'Thiết kế giao diện bằng Figma hoặc React.', deadline: '2024-03-01',
                status: 'MISSING', score: undefined, feedback: ''
            }
        ];
        setAssignments(mockData);
        selectAssignmentForGrading(mockData[0]);
    } finally {
        setLoadingAssignments(false);
    }
  };

  const selectAssignmentForGrading = (asm: StudentAssignmentDTO) => {
      setSelectedAssignmentId(asm.id);
      setCurrentScore(asm.score !== undefined ? asm.score.toString() : '');
      setCurrentFeedback(asm.feedback || '');
  };

  // --- HANDLERS ---
  const openEvaluationModal = (member: TeamMemberDTO) => {
    setSelectedMember(member);
    setShowModal(true);
    fetchStudentAssignments(member.student.id);
  };

  const handleSaveGrade = async () => {
    if (!selectedMember || !selectedAssignmentId) return;

    try {
        const payload = {
            studentId: selectedMember.student.id,
            assignmentId: selectedAssignmentId,
            score: parseFloat(currentScore),
            comment: currentFeedback
        };

        // Gọi API lưu điểm cho bài tập cụ thể
        await api.post('/evaluations/assignment', payload);

        // Cập nhật lại state local để UI phản hồi ngay
        setAssignments(prev => prev.map(a => 
            a.id === selectedAssignmentId 
            ? { ...a, score: parseFloat(currentScore), feedback: currentFeedback } 
            : a
        ));

        alert("Đã lưu điểm thành công!");
    } catch (error) {
        console.error("Lỗi lưu điểm:", error);
        alert("Lỗi khi lưu điểm.");
    }
  };

  const handleFinalize = async (studentId: number) => {
    if (!window.confirm("Chốt điểm tổng kết sẽ dựa trên trung bình các bài tập. Bạn có chắc chắn?")) return;
    try {
        await api.post(`/scores/finalize/${teamId}/${studentId}`);
        alert("Đã chốt điểm tổng kết!");
        fetchTeamMembers();
    } catch (error) {
        console.error("Lỗi chốt điểm:", error);
    }
  };

  const getInitials = (name: string) => name.split(' ').pop()?.[0]?.toUpperCase() || '?';

  // --- HELPER UI ---
  const getStatusBadge = (status: string) => {
      switch (status) {
          case 'SUBMITTED': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-200"><Check className="w-3 h-3"/> Đã nộp</span>;
          case 'LATE': return <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-bold border border-orange-200"><Clock className="w-3 h-3"/> Nộp trễ</span>;
          case 'MISSING': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-200"><AlertCircle className="w-3 h-3"/> Chưa nộp</span>;
          default: return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs">Chưa rõ</span>;
      }
  };

  // --- RENDER ---
  const activeAssignment = assignments.find(a => a.id === selectedAssignmentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 font-sans pb-20">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">CS</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Chi Tiết Nhóm</h1>
              <p className="text-xs text-gray-500 font-medium">Quản lý thành viên & Chấm điểm</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards (Giữ nguyên code cũ của bạn) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             {/* ... Code Stats Cards cũ ... */}
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><Layout className="w-6 h-6 text-blue-600" /></div><div><p className="text-3xl font-bold text-gray-900">{members.length}</p><p className="text-sm text-gray-600 font-medium">Thành viên</p></div></div></div>
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center"><FileText className="w-6 h-6 text-red-600" /></div><div><p className="text-3xl font-bold text-gray-900">Active</p><p className="text-sm text-gray-600 font-medium">Trạng Thái</p></div></div></div>
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-purple-600" /></div><div><p className="text-3xl font-bold text-gray-900">{members.filter(m => m.finalGrade).length}</p><p className="text-sm text-gray-600 font-medium">Đã Chốt Điểm</p></div></div></div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Danh Sách Sinh Viên</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.map((member) => (
              <div key={member.id} className="group bg-slate-50 rounded-2xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                    {getInitials(member.student.fullName)}
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg line-clamp-1">{member.student.fullName}</h4>
                  <p className="text-xs text-gray-500 mb-2">{member.student.code}</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-4 border ${member.role === 'LEADER' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {member.role}
                  </span>

                  {member.finalGrade ? (
                      <div className="text-emerald-600 font-bold text-2xl mb-4">{member.finalGrade}</div>
                  ) : (
                      <div className="text-gray-400 text-sm mb-4 italic">Chưa chốt điểm</div>
                  )}

                  <div className="flex gap-2 w-full mt-auto">
                    <button onClick={() => openEvaluationModal(member)} className="flex-1 bg-white border hover:bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
                      Chấm bài
                    </button>
                    <button onClick={() => handleFinalize(member.student.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
                      Chốt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODAL CHẤM ĐIỂM CHI TIẾT --- */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex justify-between items-center shrink-0">
                <div>
                    <h3 className="text-xl font-bold">Chấm Điểm Bài Tập</h3>
                    <p className="text-blue-200 text-sm">Sinh viên: {selectedMember.student.fullName} ({selectedMember.student.code})</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            {/* Modal Body (Split View) */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* LEFT: List Bài Tập */}
                <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                    <div className="p-4 border-b border-gray-200 font-semibold text-gray-700">Danh sách bài tập</div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loadingAssignments ? (
                            <div className="text-center py-10 text-gray-400">Đang tải...</div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">Chưa có bài tập nào.</div>
                        ) : (
                            assignments.map(asm => (
                                <div 
                                    key={asm.id}
                                    onClick={() => selectAssignmentForGrading(asm)}
                                    className={`p-3 rounded-xl cursor-pointer border transition-all ${
                                        selectedAssignmentId === asm.id 
                                        ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' 
                                        : 'bg-white border-gray-200 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-semibold text-sm line-clamp-1 ${selectedAssignmentId === asm.id ? 'text-blue-700' : 'text-gray-800'}`}>{asm.title}</h4>
                                        {getStatusBadge(asm.status)}
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Deadline: {asm.deadline}</span>
                                        {asm.score !== undefined && <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">{asm.score} đ</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: Chi tiết & Chấm điểm */}
                <div className="w-2/3 flex flex-col bg-white">
                    {activeAssignment ? (
                        <>
                            {/* Khu vực Đề bài & Bài làm */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* 1. Đề bài của giảng viên */}
                                <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <h4 className="text-sm font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4"/> Đề Bài Giáo Viên Gửi
                                    </h4>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{activeAssignment.title}</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{activeAssignment.description}</p>
                                </div>

                                {/* 2. Bài làm của sinh viên */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                                        <Download className="w-4 h-4"/> Bài Làm Sinh Viên
                                    </h4>
                                    
                                    {activeAssignment.status === 'MISSING' ? (
                                        <div className="p-4 border-2 border-dashed border-red-200 bg-red-50 rounded-xl text-center text-red-500">
                                            Sinh viên chưa nộp bài tập này.
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                                            <div>
                                                <p className="font-semibold text-gray-800 mb-1">{activeAssignment.submissionFile || 'Bài làm.zip'}</p>
                                                <p className="text-xs text-gray-500">Nộp lúc: {activeAssignment.submissionDate || 'N/A'}</p>
                                            </div>
                                            <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center gap-2">
                                                <Eye className="w-4 h-4" /> Xem
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Khu vực chấm điểm (Inputs) */}
                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                                        <Star className="w-4 h-4 text-orange-500"/> Đánh Giá & Cho Điểm
                                    </h4>
                                    
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-1/3">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Điểm số (0-10)</label>
                                            <input 
                                                type="number" 
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-lg"
                                                placeholder="0.0"
                                                min="0" max="10" step="0.1"
                                                value={currentScore}
                                                onChange={e => setCurrentScore(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nhận xét chi tiết</label>
                                        <textarea 
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 resize-none"
                                            placeholder="Nhập nhận xét để sinh viên rút kinh nghiệm..."
                                            value={currentFeedback}
                                            onChange={e => setCurrentFeedback(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Action */}
                            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">Đóng</button>
                                <button 
                                    onClick={handleSaveGrade}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Lưu Kết Quả Bài Này
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
                            <Layout className="w-16 h-16 mb-4 opacity-20" />
                            <p>Chọn một bài tập bên trái để chấm điểm.</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeamDetail;