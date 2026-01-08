import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Hash, ChevronRight, Plus, Minus, ClipboardList, Star, Loader2 } from 'lucide-react';
import api from '../../services/api'; // Import API service của bạn

// --- INTERFACES (Cấu trúc dữ liệu khớp với Backend) ---
interface StudentDTO {
  id: number;
  fullName: string;
  code: string;
  score?: number; // Điểm cá nhân
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
  targetGroup?: number;
}

interface ClassDTO {
  id: number; // Backend thường dùng ID số (Long), nhưng UI bạn đang dùng string code (CS101)
  subjectCode: string; // VD: CS101
  subjectName: string; // VD: Lập Trình Cơ Bản
  totalMembers: number;
  groups: GroupDTO[];
  assignments: AssignmentDTO[];
}

export default function ClassManager() {
  // --- STATE ---
  const [classes, setClasses] = useState<ClassDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // UI States
  const [expandedClass, setExpandedClass] = useState<number | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Selection States
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDTO | null>(null);

  // Form States
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskType, setNewTaskType] = useState<'class' | 'group'>('class');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  // --- FETCH DATA (Lấy dữ liệu thật) ---
  const fetchClasses = async () => {
    setLoading(true);
    try {
      // Gọi API lấy danh sách lớp của giảng viên
      // Backend cần có endpoint: GET /api/classes/com.cosre.backend.dto.lecturer (hoặc tương tự)
      const response = await api.get('/classes/com.cosre.backend.dto.lecturer');

      // Map dữ liệu từ Backend sang cấu trúc UI (Nếu cần thiết)
      // Giả sử Backend trả về đúng cấu trúc, nếu không bạn cần map lại ở đây
      setClasses(response.data);
    } catch (error) {
      console.error("Lỗi tải danh sách lớp:", error);
      // alert("Không thể tải danh sách lớp học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // --- HANDLERS (GỌI API) ---

  // 1. Thêm thành viên vào nhóm
  const addMemberToGroup = async (classId: number, groupId: number) => {
    const studentCode = prompt("Nhập mã số sinh viên cần thêm:");
    if (!studentCode) return;

    try {
      await api.post(`/teams/${groupId}/members`, { studentCode });
      alert("Thêm thành viên thành công!");
      fetchClasses(); // Reload lại dữ liệu
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi khi thêm thành viên.");
    }
  };

  // 2. Xóa thành viên khỏi nhóm
  const removeMemberFromGroup = async (classId: number, groupId: number, studentId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa sinh viên này khỏi nhóm?")) return;

    try {
      await api.delete(`/teams/${groupId}/members/${studentId}`);
      alert("Đã xóa thành viên.");
      fetchClasses(); // Reload
    } catch (error) {
      console.error(error);
      alert("Lỗi khi xóa thành viên.");
    }
  };

  // 3. Cập nhật điểm cá nhân
  const handleUpdateScore = async () => {
    if (!selectedStudent || !selectedGroupId) return;
    const scoreVal = parseFloat((document.getElementById('newScore') as HTMLInputElement).value);

    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 10) {
      alert("Điểm không hợp lệ (0-10)");
      return;
    }

    try {
      // Gọi API cập nhật điểm
      // API: POST /api/evaluations
      await api.post('/evaluations', {
        studentId: selectedStudent.id,
        teamId: selectedGroupId, // Điểm thường gắn với team/project
        score: scoreVal,
        type: 'INDIVIDUAL', // Hoặc loại phù hợp với backend
        comment: 'Cập nhật nhanh từ danh sách'
      });

      alert("Đã cập nhật điểm!");
      setShowScoreModal(false);
      fetchClasses();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu điểm.");
    }
  };

  // 4. Cập nhật điểm nhóm
  const updateGroupScore = async (classId: number, groupId: number, newScore: string) => {
    const scoreVal = parseFloat(newScore);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 10) {
      alert("Điểm không hợp lệ");
      return;
    }

    try {
      // API: PUT /api/teams/{id}/score
      await api.put(`/teams/${groupId}/score`, { score: scoreVal });
      fetchClasses();
    } catch (error) {
      alert("Lỗi cập nhật điểm nhóm.");
    }
  };

  // 5. Giao bài tập (Tạo Task/Assignment)
  const handleCreateAssignment = async () => {
    if (!selectedClassId || !newTaskName || !newTaskDeadline) {
      alert("Vui lòng nhập đủ thông tin.");
      return;
    }

    try {
      // API: POST /api/tasks
      await api.post('/tasks', {
        title: newTaskName,
        description: `Bài tập loại: ${newTaskType === 'class' ? 'Toàn lớp' : 'Theo nhóm'}`,
        dueDate: newTaskDeadline,
        classId: selectedClassId,
        type: newTaskType === 'class' ? 'CLASS_ASSIGNMENT' : 'GROUP_PROJECT'
        // Nếu là group assignment cụ thể thì cần thêm logic chọn group
      });

      alert("Giao bài tập thành công!");
      setShowAssignmentModal(false);
      // Reset form
      setNewTaskName('');
      setNewTaskDeadline('');
      fetchClasses();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tạo bài tập.");
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 font-sans">

      {/* Header (Giữ nguyên UI của bạn) */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">CS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CollabSphere</h1>
                <p className="text-sm text-gray-500">Giảng Viên Workspace</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Giảng Viên</span>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">GV</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900">Lớp Học Phụ Trách</h2>
            <button onClick={fetchClasses} className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-blue-600">
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
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl text-gray-500">Chưa có lớp học nào được phân công.</h3>
            </div>
        ) : (
        <div className="space-y-4">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Class Header */}
              <div className="p-6">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedClass(expandedClass === classItem.id ? null : classItem.id)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{classItem.subjectName}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center">
                          <Hash className="w-3 h-3 mr-1" />
                          {classItem.subjectCode}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm">{classItem.totalMembers} sinh viên</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-sm">{classItem.groups?.length || 0} nhóm</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
                      expandedClass === classItem.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* Assignment Button */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClassId(classItem.id);
                      setShowAssignmentModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Giao Bài Tập</span>
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedClass === classItem.id && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-4 bg-gray-50">

                  {/* Assignments Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Bài Tập Đã Giao
                    </h4>
                    {classItem.assignments && classItem.assignments.length > 0 ? (
                        <div className="space-y-2">
                        {classItem.assignments.map((assignment) => (
                            <div key={assignment.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                <h5 className="font-semibold text-gray-900">{assignment.title}</h5>
                                <div className="flex items-center space-x-3 mt-1">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                    assignment.type === 'class'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                    {assignment.type === 'class' ? 'Toàn lớp' : `Nhóm cụ thể`}
                                    </span>
                                    <span className="text-xs text-gray-500">Hạn: {assignment.deadline}</span>
                                </div>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                {assignment.status === 'active' ? 'Đang mở' : 'Đã đóng'}
                                </span>
                            </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm italic">Chưa có bài tập nào.</p>
                    )}
                  </div>

                  {/* Groups Section */}
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                    Danh Sách Nhóm ({classItem.groups?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {classItem.groups?.map((group) => (
                      <div
                        key={group.id}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h5 className="font-semibold text-gray-900">{group.name}</h5>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                              {group.students?.length || 0}/{group.maxMembers} thành viên
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const newScore = prompt('Nhập điểm nhóm (0-10):', group.groupScore?.toString());
                                if (newScore !== null) updateGroupScore(classItem.id, group.id, newScore);
                              }}
                              className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                            >
                              <Star className="w-3 h-3" />
                              <span>Điểm nhóm: {group.groupScore || '--'}</span>
                            </button>
                            <button
                              onClick={() => addMemberToGroup(classItem.id, group.id)}
                              disabled={(group.students?.length || 0) >= group.maxMembers}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Thêm thành viên"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {group.students?.map((student, idx) => (
                            <div key={student.id || idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                              <div className="flex items-center text-sm text-gray-700">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-white text-xs font-medium">
                                    {student.fullName ? student.fullName.charAt(0) : '?'}
                                  </span>
                                </div>
                                <div>
                                    <p className="font-medium">{student.fullName}</p>
                                    <p className="text-xs text-gray-400">{student.code}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                      setSelectedClassId(classItem.id);
                                      setSelectedGroupId(group.id);
                                      setSelectedStudent(student);
                                      setShowScoreModal(true);
                                  }}
                                  className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>{student.score || '--'}</span>
                                </button>
                                <button
                                  onClick={() => removeMemberFromGroup(classItem.id, group.id, student.id)}
                                  className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                  title="Xóa thành viên"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </main>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAssignmentModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Giao Bài Tập Mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên bài tập</label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên bài tập..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại bài tập</label>
                <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as 'class' | 'group')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="class">Toàn lớp</option>
                  <option value="group">Theo nhóm</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hạn nộp</label>
                <input
                  type="date"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateAssignment}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Giao bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowScoreModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Chấm Điểm</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Sinh viên: <span className="font-semibold text-gray-900">{selectedStudent?.fullName}</span></p>
              <p className="text-sm text-gray-600">Điểm hiện tại: <span className="font-semibold text-blue-600">{selectedStudent?.score || '--'}</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Điểm mới (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                defaultValue={selectedStudent?.score}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="newScore"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowScoreModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateScore}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lưu điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}