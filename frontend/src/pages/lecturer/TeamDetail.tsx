import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    X, Check, Star, Trophy, Users, FileText, Layout,
    ArrowLeft, Loader2, Eye, Download, Clock, AlertCircle, Save
} from 'lucide-react';

interface StudentDTO {
    id: number;
    fullName: string;
    email: string;
    code: string;
    score?: number; // Điểm tổng kết
}

interface GroupDataDTO {
    id: number;
    name: string;
    students: StudentDTO[];
    groupScore?: number;
    maxMembers: number;
}

interface StudentAssignmentDTO {
    id: number;
    title: string;
    description: string;
    deadline: string;
    status: 'SUBMITTED' | 'LATE' | 'MISSING' | 'PENDING';
    submissionDate?: string;
    submissionFile?: string;
    score?: number;
    feedback?: string;
}

const LecturerTeamDetail: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 1. Nhận dữ liệu từ ClassManager truyền sang
    const { classId, className, groupData } = location.state || {};

    // --- STATE DỮ LIỆU ---
    const [students, setStudents] = useState<StudentDTO[]>(groupData?.students || []);
    const [loading, setLoading] = useState<boolean>(false);

    // --- STATE UI & MODAL ---
    const [selectedStudent, setSelectedStudent] = useState<StudentDTO | null>(null);
    const [showModal, setShowModal] = useState(false);

    // State quản lý việc chấm điểm chi tiết (ASSIGNMENTS)
    const [assignments, setAssignments] = useState<StudentAssignmentDTO[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);

    // Form chấm điểm
    const [currentScore, setCurrentScore] = useState('');
    const [currentFeedback, setCurrentFeedback] = useState('');

    // --- STATE EASTER EGG ---
    const [konamiProgress, setKonamiProgress] = useState(0);
    const [easterEggActive, setEasterEggActive] = useState(false);
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    // --- KIỂM TRA DỮ LIỆU ĐẦU VÀO ---
    useEffect(() => {
        if (!groupData) {
            alert("⚠️ Không tìm thấy dữ liệu nhóm. Vui lòng chọn từ Danh sách lớp.");
            navigate('/lecturer/class-manager');
        }
    }, [groupData, navigate]);

    // --- LOGIC EASTER EGG ---
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === konamiCode[konamiProgress]) {
                const newProgress = konamiProgress + 1;
                setKonamiProgress(newProgress);
                if (newProgress === konamiCode.length) {
                    setEasterEggActive(true);
                    setTimeout(() => setEasterEggActive(false), 5000);
                    setKonamiProgress(0);
                }
            } else {
                setKonamiProgress(0);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [konamiProgress]);

    // --- FETCH DATA (LÀM MỚI DỮ LIỆU NHÓM) ---
    const fetchGroupDetails = async () => {
        if (!groupData?.id) return;
        setLoading(true);
        try {
            const response = await api.get(`/teams/${groupData.id}/members`);
            const updatedStudents = response.data.map((m: any) => ({
                id: m.student.id,
                fullName: m.student.fullName,
                email: m.student.email,
                code: m.student.code,
                score: m.finalGrade
            }));
            setStudents(updatedStudents);
        } catch (error) {
            console.error("Lỗi cập nhật dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- FETCH ASSIGNMENTS KHI MỞ MODAL (QUAN TRỌNG: FIX LOGIC) ---
    const fetchStudentAssignments = async (studentId: number) => {
        setLoadingAssignments(true);
        setAssignments([]); // Clear data cũ tránh hiển thị nhầm
        setSelectedAssignmentId(null);

        try {
            // ✅ GỌI API THẬT: Lấy danh sách bài tập + trạng thái nộp + điểm đã chấm
            // Endpoint này khớp với LecturerController.getStudentAssignments
            const response = await api.get(`/lecturer/student-assignments/${studentId}/${classId}`);

            console.log("🔥 Assignments Data:", response.data);
            setAssignments(response.data);

            // Mặc định chọn bài đầu tiên để hiển thị chi tiết ngay
            if (response.data && response.data.length > 0) {
                selectAssignmentForGrading(response.data[0]);
            }
        } catch (error) {
            console.error("Lỗi tải bài tập:", error);
            // ⚠️ Đã XÓA phần Mock Data ở đây để đảm bảo bạn biết nếu API bị lỗi
            alert("Không thể tải dữ liệu bài tập của sinh viên này.");
        } finally {
            setLoadingAssignments(false);
        }
    };

    // Khi chọn một bài tập từ list bên trái
    const selectAssignmentForGrading = (asm: StudentAssignmentDTO) => {
        setSelectedAssignmentId(asm.id);
        // Load điểm và feedback cũ lên form (nếu có)
        setCurrentScore(asm.score !== undefined && asm.score !== null ? asm.score.toString() : '');
        setCurrentFeedback(asm.feedback || '');
    };

    // --- HANDLERS ---
    const openEvaluationModal = (student: StudentDTO) => {
        setSelectedStudent(student);
        setShowModal(true);
        fetchStudentAssignments(student.id);
    };

    // --- LƯU ĐIỂM (QUAN TRỌNG: FIX API PATH) ---
    const handleSaveGrade = async () => {
        if (!selectedStudent || !selectedAssignmentId) return;

        // Validate điểm
        const scoreVal = parseFloat(currentScore);
        if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 10) {
            alert("⚠️ Điểm số phải từ 0 đến 10!");
            return;
        }

        try {
            const payload = {
                studentId: selectedStudent.id,
                assignmentId: selectedAssignmentId,
                score: scoreVal,
                comment: currentFeedback || '',
                type: 'ASSIGNMENT'
            };

            // ✅ FIX ĐƯỜNG DẪN API: Thêm /lecturer vào trước
            // Backend Controller: @RequestMapping("/api/lecturer")
            await api.post('/lecturer/evaluations/assignment', payload);

            // Cập nhật lại State UI ngay lập tức (Optimistic Update)
            setAssignments(prev => prev.map(a =>
                a.id === selectedAssignmentId
                    ? { ...a, score: scoreVal, feedback: currentFeedback }
                    : a
            ));

            alert("✅ Đã lưu điểm bài tập thành công!");
        } catch (error) {
            console.error("Lỗi lưu điểm:", error);
            alert("❌ Lỗi khi lưu điểm. Vui lòng thử lại.");
        }
    };

    // Mở file bài làm (Nếu có URL)
    const handleViewFile = (fileUrl?: string) => {
        if (!fileUrl) return alert("Không tìm thấy file bài làm!");
        // Logic mở file: Nếu là link online thì mở tab mới, nếu là local server thì ghép base URL
        // Ở đây giả sử trả về tên file -> Backend cần serve file static hoặc trả về full URL
        alert(`Đang mở file: ${fileUrl}\n(Chức năng download cần backend cấu hình serve static file)`);
        // window.open(fileUrl, '_blank');
    };

    // Helper UI: Badge trạng thái nộp bài
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-200"><Check className="w-3 h-3"/> Đã nộp</span>;
            case 'LATE': return <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-bold border border-orange-200"><Clock className="w-3 h-3"/> Nộp trễ</span>;
            case 'MISSING': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-200"><AlertCircle className="w-3 h-3"/> Chưa nộp</span>;
            default: return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-medium">Chưa làm</span>;
        }
    };

    const getInitials = (name: string) => name.split(' ').pop()?.[0]?.toUpperCase() || '?';

    if (!groupData) return null;

    // Assignment đang chọn
    const activeAssignment = assignments.find(a => a.id === selectedAssignmentId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 font-sans pb-20">

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">CS</div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Chi Tiết Nhóm</h1>
                            <p className="text-xs text-gray-500 font-medium">Giảng viên Workspace</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">Lớp: {className}</span>
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">GV</div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Title & Stats */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
                            {groupData.name} <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">ID: {groupData.id}</span>
                        </h2>
                        <p className="text-gray-500 mt-1">Quản lý thành viên và đánh giá điểm số</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-yellow-200 flex items-center gap-2 text-yellow-700 font-bold">
                            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" /> <span>Điểm Nhóm: {groupData.groupScore || '--'}</span>
                        </div>
                        <button onClick={fetchGroupDetails} className="bg-white p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-blue-600 shadow-sm transition-all"><Loader2 className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} /></button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div>
                        <div><p className="text-3xl font-bold text-gray-900">{students.length}/{groupData.maxMembers}</p><p className="text-sm text-gray-600 font-medium">Thành viên</p></div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center"><Check className="w-6 h-6 text-purple-600" /></div>
                        <div><p className="text-3xl font-bold text-gray-900">{students.filter(s => s.score !== undefined && s.score !== null).length}</p><p className="text-sm text-gray-600 font-medium">Đã có điểm tổng</p></div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center"><Layout className="w-6 h-6 text-green-600" /></div>
                        <div><p className="text-3xl font-bold text-gray-900">Active</p><p className="text-sm text-gray-600 font-medium">Trạng Thái</p></div>
                    </div>
                </div>

                {/* Student List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-gray-500" /> Danh Sách Sinh Viên</h3>
                    {students.length === 0 ? <div className="text-center py-10 text-gray-400 italic">Nhóm này chưa có thành viên nào.</div> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {students.map((student) => {
                                const hasScore = student.score !== undefined && student.score !== null;
                                return (
                                    <div key={student.id} className="group bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 relative">
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-md ${hasScore ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>{getInitials(student.fullName)}</div>
                                            <h4 className="font-bold text-gray-900 mb-1 text-lg truncate w-full" title={student.fullName}>{student.fullName}</h4>
                                            <p className="text-xs text-gray-500 font-mono mb-4">{student.code}</p>

                                            {/* Score Badge */}
                                            <div className="mb-6 w-full py-2 rounded-xl bg-white border border-gray-100 shadow-sm">
                                                {hasScore ? (
                                                    <div className="flex flex-col items-center"><span className="text-xs text-gray-400 uppercase font-bold">Điểm tổng kết</span><span className="text-3xl font-black text-emerald-600 tracking-tight">{student.score}</span></div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2 text-orange-500 py-2"><span className="text-sm font-semibold">Chưa chốt điểm</span></div>
                                                )}
                                            </div>

                                            <button onClick={() => openEvaluationModal(student)} className="w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md">
                                                <Star className="w-4 h-4" /> Chấm Bài Tập
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL CHẤM ĐIỂM CHI TIẾT (SPLIT VIEW) --- */}
            {showModal && selectedStudent && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-bold">Chấm Điểm Bài Tập</h3>
                                <p className="text-blue-200 text-sm">Sinh viên: <span className="font-bold text-white">{selectedStudent.fullName}</span> ({selectedStudent.code})</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex flex-1 overflow-hidden">

                            {/* LEFT: List Bài Tập */}
                            <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                                <div className="p-4 border-b border-gray-200 font-semibold text-gray-700 bg-white/50 backdrop-blur">
                                    Danh sách bài tập ({assignments.length})
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                    {loadingAssignments ? (
                                        <div className="text-center py-10 text-gray-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>Đang tải...</div>
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
                                                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-1 gap-2">
                                                    <h4 className={`font-semibold text-sm line-clamp-2 leading-tight ${selectedAssignmentId === asm.id ? 'text-blue-700' : 'text-gray-800'}`}>{asm.title}</h4>
                                                    {getStatusBadge(asm.status)}
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                                                    <span>Hạn: {asm.deadline}</span>
                                                    {asm.score !== undefined && <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{asm.score} đ</span>}
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
                                        <div className="flex-1 overflow-y-auto p-6">
                                            {/* 1. Đề bài */}
                                            <div className="mb-6 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                                                <h4 className="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-2">
                                                    <FileText className="w-3 h-3"/> Đề Bài
                                                </h4>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{activeAssignment.title}</h3>
                                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{activeAssignment.description}</p>
                                            </div>

                                            {/* 2. Bài làm */}
                                            <div className="mb-8">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                                    <Download className="w-3 h-3"/> Bài Làm Sinh Viên
                                                </h4>

                                                {activeAssignment.status === 'MISSING' || activeAssignment.status === 'PENDING' ? (
                                                    <div className="p-6 border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl text-center">
                                                        <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                                                        <p className="text-gray-500 text-sm">Sinh viên chưa nộp bài tập này.</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:border-blue-300 transition-colors cursor-pointer group" onClick={() => handleViewFile(activeAssignment.submissionFile)}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-800 text-sm mb-0.5">{activeAssignment.submissionFile || 'exercise_submission.zip'}</p>
                                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> Nộp lúc: {activeAssignment.submissionDate || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                                            <Eye className="w-3 h-3" /> Xem
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 3. Form Chấm điểm */}
                                            <div className="border-t border-gray-100 pt-6">
                                                <h4 className="text-sm font-bold text-gray-800 uppercase mb-4 flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-orange-500 fill-orange-500"/> Đánh Giá & Cho Điểm
                                                </h4>

                                                <div className="flex gap-6 mb-4">
                                                    <div className="w-1/3">
                                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Điểm số</label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-blue-500 outline-none font-bold text-2xl text-blue-700 text-center"
                                                                placeholder="0.0"
                                                                min="0" max="10" step="0.1"
                                                                value={currentScore}
                                                                onChange={e => setCurrentScore(e.target.value)}
                                                            />
                                                            <span className="absolute right-3 top-4 text-xs font-bold text-gray-400">/10</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-2/3">
                                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Nhận xét nhanh</label>
                                                        <textarea
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-blue-500 outline-none text-sm h-[58px] resize-none"
                                                            placeholder="Nhập nhận xét..."
                                                            value={currentFeedback}
                                                            onChange={e => setCurrentFeedback(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Action */}
                                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                                            <span className="text-xs text-gray-400 font-medium italic">
                                                * Điểm sẽ được lưu vào hệ thống ngay lập tức.
                                            </span>
                                            <div className="flex gap-3">
                                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-bold text-sm transition-colors">Đóng</button>
                                                <button
                                                    onClick={handleSaveGrade}
                                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                                                >
                                                    <Save className="w-4 h-4" /> Lưu Kết Quả
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-gray-400 flex-col bg-gray-50/30">
                                        <Layout className="w-16 h-16 mb-4 opacity-10" />
                                        <p className="font-medium">Chọn một bài tập bên trái để bắt đầu chấm điểm.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Easter Egg */}
            {easterEggActive && (
                <div className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce z-50 flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-yellow-300" />
                    <div><p className="font-bold">Konami Code Activated!</p><p className="text-xs text-white/90">Bạn là một game thủ đích thực 🎮</p></div>
                </div>
            )}
        </div>
    );
};

export default LecturerTeamDetail;