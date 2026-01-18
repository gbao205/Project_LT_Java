import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAppSnackbar } from '../../hooks/useAppSnackbar';

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
    CircularProgress,
    Avatar,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';

// --- Icons ---
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // [MỚI] Icon phân công

// --- INTERFACES ---
interface Proposal {
    id: number;
    title: string;
    description: string;
    technology: string;
    maxStudents: number;
    submittedDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
    reviewerName?: string; // [MỚI] Tên GV phản biện
}

interface LecturerSubmission {
    lecturerId: number;
    lecturerName: string;
    email: string;
    pendingCount: number;
    proposals: Proposal[];
}

// [MỚI] Interface cho danh sách giảng viên để chọn
interface Lecturer {
    id: number;
    fullName: string;
    email: string;
}

const HeadProposalApproval = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useAppSnackbar();

    const [lecturerList, setLecturerList] = useState<LecturerSubmission[]>([]);
    const [allLecturers, setAllLecturers] = useState<Lecturer[]>([]); // [MỚI] List giảng viên
    const [loading, setLoading] = useState(true);

    // --- State UI ---
    const [expandedLecturers, setExpandedLecturers] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // --- State Modal ---
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    // [MỚI] State Modal Phân công
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedReviewerId, setSelectedReviewerId] = useState<number | string>('');

    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // --- 1. LẤY DỮ LIỆU TỪ SERVER ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // [CẬP NHẬT] Lấy cả danh sách đề tài VÀ danh sách giảng viên
            const [resProposals, resLecturers] = await Promise.all([
                api.get('/head/proposals'),
                api.get('/head/lecturers')
            ]);

            setLecturerList(resProposals.data);
            setAllLecturers(resLecturers.data);

        } catch (error) {
            console.error("Lỗi tải dữ liệu", error);
            showError("Không thể tải dữ liệu. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- LOGIC XỬ LÝ ---
    const toggleLecturer = (id: number) => {
        setExpandedLecturers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    // Xử lý Duyệt
    const handleApprove = async (lecturerId: number, proposalId: number) => {
        if (!window.confirm("Xác nhận DUYỆT đề tài này cho sinh viên đăng ký?")) return;

        try {
            await api.post(`/head/proposals/${proposalId}/approve`);

            showSuccess("Đã duyệt đề tài thành công!");

            setLecturerList(prevList => prevList.map(lec => {
                if (lec.lecturerId === lecturerId) {
                    return {
                        ...lec,
                        pendingCount: Math.max(0, lec.pendingCount - 1),
                        proposals: lec.proposals.map(p => p.id === proposalId ? { ...p, status: 'APPROVED' } : p)
                    };
                }
                return lec;
            }));
        } catch (error) {
            console.error(error);
            showError("Lỗi kết nối server khi duyệt đề tài!");
        }
    };

    // Xử lý Từ chối
    const handleReject = async () => {
        if (!rejectReason.trim() || !selectedProposal) {
            showError('Vui lòng nhập lý do từ chối!');
            return;
        }

        try {
            await api.post(`/head/proposals/${selectedProposal.id}/reject`, { reason: rejectReason });

            showSuccess("Đã từ chối đề tài.");

            const targetLecturerId = lecturerList.find(l => l.proposals.some(p => p.id === selectedProposal.id))?.lecturerId;

            if (targetLecturerId) {
                setLecturerList(prevList => prevList.map(lec => {
                    if (lec.lecturerId === targetLecturerId) {
                        return {
                            ...lec,
                            pendingCount: Math.max(0, lec.pendingCount - 1),
                            proposals: lec.proposals.map(p => p.id === selectedProposal.id ? { ...p, status: 'REJECTED' } : p)
                        };
                    }
                    return lec;
                }));
            }

            setShowRejectModal(false);
            setRejectReason('');
        } catch (error) {
            console.error(error);
            showError("Lỗi kết nối server khi từ chối đề tài!");
        }
    };

    // [MỚI] Xử lý mở Modal phân công
    const handleOpenAssignModal = (proposal: Proposal) => {
        setSelectedProposal(proposal);
        setSelectedReviewerId(''); // Reset selection
        setShowAssignModal(true);
    };

    // [MỚI] Xử lý gọi API phân công
    const handleAssignReviewer = async () => {
        if (!selectedProposal || !selectedReviewerId) {
            showError("Vui lòng chọn giảng viên!");
            return;
        }

        try {
            await api.post('/head/assign-reviewer', {
                projectId: selectedProposal.id,
                reviewerId: selectedReviewerId
            });

            showSuccess("Phân công phản biện thành công!");
            setShowAssignModal(false);
            fetchData(); // Load lại để cập nhật tên reviewer trong bảng
        } catch (error: any) {
            console.error("Lỗi phân công:", error);
            showError(error.response?.data?.message || "Lỗi khi phân công phản biện.");
        }
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'PENDING': return <Chip label="Chờ duyệt" color="warning" size="small" variant="outlined" sx={{fontWeight: 'bold'}} />;
            case 'APPROVED': return <Chip label="Đã duyệt" color="success" size="small" variant="filled" sx={{fontWeight: 'bold'}} />;
            case 'REJECTED': return <Chip label="Từ chối" color="error" size="small" variant="filled" sx={{fontWeight: 'bold'}} />;
            default: return <Chip label={status} size="small" />;
        }
    };

    // Helper: Tìm Owner ID của proposal đang chọn (để disable trong dropdown)
    const currentOwnerId = selectedProposal
        ? lecturerList.find(l => l.proposals.some(p => p.id === selectedProposal.id))?.lecturerId
        : null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 4 }}>
            {/* HEADER */}
            <Paper elevation={0} sx={{ borderBottom: '1px solid #e2e8f0', px: 3, py: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: '#64748b' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h6" fontWeight="bold" color="#0f172a">
                        Duyệt Đề Tài (Trưởng Bộ Môn)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Quản lý các đề tài do giảng viên đề xuất
                    </Typography>
                </Box>
            </Paper>

            <Container maxWidth="lg">
                {/* TOOLBAR */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Tìm kiếm Giảng viên hoặc Tên đề tài..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Trạng thái"
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
                {loading && <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>}

                {/* EMPTY STATE */}
                {!loading && lecturerList.length === 0 && (
                    <Box textAlign="center" py={5}>
                        <Typography color="text.secondary">Hiện chưa có đề tài nào cần duyệt.</Typography>
                    </Box>
                )}

                {/* LIST */}
                {!loading && lecturerList.map(lec => (
                    <Paper key={lec.lecturerId} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <Box
                            onClick={() => toggleLecturer(lec.lecturerId)}
                            sx={{
                                p: 2,
                                bgcolor: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                '&:hover': { bgcolor: '#f1f5f9' }
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#ed6c02' }}><PersonIcon /></Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">{lec.lecturerName}</Typography>
                                    <Typography variant="caption" color="text.secondary">{lec.email} • {lec.proposals.length} đề tài</Typography>
                                </Box>
                            </Box>
                            <Box display="flex" alignItems="center" gap={2}>
                                {lec.pendingCount > 0 && (
                                    <Chip label={`${lec.pendingCount} cần duyệt`} color="error" size="small" sx={{ fontWeight: 'bold' }} />
                                )}
                                <IconButton size="small">
                                    {expandedLecturers.includes(lec.lecturerId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </Box>
                        </Box>

                        <Collapse in={expandedLecturers.includes(lec.lecturerId)}>
                            <TableContainer sx={{ bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width="30%" sx={{ fontWeight: 'bold', color: '#64748b' }}>TÊN ĐỀ TÀI</TableCell>
                                            <TableCell width="15%" sx={{ fontWeight: 'bold', color: '#64748b' }}>CÔNG NGHỆ</TableCell>
                                            <TableCell width="10%" sx={{ fontWeight: 'bold', color: '#64748b' }}>SỐ SV</TableCell>
                                            <TableCell width="15%" align="center" sx={{ fontWeight: 'bold', color: '#64748b' }}>TRẠNG THÁI</TableCell>
                                            {/* [MỚI] Cột Phản Biện */}
                                            <TableCell width="20%" sx={{ fontWeight: 'bold', color: '#64748b' }}>GV PHẢN BIỆN</TableCell>
                                            <TableCell width="10%" align="center" sx={{ fontWeight: 'bold', color: '#64748b' }}>THAO TÁC</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {lec.proposals.map(prop => (
                                            <TableRow key={prop.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600" color="#334155">{prop.title}</Typography>
                                                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                                        <CalendarTodayIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                                                        <Typography variant="caption" color="text.secondary">{prop.submittedDate}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" sx={{ bgcolor: '#e2e8f0', px: 1, py: 0.5, borderRadius: 1 }}>{prop.technology}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={0.5}>
                                                        <SchoolIcon sx={{ fontSize: 16, color: '#64748b' }} />
                                                        <Typography variant="body2">{prop.maxStudents}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">{getStatusChip(prop.status)}</TableCell>

                                                {/* [MỚI] Hiển thị GV Phản Biện */}
                                                <TableCell>
                                                    {prop.status === 'APPROVED' ? (
                                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                                                {prop.reviewerName && prop.reviewerName !== "Chưa phân công"
                                                                    ? prop.reviewerName
                                                                    : <span style={{color: '#94a3b8', fontStyle: 'italic'}}>Chưa có</span>
                                                                }
                                                            </Typography>
                                                            <Tooltip title="Phân công phản biện">
                                                                <IconButton size="small" onClick={() => handleOpenAssignModal(prop)} sx={{ color: '#0288d1' }}>
                                                                    <PersonAddIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                            Cần duyệt trước
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Box display="flex" justifyContent="center">
                                                        <Tooltip title="Xem chi tiết">
                                                            <IconButton size="small" onClick={() => { setSelectedProposal(prop); setShowDetailModal(true); }}>
                                                                <VisibilityIcon fontSize="small" color="primary" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        {prop.status === 'PENDING' && (
                                                            <>
                                                                <Tooltip title="Duyệt">
                                                                    <IconButton size="small" onClick={() => handleApprove(lec.lecturerId, prop.id)} sx={{ color: '#22c55e' }}>
                                                                        <CheckCircleIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Từ chối">
                                                                    <IconButton size="small" onClick={() => { setSelectedProposal(prop); setRejectReason(''); setShowRejectModal(true); }} sx={{ color: '#ef4444' }}>
                                                                        <CancelIcon fontSize="small" />
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
                <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0' }}>Chi Tiết Đề Tài</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedProposal && (
                        <Box>
                            <Typography variant="h6" color="#0f172a" gutterBottom>{selectedProposal.title}</Typography>

                            <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mt={2}>MÔ TẢ</Typography>
                            <Paper variant="outlined" sx={{ p: 2, mt: 0.5, bgcolor: '#f8fafc' }}>
                                <Typography variant="body2">{selectedProposal.description}</Typography>
                            </Paper>

                            <Grid container spacing={2} mt={1}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">CÔNG NGHỆ</Typography>
                                    <Typography variant="body2">{selectedProposal.technology}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">SỐ LƯỢNG SV</Typography>
                                    <Typography variant="body2">{selectedProposal.maxStudents} sinh viên</Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} mt={1}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">NGÀY GỬI</Typography>
                                    <Typography variant="body2">{selectedProposal.submittedDate}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">TRẠNG THÁI HIỆN TẠI</Typography>
                                    <Box mt={0.5}>{getStatusChip(selectedProposal.status)}</Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setShowDetailModal(false)} variant="contained" color="primary">Đóng</Button>
                </DialogActions>
            </Dialog>

            {/* MODAL TỪ CHỐI */}
            <Dialog open={showRejectModal} onClose={() => setShowRejectModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ color: '#d32f2f' }}>Từ Chối Đề Tài</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" gutterBottom>
                        Vui lòng nhập lý do để giảng viên chỉnh sửa:
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Lý do từ chối"
                        fullWidth
                        multiline
                        rows={3}
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

            {/* MODAL PHÂN CÔNG PHẢN BIỆN */}
            <Dialog open={showAssignModal} onClose={() => setShowAssignModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#fff7ed', borderBottom: '1px solid #fed7aa', color: '#c2410c' }}>
                    Phân Công Phản Biện
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body2" gutterBottom>
                        Chọn giảng viên phản biện cho đề tài: <strong>{selectedProposal?.title}</strong>
                    </Typography>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Chọn Giảng Viên</InputLabel>
                        <Select
                            value={selectedReviewerId}
                            label="Chọn Giảng Viên"
                            onChange={(e) => setSelectedReviewerId(e.target.value)}
                        >
                            {allLecturers.map((lec) => (
                                <MenuItem
                                    key={lec.id}
                                    value={lec.id}
                                    // Disable chính giảng viên hướng dẫn (không thể tự phản biện)
                                    disabled={lec.id === currentOwnerId}
                                    sx={{
                                        opacity: lec.id === currentOwnerId ? 0.5 : 1,
                                        fontStyle: lec.id === currentOwnerId ? 'italic' : 'normal'
                                    }}
                                >
                                    {lec.fullName} ({lec.email}) {lec.id === currentOwnerId ? '(GV Hướng dẫn)' : ''}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShowAssignModal(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleAssignReviewer} variant="contained" color="warning">
                        Lưu Phân Công
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default HeadProposalApproval;