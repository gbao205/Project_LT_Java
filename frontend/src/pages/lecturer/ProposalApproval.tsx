import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// --- Thay thế Lucide Icons bằng MUI Icons ---
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MessageIcon from '@mui/icons-material/Message';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// --- INTERFACES ---
interface Proposal {
    id: number;
    groupName: string;
    students: string[];
    title: string;
    titleEn: string;
    description: string;
    technology: string;
    submittedDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface ClassGroup {
    id: number;
    name: string;
    semester: string;
    pendingCount: number;
    proposals: Proposal[];
}

const ProposalApproval = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<ClassGroup[]>([]);
    const [loading, setLoading] = useState(true);

    // State UI
    const [expandedClasses, setExpandedClasses] = useState<number[]>([]);
    const [selectedSemester, setSelectedSemester] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // State Modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [feedback, setFeedback] = useState('');

    // --- 1. LẤY DỮ LIỆU TỪ API ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gọi API thật
                const response = await api.get('/lecturer/proposals');
                setClasses(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi tải dữ liệu, dùng Mock Data tạm:", error);

                // --- DỮ LIỆU GIẢ LẬP (MOCK) ĐỂ KHÔNG BỊ TRẮNG TRANG NẾU API LỖI ---
                setTimeout(() => {
                    setClasses([
                        {
                            id: 1,
                            name: 'Đồ án tốt nghiệp - SE1701',
                            semester: 'HK1-2024',
                            pendingCount: 3,
                            proposals: [
                                { id: 101, groupName: 'Nhóm 1', students: ['Nguyễn Văn A', 'Trần Thị B'], title: 'Web Bán Hàng', titleEn: 'E-commerce', description: 'Web bán hàng fullstack...', technology: 'React, Java', submittedDate: '2024-12-25', status: 'PENDING' },
                                { id: 102, groupName: 'Nhóm 2', students: ['Lê Hoàng C'], title: 'App Điểm Danh', titleEn: 'Attendance App', description: 'App điểm danh AI...', technology: 'Flutter, Python', submittedDate: '2024-12-26', status: 'PENDING' }
                            ]
                        },
                        {
                            id: 2,
                            name: 'Thực tập - SE1801',
                            semester: 'HK1-2024',
                            pendingCount: 0,
                            proposals: [
                                { id: 201, groupName: 'Nhóm A', students: ['Phạm Văn D'], title: 'Quản lý kho', titleEn: 'Warehouse Management', description: 'Quản lý nhập xuất...', technology: '.NET, Angular', submittedDate: '2024-12-20', status: 'APPROVED' }
                            ]
                        }
                    ]);
                    setLoading(false);
                }, 500);
            }
        };
        fetchData();
    }, []);

    // --- LOGIC XỬ LÝ ---
    const toggleClass = (classId: number) => {
        setExpandedClasses(prev => prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]);
    };

    const handleApprove = async (classId: number, proposalId: number) => {
        try {
            await api.post(`/lecturer/proposals/${proposalId}/status`, { status: 'APPROVED' });
            // Cập nhật UI
            setClasses(classes.map(cls => {
                if (cls.id === classId) {
                    return {
                        ...cls,
                        pendingCount: Math.max(0, cls.pendingCount - 1),
                        proposals: cls.proposals.map(p => p.id === proposalId ? { ...p, status: 'APPROVED' } : p)
                    };
                }
                return cls;
            }));
            alert('✅ Đã duyệt đề tài thành công!');
        } catch (error) {
            alert('Lỗi kết nối server!');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim() || !selectedProposal) {
            alert('⚠️ Vui lòng nhập lý do từ chối!');
            return;
        }
        try {
            await api.post(`/lecturer/proposals/${selectedProposal.id}/status`, { status: 'REJECTED', reason: rejectReason });

            setClasses(classes.map(cls => ({
                ...cls,
                proposals: cls.proposals.map(p => p.id === selectedProposal.id ? { ...p, status: 'REJECTED' } : p)
            })));
            setShowRejectModal(false);
            alert('❌ Đã từ chối đề tài.');
        } catch (error) {
            alert('Lỗi server!');
        }
    };

    // --- HELPER RENDER ---
    const getStatusBadge = (status: string) => {
        const styles: any = {
            PENDING: { bg: '#fff3cd', color: '#856404', text: 'Chờ duyệt' },
            APPROVED: { bg: '#d4edda', color: '#155724', text: 'Đã duyệt' },
            REJECTED: { bg: '#f8d7da', color: '#721c24', text: 'Đã từ chối' }
        };
        const s = styles[status] || styles.PENDING;
        return <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>{s.text}</span>;
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '2rem' }}>

            {/* HEADER */}
            <div style={{ background: 'white', padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate('/lecturer/dashboard')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}>
                    <ArrowBackIcon />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Duyệt Đề Tài</h1>
            </div>

            <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>

                {/* TOOLBAR: FILTER & SEARCH */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'end' }}>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '0.5rem' }}>TÌM KIẾM</label>
                        {/* --- Thanh tìm kiếm đã chỉnh sửa icon kính lúp --- */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <SearchIcon style={{ position: 'absolute', left: '10px', color: '#94a3b8', width: '20px', height: '20px', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tên SV, nhóm hoặc tên đề tài..."
                                style={{ width: '100%', padding: '10px 10px 10px 40px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s' }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                            />
                        </div>
                    </div>

                    <div style={{ minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '0.5rem' }}>HỌC KỲ</label>
                        <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: 'white' }}>
                            <option value="ALL">Tất cả</option>
                            <option value="HK1-2024">HK1 2024-2025</option>
                        </select>
                    </div>

                    <div style={{ minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '0.5rem' }}>TRẠNG THÁI</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: 'white' }}>
                            <option value="ALL">Tất cả</option>
                            <option value="PENDING">Chờ duyệt</option>
                            <option value="APPROVED">Đã duyệt</option>
                        </select>
                    </div>
                </div>

                {/* LOADING STATE */}
                {loading && <div style={{textAlign: 'center', padding: '2rem', color: '#64748b'}}>Đang tải dữ liệu...</div>}

                {/* LIST CLASSES */}
                {!loading && classes.map(cls => (
                    <div key={cls.id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <div onClick={() => toggleClass(cls.id)} style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <DescriptionIcon />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{cls.name}</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{cls.semester} • {cls.proposals.length} đề tài</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {cls.pendingCount > 0 && <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>{cls.pendingCount} chờ duyệt</span>}
                                {expandedClasses.includes(cls.id) ? <ExpandLessIcon htmlColor="#64748b"/> : <ExpandMoreIcon htmlColor="#64748b"/>}
                            </div>
                        </div>

                        {expandedClasses.includes(cls.id) && (
                            <div style={{ borderTop: '1px solid #e2e8f0' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ background: '#f1f5f9' }}>
                                        <tr>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontSize: '0.75rem' }}>NHÓM/SV</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontSize: '0.75rem' }}>ĐỀ TÀI</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontSize: '0.75rem' }}>NGÀY GỬI</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontSize: '0.75rem' }}>TRẠNG THÁI</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontSize: '0.75rem' }}>THAO TÁC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cls.proposals.map(proposal => (
                                            <tr key={proposal.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{proposal.groupName}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{proposal.students.join(', ')}</div>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ fontWeight: '500', color: '#0f172a' }}>{proposal.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>{proposal.titleEn}</div>
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#64748b' }}>
                                                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                                        <CalendarTodayIcon style={{fontSize: 14}}/> {proposal.submittedDate}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                    {getStatusBadge(proposal.status)}
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button onClick={() => { setSelectedProposal(proposal); setShowDetailModal(true); }} title="Xem chi tiết" style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center' }}>
                                                            <VisibilityIcon style={{fontSize: 18}} />
                                                        </button>
                                                        {proposal.status === 'PENDING' && (
                                                            <>
                                                                <button onClick={() => handleApprove(cls.id, proposal.id)} title="Duyệt" style={{ padding: '6px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center' }}>
                                                                    <CheckCircleIcon style={{fontSize: 18}} />
                                                                </button>
                                                                <button onClick={() => { setSelectedProposal(proposal); setRejectReason(''); setShowRejectModal(true); }} title="Từ chối" style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}>
                                                                    <CancelIcon style={{fontSize: 18}} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* MODAL CHI TIẾT */}
            {showDetailModal && selectedProposal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowDetailModal(false)}>
                    <div style={{ background: 'white', width: '90%', maxWidth: '600px', borderRadius: '12px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Chi Tiết Đề Tài</h3>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>TÊN ĐỀ TÀI</strong>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedProposal.title}</div>
                                <div style={{ color: '#64748b' }}>{selectedProposal.titleEn}</div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>MÔ TẢ</strong>
                                <p style={{ margin: 0, lineHeight: 1.5, color: '#334155' }}>{selectedProposal.description}</p>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>CÔNG NGHỆ</strong>
                                <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>{selectedProposal.technology}</span>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TỪ CHỐI */}
            {showRejectModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', width: '90%', maxWidth: '400px', borderRadius: '12px', padding: '1.5rem' }}>
                        <h3 style={{ marginTop: 0, color: '#dc2626' }}>Từ chối đề tài?</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do từ chối..."
                            rows={4}
                            style={{ width: '100%', padding: '10px', margin: '1rem 0', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowRejectModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Hủy</button>
                            <button onClick={handleReject} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer' }}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProposalApproval;