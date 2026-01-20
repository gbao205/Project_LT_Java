import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Eye, Edit3, CheckCircle, 
    FileText, Loader2, Award, Scale 
} from 'lucide-react';
import api from '../../services/api';
import { useAppSnackbar } from '../../hooks/useAppSnackbar';

// --- INTERFACES ---
interface ProposalDTO {
    id: number;
    title: string;
    description: string;
    technology: string;
    maxStudents: number;
    status: string;
}

// --- MODAL COMPONENT (Tailwind) ---
const Modal = ({ isOpen, onClose, title, children, actions }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="text-2xl leading-none">&times;</span>
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-6">
                    {children}
                </div>

                {/* Footer */}
                {actions && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const ReviewProjects = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useAppSnackbar();

    // State
    const [projects, setProjects] = useState<ProposalDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProposalDTO | null>(null);

    const [openGrade, setOpenGrade] = useState(false);
    const [score, setScore] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const response = await api.get('/lecturer/reviews');
                setProjects(response.data);
            } catch (error) {
                console.error("Lỗi tải danh sách phản biện:", error);
                showError("Không thể tải danh sách phản biện.");
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const handleOpenGrade = (project: ProposalDTO) => {
        setSelectedProject(project);
        setScore('');
        setComment('');
        setOpenGrade(true);
    };

    const handleSubmitGrade = () => {
        if (!score || isNaN(Number(score)) || Number(score) < 0 || Number(score) > 10) {
            showError("Vui lòng nhập điểm hợp lệ (0-10)!");
            return;
        }
        
        // TODO: Gọi API chấm điểm thật ở đây
        showSuccess(`Đã chấm ${score} điểm cho đề tài: ${selectedProject?.title}`);
        setOpenGrade(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 font-sans pb-20 p-6">
            <div className="max-w-6xl mx-auto">
                
                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/lecturer/dashboard')}
                            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 transition-all"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                                <Scale className="w-7 h-7" /> Danh Sách Phản Biện
                            </h1>
                            <p className="text-sm text-gray-500">Các đề tài được phân công chấm phản biện</p>
                        </div>
                    </div>
                </div>

                {/* TABLE CARD */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-500" />
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>Bạn chưa được phân công phản biện đề tài nào.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Tên Đề Tài</th>
                                        <th className="px-6 py-4 text-left">Công Nghệ</th>
                                        <th className="px-6 py-4 text-center">SV Tối Đa</th>
                                        <th className="px-6 py-4 text-center">Trạng Thái</th>
                                        <th className="px-6 py-4 text-center">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {projects.map((p) => (
                                        <tr key={p.id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-800 text-sm mb-1">{p.title}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">{p.description}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {p.technology}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">
                                                {p.maxStudents}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                    <CheckCircle className="w-3 h-3" /> Đã Duyệt
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => { setSelectedProject(p); setOpenDetail(true); }}
                                                        className="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 hover:scale-105 transition-all"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenGrade(p)}
                                                        className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 hover:scale-105 transition-all"
                                                        title="Chấm điểm"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* --- MODAL CHI TIẾT --- */}
                <Modal
                    isOpen={openDetail}
                    onClose={() => setOpenDetail(false)}
                    title="Chi Tiết Đề Tài"
                    actions={
                        <button 
                            onClick={() => setOpenDetail(false)} 
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                            Đóng
                        </button>
                    }
                >
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Tên Đề Tài</label>
                            <div className="text-lg font-bold text-gray-800">{selectedProject?.title}</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Mô Tả</label>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 leading-relaxed border border-gray-100">
                                {selectedProject?.description || "Không có mô tả."}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Công Nghệ</label>
                            <div className="text-sm font-semibold text-blue-600">{selectedProject?.technology}</div>
                        </div>
                    </div>
                </Modal>

                {/* --- MODAL CHẤM ĐIỂM --- */}
                <Modal
                    isOpen={openGrade}
                    onClose={() => setOpenGrade(false)}
                    title="Chấm Điểm Phản Biện"
                    actions={
                        <>
                            <button 
                                onClick={() => setOpenGrade(false)} 
                                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleSubmitGrade} 
                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                                <Award className="w-4 h-4" /> Lưu Kết Quả
                            </button>
                        </>
                    }
                >
                    <div className="mb-6">
                        <span className="text-sm text-gray-500">Đang chấm cho: </span>
                        <span className="font-bold text-blue-600">{selectedProject?.title}</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Điểm Số (0-10)</label>
                            <input 
                                type="number" 
                                min="0" max="10"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                placeholder="Nhập điểm..."
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nhận Xét / Góp Ý</label>
                            <textarea 
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                                placeholder="Nhập nhận xét chi tiết..."
                            />
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
};

export default ReviewProjects;