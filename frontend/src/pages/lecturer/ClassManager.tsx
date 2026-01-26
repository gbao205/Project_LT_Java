import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, Hash, ChevronRight, Plus, Minus,
  ClipboardList, Star, Loader2, FileText, Target,
  Clock, Calendar, Upload, X, ArrowLeft, FolderPlus // ✅ Import icon mới
} from 'lucide-react';
import api from '../../services/api';

// --- INTERFACES ---
interface StudentDTO {
  id: number;
  fullName: string;
  code: string;
  score?: number;
}

interface GroupDTO {
  id: number;
  name: string;
  students: StudentDTO[];
  groupScore?: number;
  maxMembers: number;
}

interface AssignmentDTO {
  id: number;
  title: string;
  type: 'class' | 'group';
  deadline: string;
  status: 'active' | 'closed';
}

interface ClassDTO {
  id: number;
  subjectCode: string;
  subjectName: string;
  totalMembers: number;
  groups: GroupDTO[];
  assignments: AssignmentDTO[];
  name?: string;
}

// --- [NEW COMPONENT] UPLOAD MATERIAL MODAL ---
const UploadMaterialModal = ({ isOpen, onClose, classId }: any) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    attachedFile: null as File | null
  });
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ title: '', description: '', attachedFile: null });
      setFileName('');
    }
  }, [isOpen]);

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, attachedFile: file });
      setFileName(file.name);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return alert('⚠️ Vui lòng nhập tiêu đề tài liệu!');
    if (!formData.attachedFile) return alert('⚠️ Vui lòng chọn file!');

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('file', formData.attachedFile);

      await api.post(`/lecturer/classes/${classId}/materials`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('✅ Upload tài liệu thành công!');
      onClose();
    } catch (error: any) {
      console.error(error);
      alert('❌ Lỗi khi upload tài liệu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-5 text-white rounded-t-2xl flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FolderPlus className="w-6 h-6" /> Upload Tài Liệu
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6"/></button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tiêu Đề</label>
              <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="VD: Slide bài giảng chương 1..."
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Mô Tả</label>
              <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
                  placeholder="Nhập mô tả tài liệu..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">File Đính Kèm</label>
              <div className="relative">
                <input type="file" id="materialUpload" onChange={handleFileUpload} className="hidden" />
                <label htmlFor="materialUpload" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-green-50 hover:border-green-400 cursor-pointer transition-all">
                  {fileName ? (
                      <div className="flex items-center text-green-700 font-medium"><FileText className="w-5 h-5 mr-2"/> {fileName}</div>
                  ) : (
                      <div className="text-gray-500 flex flex-col items-center"><Upload className="w-8 h-8 mb-2"/><span>Chọn file để upload</span></div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t bg-gray-50 rounded-b-2xl flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100">Hủy</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex justify-center items-center gap-2 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload Ngay'}
            </button>
          </div>
        </div>
      </div>
  );
};

// --- COMPONENT: EnhancedAssignmentModal (GIỮ NGUYÊN) ---
const EnhancedAssignmentModal = ({ isOpen, onClose, classId, availableGroups, onRefresh }: any) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignmentType: 'class', // 'class' hoặc 'specific_groups'
    selectedGroups: [] as number[],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    attachedFile: null as File | null
  });

  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '', description: '', assignmentType: 'class',
        selectedGroups: [], startDate: '', startTime: '',
        endDate: '', endTime: '', attachedFile: null
      });
      setFileName('');
    }
  }, [isOpen]);

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, attachedFile: file });
      setFileName(file.name);
    }
  };

  const toggleGroupSelection = (groupId: number) => {
    const isSelected = formData.selectedGroups.includes(groupId);
    if (isSelected) {
      setFormData({ ...formData, selectedGroups: formData.selectedGroups.filter(id => id !== groupId) });
    } else {
      setFormData({ ...formData, selectedGroups: [...formData.selectedGroups, groupId] });
    }
  };

  const selectAllGroups = () => {
    if (formData.selectedGroups.length === availableGroups.length) {
      setFormData({ ...formData, selectedGroups: [] });
    } else {
      setFormData({ ...formData, selectedGroups: availableGroups.map((g: any) => g.id) });
    }
  };

  // --- HÀM GỬI BÀI TẬP (ĐÃ CẬP NHẬT FORMDATA) ---
  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) return alert('⚠️ Vui lòng nhập tên bài tập!');
    if (!formData.startDate || !formData.startTime) return alert('⚠️ Vui lòng chọn thời gian bắt đầu!');
    if (!formData.endDate || !formData.endTime) return alert('⚠️ Vui lòng chọn thời gian kết thúc!');
    if (formData.assignmentType === 'specific_groups' && formData.selectedGroups.length === 0) {
      return alert('⚠️ Vui lòng chọn ít nhất 1 nhóm!');
    }

    setIsSubmitting(true);
    try {
      // 1. Sử dụng FormData để gửi File + Dữ liệu
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('type', formData.assignmentType === 'class' ? 'CLASS_ASSIGNMENT' : 'GROUP_PROJECT');
      data.append('deadline', `${formData.endDate}T${formData.endTime}`);

      // Xử lý mảng nhóm (Gửi nhiều lần key 'targetGroups' để backend nhận List<Integer>)
      if (formData.assignmentType === 'specific_groups') {
        formData.selectedGroups.forEach(id => data.append('targetGroups', id.toString()));
      }

      // Append File nếu có
      if (formData.attachedFile) {
        data.append('file', formData.attachedFile);
      }

      console.log('📤 Sending FormData...');

      // 2. Gọi API với Header Multipart
      await api.post(`/lecturer/classes/${classId}/assignments`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('✅ Đã giao bài tập thành công!');
      onRefresh(); // Load lại dữ liệu lớp
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || '❌ Lỗi khi giao bài tập');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-1">Giao Bài Tập Mới</h2>
                <p className="text-blue-100 text-sm">Tạo và phân công bài tập cho sinh viên</p>
              </div>
              <button onClick={onClose} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Tên bài tập */}
            <div>
              <label className="flex items-center text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                <FileText className="w-4 h-4 mr-2 text-blue-600" /> Tên Bài Tập
              </label>
              <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Bài tập tuần 5 - Thiết kế Database"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all"
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Mô Tả (Tùy chọn)
              </label>
              <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập hướng dẫn hoặc yêu cầu chi tiết..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all resize-y"
              />
            </div>

            {/* Loại phân công */}
            <div>
              <label className="flex items-center text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                <Target className="w-4 h-4 mr-2 text-blue-600" /> Giao Cho
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setFormData({ ...formData, assignmentType: 'class', selectedGroups: [] })}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                        formData.assignmentType === 'class' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <Users className={`w-6 h-6 mb-2 ${formData.assignmentType === 'class' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold text-sm ${formData.assignmentType === 'class' ? 'text-blue-700' : 'text-gray-600'}`}>Toàn Lớp</span>
                </button>

                <button
                    onClick={() => setFormData({ ...formData, assignmentType: 'specific_groups' })}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                        formData.assignmentType === 'specific_groups' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <Target className={`w-6 h-6 mb-2 ${formData.assignmentType === 'specific_groups' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold text-sm ${formData.assignmentType === 'specific_groups' ? 'text-blue-700' : 'text-gray-600'}`}>Nhóm Cụ Thể</span>
                </button>
              </div>
            </div>

            {/* Chọn nhóm cụ thể */}
            {formData.assignmentType === 'specific_groups' && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-gray-700 text-sm">Chọn Nhóm ({formData.selectedGroups.length}/{availableGroups.length})</span>
                    <button onClick={selectAllGroups} className="text-sm text-blue-600 font-semibold hover:underline">
                      {formData.selectedGroups.length === availableGroups.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableGroups.map((group: any) => (
                        <button
                            key={group.id}
                            onClick={() => toggleGroupSelection(group.id)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                                formData.selectedGroups.includes(group.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800 text-sm truncate">{group.name}</span>
                            {formData.selectedGroups.includes(group.id) && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white">✓</div>}
                          </div>
                        </button>
                    ))}
                  </div>
                </div>
            )}

            {/* Thời gian */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bắt đầu */}
              <div>
                <label className="flex items-center text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" /> Bắt Đầu
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm" />
                  <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm" />
                </div>
              </div>

              {/* Kết thúc */}
              <div>
                <label className="flex items-center text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" /> Hạn Nộp
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm" />
                  <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm" />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="flex items-center text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                <Upload className="w-4 h-4 mr-2 text-blue-600" /> Đính Kèm File
              </label>
              <div className="relative">
                <input type="file" id="fileUpload" onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.zip" />
                <label htmlFor="fileUpload" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-all">
                  {fileName ? (
                      <div className="flex items-center text-blue-600">
                        <FileText className="w-5 h-5 mr-2" />
                        <span className="font-medium">{fileName}</span>
                      </div>
                  ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click để chọn file (PDF, DOC, ZIP)</p>
                      </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
            <button onClick={onClose} className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
              Hủy
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Giao Bài Tập'}
            </button>
          </div>
        </div>
      </div>
  );
};

// --- MAIN COMPONENT: ClassManager ---
export default function ClassManager() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // UI States
  const [expandedClass, setExpandedClass] = useState<number | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false); // ✅ State mới cho Modal Upload

  // Selection States
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDTO | null>(null);
  const [scoreInput, setScoreInput] = useState<string>('');

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/lecturer/classes');
      console.log("🔥 Dữ liệu Backend:", response.data);

      const mappedClasses = response.data.map((cls: any) => {
        const rawTeams = cls.teams || [];
        const groupsMapped: GroupDTO[] = rawTeams.map((t: any) => ({
          id: t.id,
          name: t.name || `Nhóm ${t.id}`,
          maxMembers: t.maxMembers || 5,
          groupScore: t.teamScore || 0,
          students: t.members ? t.members.map((m: any) => ({
            id: m.id,
            fullName: m.fullName || "Không tên",
            code: m.code || "N/A",
            score: typeof m.score === 'number' ? m.score : (m.finalGrade || 0)
          })) : []
        }));

        const totalStudents = groupsMapped.reduce((sum, g) => sum + g.students.length, 0);

        return {
          id: cls.id,
          subjectCode: cls.classCode || cls.subjectCode || cls.name || "MÃ LỚP",
          subjectName: cls.subjectName || cls.name || "Tên Lớp",
          name: cls.name,
          totalMembers: cls.studentCount || totalStudents,
          groups: groupsMapped,
          assignments: cls.assignments ? cls.assignments.map((asm: any) => ({
            id: asm.id,
            title: asm.title,
            type: asm.type === 'CLASS_ASSIGNMENT' ? 'class' : 'group',
            deadline: asm.dueDate ? new Date(asm.dueDate).toLocaleDateString('vi-VN') : '...',
            status: asm.status === 'ACTIVE' ? 'active' : 'closed'
          })) : []
        };
      });

      setClasses(mappedClasses);
    } catch (error) {
      console.error("❌ Lỗi tải danh sách lớp:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Reset điểm khi mở modal chấm điểm cá nhân
  useEffect(() => {
    if (selectedStudent) {
      setScoreInput(selectedStudent.score?.toString() || '');
    }
  }, [selectedStudent]);

  // --- HANDLERS ---
  const handleBackToHome = () => {
    navigate('/lecturer/dashboard');
  };

  const handleGroupClick = (classItem: ClassDTO, group: GroupDTO) => {
    navigate('/lecturer/teamdetail', {
      state: {
        classId: classItem.id,
        className: classItem.name,
        groupData: group
      }
    });
  };

  const addMemberToGroup = async (groupId: number) => {
    const studentCode = prompt("Nhập mã số sinh viên cần thêm:");
    if (!studentCode) return;
    try {
      await api.post(`/teams/${groupId}/members`, { studentCode });
      alert("Thêm thành viên thành công!");
      await fetchClasses();
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi khi thêm thành viên.");
    }
  };

  const removeMemberFromGroup = async (groupId: number, studentId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa sinh viên này khỏi nhóm?")) return;
    try {
      await api.delete(`/teams/${groupId}/members/${studentId}`);
      alert("Đã xóa thành viên.");
      await fetchClasses();
    } catch (error) {
      alert("Lỗi khi xóa thành viên.");
    }
  };

  const handleUpdateScore = async () => {
    if (!selectedStudent || !selectedGroupId) return;
    const scoreVal = parseFloat(scoreInput);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 10) return alert("Điểm không hợp lệ (0-10)");

    try {
      await api.post('/evaluations', {
        studentId: selectedStudent.id,
        teamId: selectedGroupId,
        score: scoreVal,
        type: 'INDIVIDUAL',
        comment: 'Cập nhật nhanh từ danh sách'
      });
      alert("Đã cập nhật điểm!");
      setShowScoreModal(false);
      await fetchClasses();
    } catch (error) {
      alert("Lỗi khi lưu điểm.");
    }
  };

  // --- RENDER UI ---
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 font-sans pb-20">

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Nút Quay Lại */}
                <button
                    onClick={handleBackToHome}
                    className="p-2 mr-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    title="Quay lại trang chủ"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">CS</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Quản Lý Lớp Học</h1>
                  <p className="text-sm text-gray-500">Giảng Viên Workspace</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">Giảng Viên</span>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold">GV</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 flex items-center">
              <BookOpen className="w-8 h-8 mr-3" />
              Lớp Học Phụ Trách
            </h2>
            <button onClick={() => fetchClasses()} className="p-2 bg-white rounded-full shadow-md hover:shadow-lg text-blue-600 transition-all">
              <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
              <div className="flex justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Đang tải dữ liệu lớp học...</p>
                </div>
              </div>
          ) : classes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl text-gray-500">Chưa có lớp học nào được phân công.</h3>
              </div>
          ) : (
              <div className="space-y-6">
                {classes.map((classItem) => (
                    <div
                        key={classItem.id}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      {/* Class Header Card */}
                      <div className="p-6 bg-white">
                        <div
                            className="flex items-center justify-between cursor-pointer group"
                            onClick={() => setExpandedClass(expandedClass === classItem.id ? null : classItem.id)}
                        >
                          <div className="flex items-center space-x-5 flex-1">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <BookOpen className="w-7 h-7 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{classItem.subjectName}</h3>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center border border-blue-100">
                            <Hash className="w-3 h-3 mr-1" />
                                  {classItem.subjectCode}
                          </span>
                              </div>
                              <div className="flex items-center text-gray-500 text-sm font-medium">
                                <Users className="w-4 h-4 mr-2" />
                                <span>{classItem.totalMembers} sinh viên</span>
                                <span className="mx-3 text-gray-300">|</span>
                                <Target className="w-4 h-4 mr-2" />
                                <span>{classItem.groups?.length || 0} nhóm</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${expandedClass === classItem.id ? 'rotate-90 text-blue-600' : ''}`} />
                        </div>

                        {/* Quick Action Buttons (ĐÃ THÊM NÚT UPLOAD) */}
                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClassId(classItem.id);
                                setShowMaterialModal(true); // Mở modal upload
                              }}
                              className="flex items-center space-x-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium"
                          >
                            <FolderPlus className="w-5 h-5" />
                            <span>Upload Tài Liệu</span>
                          </button>

                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClassId(classItem.id);
                                setShowAssignmentModal(true);
                              }}
                              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium"
                          >
                            <ClipboardList className="w-5 h-5" />
                            <span>Giao Bài Tập</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedClass === classItem.id && (
                          <div className="px-6 pb-8 pt-2 bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2">

                            {/* Assignments Section */}
                            <div className="mb-8">
                              <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center">
                                <FileText className="w-4 h-4 mr-2" /> Bài Tập Đã Giao
                              </h4>
                              {classItem.assignments && classItem.assignments.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {classItem.assignments.map((assignment) => (
                                        <div key={assignment.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <h5 className="font-semibold text-gray-900">{assignment.title}</h5>
                                              <div className="flex items-center gap-2 mt-2">
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                          assignment.type === 'class' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                      }`}>
                                        {assignment.type === 'class' ? 'Toàn lớp' : 'Theo nhóm'}
                                      </span>
                                                <span className="text-xs text-gray-500 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" /> {assignment.deadline}
                                    </span>
                                              </div>
                                            </div>
                                            <span className={`w-2 h-2 rounded-full ${assignment.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                          </div>
                                        </div>
                                    ))}
                                  </div>
                              ) : (
                                  <p className="text-gray-400 text-sm italic bg-white p-3 rounded-lg border border-dashed border-gray-300 text-center">Chưa có bài tập nào được giao.</p>
                              )}
                            </div>

                            {/* Groups Section */}
                            <div>
                              <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center">
                                <Users className="w-4 h-4 mr-2" /> Danh Sách Nhóm ({classItem.groups?.length || 0})
                              </h4>
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {classItem.groups?.length > 0 ? classItem.groups.map((group) => (
                                    <div
                                        key={group.id}
                                        // Thêm sự kiện click để chuyển trang
                                        className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group/card relative"
                                        onClick={() => handleGroupClick(classItem, group)}
                                    >
                                      {/* Hover effect hint */}
                                      <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity text-xs text-blue-500 font-medium">
                                        Click để chấm điểm →
                                      </div>

                                      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold">
                                            {group.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                            <h5 className="font-bold text-gray-900 group-hover/card:text-blue-600 transition-colors">{group.name}</h5>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                    {group.students?.length || 0}/{group.maxMembers} thành viên
                                  </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                          <div className="flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg border border-yellow-100">
                                            <Star className="w-3.5 h-3.5 mr-1 fill-yellow-500 text-yellow-500" />
                                            <span className="font-bold text-sm">{group.groupScore || '--'}</span>
                                          </div>
                                          <button
                                              onClick={(e) => { e.stopPropagation(); addMemberToGroup(group.id); }}
                                              disabled={(group.students?.length || 0) >= group.maxMembers}
                                              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                              title="Thêm thành viên"
                                          >
                                            <Plus className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                        {group.students?.map((student, idx) => (
                                            <div key={student.id || idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={e => e.stopPropagation()}>
                                              <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                                                  {student.fullName ? student.fullName.charAt(0) : '?'}
                                                </div>
                                                <div>
                                                  <p className="text-sm font-semibold text-gray-800">{student.fullName}</p>
                                                  <p className="text-[10px] text-gray-500 font-mono">{student.code}</p>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                      setSelectedClassId(classItem.id);
                                                      setSelectedGroupId(group.id);
                                                      setSelectedStudent(student);
                                                      setShowScoreModal(true);
                                                    }}
                                                    className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                                >
                                                  {student.score !== undefined && student.score !== null ? student.score : '--'}
                                                </button>
                                                <button
                                                    onClick={() => removeMemberFromGroup(group.id, student.id)}
                                                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                                >
                                                  <Minus className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                        ))}
                                      </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
                                      <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                      <p className="text-gray-500">Chưa có nhóm nào trong lớp này.</p>
                                    </div>
                                )}
                              </div>
                            </div>
                          </div>
                      )}
                    </div>
                ))}
              </div>
          )}
        </main>

        {/* Enhanced Assignment Modal */}
        <EnhancedAssignmentModal
            isOpen={showAssignmentModal}
            onClose={() => setShowAssignmentModal(false)}
            classId={selectedClassId}
            availableGroups={classes.find(c => c.id === selectedClassId)?.groups || []}
            onRefresh={fetchClasses}
        />

        {/* --- [NEW] MODAL UPLOAD MATERIAL --- */}
        <UploadMaterialModal
            isOpen={showMaterialModal}
            onClose={() => setShowMaterialModal(false)}
            classId={selectedClassId}
        />

        {/* Score Modal */}
        {showScoreModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowScoreModal(false)}>
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2 fill-yellow-500" /> Chấm Điểm Cá Nhân
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Sinh viên</p>
                  <p className="font-bold text-gray-900 text-lg">{selectedStudent?.fullName}</p>
                  <p className="text-xs text-gray-400 font-mono mt-1">{selectedStudent?.code}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nhập điểm (0-10)</label>
                  <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-lg font-bold text-center"
                      autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowScoreModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                    Hủy
                  </button>
                  <button onClick={handleUpdateScore} className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all">
                    Lưu Điểm
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}