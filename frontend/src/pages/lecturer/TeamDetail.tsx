import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api'; // Đảm bảo import này hoạt động
import { X, Check, Star, Trophy, Users, FileText, Layout } from 'lucide-react';

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
  finalGrade?: number;
}

const TeamDetail: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();

  // --- STATE DỮ LIỆU ---
  const [members, setMembers] = useState<TeamMemberDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- STATE UI & MODAL ---
  const [selectedMember, setSelectedMember] = useState<TeamMemberDTO | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');

  // --- STATE EASTER EGG ---
  const [konamiProgress, setKonamiProgress] = useState(0);
  const [easterEggActive, setEasterEggActive] = useState(false);
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  // --- LOGIC EASTER EGG ---
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiProgress]) {
        const newProgress = konamiProgress + 1;
        setKonamiProgress(newProgress);
        if (newProgress === konamiCode.length) {
          activateEasterEgg();
          setKonamiProgress(0);
        }
      } else {
        setKonamiProgress(0);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [konamiProgress]);

  const activateEasterEgg = () => {
    setEasterEggActive(true);
    setTimeout(() => setEasterEggActive(false), 5000);
  };

  // --- FETCH DATA (GỌI API THẬT) ---
  const fetchTeamMembers = async () => {
    if (!teamId) return;
    setLoading(true);

    try {
        // GỌI API THẬT TỪ BACKEND
        const response = await api.get<TeamMemberDTO[]>(`/teams/${teamId}/members`);
        setMembers(response.data);
    } catch (error) {
        console.error("Lỗi khi tải danh sách thành viên:", error);
        // Có thể thêm thông báo lỗi UI ở đây nếu cần
    } finally {
        setLoading(false);
    }

    // --- ĐÃ COMMENT DỮ LIỆU ẢO ---
    /*
    setTimeout(() => {
      setMembers([ ...mock data cũ... ]);
      setLoading(false);
    }, 800);
    */
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [teamId]);

  // --- HANDLERS ---
  const openEvaluationForm = (member: TeamMemberDTO) => {
    setSelectedMember(member);
    setShowModal(true);
    setScore('');
    setComment('');
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 10)) {
      setScore(value);
    }
  };

  // Xử lý gửi điểm (GỌI API THẬT)
  const handleSubmit = async () => {
    if (!selectedMember || !teamId) return;

    try {
        const payload = {
            score: parseFloat(score),
            comment: comment,
            milestoneId: 1, // Lưu ý: Đang để cứng là 1, sau này cần lấy động từ UI
            studentId: selectedMember.student.id,
            teamId: Number(teamId),
            type: 'INDIVIDUAL_TASK' // Hoặc loại đánh giá phù hợp logic backend
        };

        // GỌI API LƯU ĐIỂM
        await api.post('/evaluations', payload);

        alert("Đã lưu đánh giá thành công!");
        setShowModal(false);
        fetchTeamMembers(); // Reload lại danh sách để cập nhật trạng thái

    } catch (error) {
        console.error("Lỗi khi lưu đánh giá:", error);
        alert("Có lỗi xảy ra khi lưu đánh giá. Vui lòng thử lại.");
    }
  };

  // Xử lý chốt điểm (GỌI API THẬT)
  const handleFinalize = async (studentId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn chốt điểm? Điểm sẽ không thể thay đổi.")) return;

    try {
        // GỌI API CHỐT ĐIỂM
        await api.post(`/scores/finalize/${teamId}/${studentId}`);

        alert("Đã chốt điểm thành công!");
        fetchTeamMembers(); // Reload lại danh sách để hiện điểm xanh lá cây
    } catch (error) {
        console.error("Lỗi khi chốt điểm:", error);
        alert("Có lỗi xảy ra khi chốt điểm.");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').pop()?.[0]?.toUpperCase() || '?';
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 font-sans">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
              CS
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">CollabSphere</h1>
              <p className="text-xs text-gray-500 font-medium">Giảng viên Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
               <p className="text-sm font-semibold text-gray-700">Giảng Viên</p>
               <p className="text-xs text-gray-400">admin@cosre.edu</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md cursor-pointer hover:scale-105 transition-transform">
              GV
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-extrabold text-blue-900 mb-6 flex items-center gap-2">
            Khu Vực Quản Lý
            <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border">Nhóm {teamId}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Layout className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{members.length}</p>
                <p className="text-sm text-gray-600 font-medium">Thành viên</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">1</p>
                <p className="text-sm text-gray-600 font-medium">Milestone Hiện Tại</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                    {members.filter(m => m.finalGrade !== undefined && m.finalGrade !== null).length}/{members.length}
                </p>
                <p className="text-sm text-gray-600 font-medium">Đã Chốt Điểm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Cards Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-gray-900">Danh Sách Sinh Viên</h3>
             <button onClick={fetchTeamMembers} className="text-sm text-blue-600 hover:underline">Làm mới dữ liệu</button>
          </div>

          {loading ? (
             <div className="text-center py-10 text-gray-500">Đang tải dữ liệu từ máy chủ...</div>
          ) : members.length === 0 ? (
             <div className="text-center py-10 text-gray-500">Chưa có thành viên nào trong nhóm này.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {members.map((member) => {
                const isFinalized = member.finalGrade !== undefined && member.finalGrade !== null;

                return (
                <div key={member.id} className="group bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                    <div className="flex flex-col items-center text-center relative z-0">
                    {/* Avatar */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg ring-4 ring-white ${
                        isFinalized ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    }`}>
                        {getInitials(member.student.fullName)}
                    </div>

                    {/* Name & Role */}
                    <h4 className="font-bold text-gray-900 mb-1 text-lg line-clamp-1" title={member.student.fullName}>
                        {member.student.fullName}
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">{member.student.code}</p>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-5 shadow-sm ${
                        member.role === 'LEADER'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                        {member.role === 'LEADER' && <Star className="w-3 h-3 fill-current" />}
                        {member.role}
                    </span>

                    {/* Score Status */}
                    <div className="mb-5 w-full bg-white/60 rounded-lg py-2 backdrop-blur-sm">
                        {isFinalized ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                            <Check className="w-6 h-6 stroke-[3px]" />
                            <span className="text-3xl font-black tracking-tight">{member.finalGrade}</span>
                        </div>
                        ) : (
                        <div className="flex items-center justify-center gap-2 text-orange-500">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>
                            <span className="text-sm font-semibold uppercase tracking-wide">Chưa chốt</span>
                        </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-full mt-auto">
                        <button
                        onClick={() => openEvaluationForm(member)}
                        className="flex-1 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                        >
                        Đánh giá
                        </button>
                        <button
                        onClick={() => handleFinalize(member.student.id)}
                        disabled={isFinalized}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                            isFinalized
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                        }`}
                        >
                        {isFinalized ? 'Xong' : 'Chốt'}
                        </button>
                    </div>
                    </div>
                </div>
                );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Evaluation Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
                >
                <X className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-bold mb-1">Đánh Giá</h3>
                <p className="text-blue-100 text-sm opacity-90">Sinh viên: {selectedMember.student.fullName}</p>
            </div>

            <div className="p-6">
                <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Điểm số (0-10)
                </label>
                <div className="relative">
                    <input
                        type="number"
                        value={score}
                        onChange={handleScoreChange}
                        step="0.1"
                        min="0"
                        max="10"
                        placeholder="VD: 8.5"
                        className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-blue-500 text-lg font-semibold transition-colors"
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 font-bold">PTS</span>
                </div>
                </div>

                <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Nhận xét & Góp ý
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Nhập nhận xét chi tiết..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-blue-500 resize-none transition-colors"
                />
                </div>

                <button
                onClick={handleSubmit}
                disabled={!score}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                Gửi Đánh Giá
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Easter Egg Notification */}
      {easterEggActive && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce z-50">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6" />
            <div>
              <p className="font-bold">🎉 Bạn đã tìm ra Easter Egg!</p>
              <p className="text-sm opacity-90">Konami Code Master! ☕</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Hint */}
      <footer className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
        <p className="hover:text-blue-400 transition-colors cursor-help" title="ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight B A">
            💡 Psst... Try the legendary code
        </p>
      </footer>
    </div>
  );
};

export default TeamDetail;