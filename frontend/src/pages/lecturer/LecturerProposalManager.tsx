import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAppSnackbar } from '../../hooks/useAppSnackbar';

// --- COMPONENTS UI CON ---

// 1. Header Component
const Header = ({ onBack }: { onBack: () => void }) => {
    // Mock user info (hoặc lấy từ localStorage)
    const user = { fullName: 'Giảng Viên' };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #0288d1 0%, #0097a7 100%)',
            borderBottom: '3px solid #01579b',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
                        width: '40px', height: '40px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    ←
                </button>
                <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0288d1', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    CS
                </div>
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>CollabSphere</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginTop: '2px' }}>Quản Lý Đề Xuất</div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{user.fullName}</div>
                    <span style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block', marginTop: '4px', border: '1px solid rgba(255,255,255,0.3)' }}>
                        Lecturer
                    </span>
                </div>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'white', color: '#0288d1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '3px solid rgba(255,255,255,0.3)' }}>
                    {user.fullName.charAt(0)}
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const LecturerProposalManager = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useAppSnackbar();

    // --- STATE & LOGIC CŨ GIỮ NGUYÊN ---
    const [projects, setProjects] = useState<any[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        technology: '',
        maxStudents: 5
    });

    // API: Lấy danh sách đề tài
    const fetchMyProposals = async () => {
        setLoadingList(true);
        try {
            const response = await api.get('/lecturer/my-proposals');
            setProjects(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchMyProposals();
    }, []);

    // HANDLER: Nhập liệu form
    const handleChange = (e: any) => {
        // Hỗ trợ cả input thường và textarea
        const name = e.target.name;
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // HANDLER: Gửi đề tài
    const handleSubmit = async () => {
        if (!formData.title || !formData.description || !formData.technology) {
            showError("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/lecturer/submit-proposal', formData);
            showSuccess("Gửi đề tài thành công!");

            setFormData({
                title: '',
                description: '',
                technology: '',
                maxStudents: 5
            });

            await fetchMyProposals();

        } catch (error) {
            console.error(error);
            showError("Lỗi khi gửi đề tài. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        navigate('/lecturer/dashboard');
    };

    // Helper: Màu trạng thái
    const getStatusBadge = (status: string) => {
        const statusConfig: any = {
            APPROVED: { label: 'Đã Duyệt', color: '#2e7d32', bg: '#e8f5e9' },
            PENDING: { label: 'Chờ Duyệt', color: '#f57c00', bg: '#fff3e0' },
            REJECTED: { label: 'Từ Chối', color: '#d32f2f', bg: '#ffebee' }
        };
        const config = statusConfig[status] || { label: status, color: '#666', bg: '#f5f5f5' };

        return (
            <span style={{ background: config.bg, color: config.color, padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                {config.label}
            </span>
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)' }}>
            <Header onBack={handleBack} />

            <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>

                {/* 1. TITLE BLOCK */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px 25px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0' }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#0288d1', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.8rem' }}>📝</span>
                        <span>Quản Lý Đề Xuất Đề Tài</span>
                    </h1>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        Tạo và quản lý các đề tài đề xuất gửi lên Trưởng bộ môn phê duyệt
                    </div>
                </div>

                {/* 2. FORM CREATE */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #e3f2fd' }}>
                        <span style={{ fontSize: '1.5rem' }}>📄</span>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0288d1', margin: 0 }}>Tạo Đề Tài Mới</h2>
                    </div>

                    <div style={{ background: '#f8f9fa', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', color: '#666', borderLeft: '4px solid #0288d1' }}>
                        💡 Điền thông tin đề tài để gửi lên Trưởng bộ môn phê duyệt.
                    </div>

                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                            {/* Input Tên Đề Tài */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                    Tên Đề Tài <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Nhập tên đề tài..."
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '0.9rem', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', transition: 'all 0.2s ease' }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#0288d1'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                />
                            </div>

                            {/* Input Công Nghệ */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                    Công Nghệ <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="technology"
                                    value={formData.technology}
                                    onChange={handleChange}
                                    placeholder="VD: React, Node.js, MongoDB"
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '0.9rem', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', transition: 'all 0.2s ease' }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#0288d1'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                />
                            </div>
                        </div>

                        {/* Input Mô Tả */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                Mô Tả & Yêu Cầu Chi Tiết <span style={{ color: '#d32f2f' }}>*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Mô tả chi tiết về đề tài, mục tiêu, yêu cầu..."
                                rows={4}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '0.9rem', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'all 0.2s ease' }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#0288d1'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                            />
                        </div>

                        {/* Input SV Tối Đa & Button Submit */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                    Số Sinh Viên Tối Đa
                                </label>
                                <input
                                    type="number"
                                    name="maxStudents"
                                    min="1" max="10"
                                    value={formData.maxStudents}
                                    onChange={handleChange}
                                    style={{ width: '150px', padding: '12px 14px', fontSize: '0.9rem', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', transition: 'all 0.2s ease' }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#0288d1'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{
                                    background: 'linear-gradient(135deg, #0288d1 0%, #0097a7 100%)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(2,136,209,0.3)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px', opacity: submitting ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseLeave={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                <span style={{ fontSize: '1.2rem' }}>➤</span>
                                <span>{submitting ? 'ĐANG GỬI...' : 'GỬI ĐỀ XUẤT NGAY'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. PROPOSALS LIST */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #e3f2fd' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.5rem' }}>📋</span>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0288d1', margin: 0 }}>Lịch Sử Đề Xuất</h2>
                            <span style={{ background: '#e3f2fd', color: '#0288d1', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                                {projects.length} đề tài
                            </span>
                        </div>
                        <button onClick={fetchMyProposals} style={{ background: '#f5f5f5', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s ease' }} title="Làm mới">
                            🔄
                        </button>
                    </div>

                    {loadingList ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Đang tải dữ liệu...</div>
                    ) : projects.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📭</div>
                            <div style={{ fontSize: '1.1rem', color: '#666' }}>Chưa có đề xuất nào</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Tên Đề Tài</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Công Nghệ</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>SV Tối Đa</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Ngày Gửi</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Trạng Thái</th>
                                </tr>
                                </thead>
                                <tbody>
                                {projects.map((project) => (
                                    <tr key={project.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'all 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '14px 12px' }}>
                                            <div style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem', marginBottom: '4px' }}>{project.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#999', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</div>
                                        </td>
                                        <td style={{ padding: '14px 12px' }}>
                                                <span style={{ background: '#e3f2fd', color: '#0288d1', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>
                                                    {project.technology}
                                                </span>
                                        </td>
                                        <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>{project.maxStudents}</td>
                                        <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>{project.submittedDate}</td>
                                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                            {getStatusBadge(project.status)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LecturerProposalManager;