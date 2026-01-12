
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// --- Material UI Components ---
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    TextField,
    MenuItem,
    IconButton,
    Button,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    Tooltip,
    CircularProgress
} from '@mui/material';

// --- Material UI Icons ---
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
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

    // ✅ FIX LỖI 2,3,4,5: Đã XÓA showFeedbackModal, feedback và các hàm set tương ứng

    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // --- 1. LẤY DỮ LIỆU TỪ API ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get('/lecturer/proposals');
                setClasses(response.data);
            } catch (error) {
                console.error("Lỗi tải dữ liệu, dùng Mock Data tạm:", error);
                setTimeout(() => {
                    setClasses([
                        {
                            id: 1,
                            name: 'Đồ án tốt nghiệp - SE1701',
                            semester: 'HK1-2024',
                            pendingCount: 2,
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
                }, 500);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- LOGIC XỬ LÝ ---
    const toggleClass = (classId: number) => {
        setExpandedClasses(prev => prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]);
    };

    const handleApprove = async (classId: number, proposalId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn DUYỆT đề tài này?")) return;

        try {
            await api.post(`/lecturer/proposals/${proposalId}/status`, { status: 'APPROVED' });

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

            const targetClass = classes.find(c => c.proposals.some(p => p.id === selectedProposal.id));
            if(targetClass) {
                setClasses(classes.map(cls => {
                    if (cls.id === targetClass.id) {
                        return {
                            ...cls,
                            pendingCount: Math.max(0, cls.pendingCount - 1),
                            proposals: cls.proposals.map(p => p.id === selectedProposal.id ? { ...p, status: 'REJECTED' } : p)
                        };
                    }
                    return cls;
                }));
            }

            setShowRejectModal(false);
            setRejectReason('');
        } catch (error) {
            alert('Lỗi server!');
        }
    };

    // --- HELPER RENDER ---
    const getStatusChip = (status: string) => {
        let color: "default" | "warning" | "success" | "error" = "default";
        let label = status;

        switch (status) {
            case 'PENDING': color = "warning"; label = "Chờ duyệt"; break;
            case 'APPROVED': color = "success"; label = "Đã duyệt"; break;
            case 'REJECTED': color = "error"; label = "Đã từ chối"; break;
        }

        return <Chip label={label} color={color} size="small" sx={{ fontWeight: 'bold' }} />;
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 4 }}>

            {/* HEADER */}
            <Paper elevation={0} sx={{ borderBottom: '1px solid #e2e8f0', px: 3, py: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: '#64748b' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="#0f172a">
                    Duyệt Đề Tài
                </Typography>
            </Paper>

            <Container maxWidth="lg">

                {/* TOOLBAR */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    {/* @ts-ignore */}
                    <Grid container spacing={2} alignItems="center">
                        {/* @ts-ignore */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={0.5}>
                                TÌM KIẾM
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Tên SV, nhóm hoặc tên đề tài..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                                }}
                            />
                        </Grid>
                        {/* @ts-ignore */}
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={0.5}>
                                HỌC KỲ
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="ALL">Tất cả</MenuItem>
                                <MenuItem value="HK1-2024">HK1 2024-2025</MenuItem>
                            </TextField>
                        </Grid>
                        {/* @ts-ignore */}
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={0.5}>
                                TRẠNG THÁI
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="ALL">Tất cả</MenuItem>
                                <MenuItem value="PENDING">Chờ duyệt</MenuItem>
                                <MenuItem value="APPROVED">Đã duyệt</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </Paper>

                {/* LOADING */}
                {loading && (
                    <Box display="flex" justifyContent="center" py={5}>
                        <CircularProgress />
                    </Box>
                )}

                {/* LIST CLASSES */}
                {!loading && classes.map(cls => (
                    <Paper key={cls.id} sx={{ mb: 2, borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <Box
                            onClick={() => toggleClass(cls.id)}
                            sx={{
                                p: 2,
                                bgcolor: '#f8fafc',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                '&:hover': { bgcolor: '#f1f5f9' }
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box sx={{ width: 40, height: 40, bgcolor: '#3b82f6', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <DescriptionIcon />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">{cls.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{cls.semester} • {cls.proposals.length} đề tài</Typography>
                                </Box>
                            </Box>
                            <Box display="flex" alignItems="center" gap={2}>
                                {cls.pendingCount > 0 && (
                                    <Chip label={`${cls.pendingCount} chờ duyệt`} color="warning" size="small" sx={{ fontWeight: 'bold' }} />
                                )}
                                <IconButton size="small">
                                    {expandedClasses.includes(cls.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </Box>
                        </Box>

                        <Collapse in={expandedClasses.includes(cls.id)}>
                            <TableContainer sx={{ borderTop: '1px solid #e2e8f0' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>NHÓM/SV</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>ĐỀ TÀI</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>NGÀY GỬI</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>TRẠNG THÁI</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>THAO TÁC</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cls.proposals.map(proposal => (
                                            <TableRow key={proposal.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold">{proposal.groupName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{proposal.students.join(', ')}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="500">{proposal.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary" fontStyle="italic">{proposal.titleEn}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                                                        <CalendarTodayIcon sx={{ fontSize: 14 }} />
                                                        <Typography variant="body2">{proposal.submittedDate}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {getStatusChip(proposal.status)}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box display="flex" justifyContent="center" gap={1}>
                                                        <Tooltip title="Xem chi tiết">
                                                            <IconButton
                                                                size="small"
                                                                sx={{ border: '1px solid #cbd5e1', bgcolor: 'white' }}
                                                                onClick={() => { setSelectedProposal(proposal); setShowDetailModal(true); }}
                                                            >
                                                                <VisibilityIcon fontSize="small" color="primary" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {proposal.status === 'PENDING' && (
                                                            <>
                                                                <Tooltip title="Duyệt">
                                                                    <IconButton
                                                                        size="small"
                                                                        sx={{ border: '1px solid #bbf7d0', bgcolor: '#f0fdf4' }}
                                                                        onClick={() => handleApprove(cls.id, proposal.id)}
                                                                    >
                                                                        <CheckCircleIcon fontSize="small" color="success" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Từ chối">
                                                                    <IconButton
                                                                        size="small"
                                                                        sx={{ border: '1px solid #fecaca', bgcolor: '#fef2f2' }}
                                                                        onClick={() => { setSelectedProposal(proposal); setRejectReason(''); setShowRejectModal(true); }}
                                                                    >
                                                                        <CancelIcon fontSize="small" color="error" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Collapse>
                    </Paper>
                ))}
            </Container>

            {/* MODAL CHI TIẾT */}
            <Dialog open={showDetailModal} onClose={() => setShowDetailModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Chi Tiết Đề Tài</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedProposal && (
                        <Box sx={{ mt: 2 }}>
                            <Box mb={2}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">TÊN ĐỀ TÀI</Typography>
                                <Typography variant="h6">{selectedProposal.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{selectedProposal.titleEn}</Typography>
                            </Box>
                            <Box mb={2}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">MÔ TẢ</Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{selectedProposal.description}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">CÔNG NGHỆ</Typography>
                                <Box mt={0.5}>
                                    <Chip label={selectedProposal.technology} color="primary" variant="outlined" />
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setShowDetailModal(false)} variant="contained">Đóng</Button>
                </DialogActions>
            </Dialog>

            {/* MODAL TỪ CHỐI */}
            <Dialog open={showRejectModal} onClose={() => setShowRejectModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ color: '#d32f2f' }}>Từ chối đề tài?</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Lý do từ chối"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShowRejectModal(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleReject} variant="contained" color="error">Xác nhận</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProposalApproval;