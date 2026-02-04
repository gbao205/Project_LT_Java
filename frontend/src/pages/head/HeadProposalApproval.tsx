import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAppSnackbar } from '../../hooks/useAppSnackbar';

// --- Material UI Components ---
import {
    Box, Container, Typography, Paper, Grid, TextField, MenuItem, IconButton, Button,
    Collapse, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment,
    Tooltip, CircularProgress, Avatar, FormControl, InputLabel, Select, Card, CardContent
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

// --- INTERFACES ---
interface Proposal {
    id: number;
    title: string;
    description: string;
    technology: string;
    maxStudents: number;
    submittedDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
    reviewerName?: string;
    reviewScore?: number;
    reviewComment?: string;
}

interface LecturerSubmission {
    lecturerId: number;
    lecturerName: string;
    email: string;
    pendingCount: number;
    proposals: Proposal[];
}

interface Lecturer {
    id: number;
    fullName: string;
    email: string;
}

const HeadProposalApproval = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useAppSnackbar();

    const [lecturerList, setLecturerList] = useState<LecturerSubmission[]>([]);
    const [allLecturers, setAllLecturers] = useState<Lecturer[]>([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [expandedLecturers, setExpandedLecturers] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // Filter State

    // Modal States
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);

    const [selectedReviewerId, setSelectedReviewerId] = useState<number | string>('');
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
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

    useEffect(() => { fetchData(); }, []);

    // --- ACTIONS ---
    const toggleLecturer = (id: number) => {
        setExpandedLecturers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleApprove = async (lecturerId: number, proposalId: number) => {
        if (!window.confirm("Xác nhận DUYỆT đề tài này?")) return;
        try {
            await api.post(`/head/proposals/${proposalId}/approve`);
            showSuccess("Đã duyệt đề tài thành công!");
            setLecturerList(prev => prev.map(lec => lec.lecturerId === lecturerId ? {
                ...lec,
                pendingCount: Math.max(0, lec.pendingCount - 1),
                proposals: lec.proposals.map(p => p.id === proposalId ? { ...p, status: 'APPROVED' } : p)
            } : lec));
        } catch (error) { showError("Lỗi kết nối server!"); }
    };

    const handleReject = async () => {
        if (!rejectReason.trim() || !selectedProposal) { showError('Vui lòng nhập lý do!'); return; }
        try {
            await api.post(`/head/proposals/${selectedProposal.id}/reject`, { reason: rejectReason });
            showSuccess("Đã từ chối đề tài.");

            // Tìm lecturer chứa proposal này để update state
            const targetLec = lecturerList.find(l => l.proposals.some(p => p.id === selectedProposal?.id));
            if(targetLec){
                setLecturerList(prev => prev.map(lec => lec.lecturerId === targetLec.lecturerId ? {
                    ...lec,
                    pendingCount: Math.max(0, lec.pendingCount - 1),
                    proposals: lec.proposals.map(p => p.id === selectedProposal?.id ? { ...p, status: 'REJECTED' } : p)
                } : lec));
            }
            setShowRejectModal(false);
            setRejectReason('');
        } catch (error) { showError("Lỗi kết nối server!"); }
    };

    const handleAssignReviewer = async () => {
        if (!selectedProposal || !selectedReviewerId) { showError("Vui lòng chọn giảng viên!"); return; }
        try {
            await api.post('/head/assign-reviewer', { projectId: selectedProposal.id, reviewerId: selectedReviewerId });
            showSuccess("Phân công thành công!");
            setShowAssignModal(false);
            fetchData(); // Reload để hiện tên người phản biện
        } catch (error: any) { showError(error.response?.data?.message || "Lỗi phân công."); }
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'PENDING': return <Chip label="Chờ duyệt" color="warning" size="small" variant="outlined" sx={{ fontWeight: 700, bgcolor: '#fff7ed', color: '#c2410c' }} />;
            case 'APPROVED': return <Chip label="Đã duyệt" color="success" size="small" sx={{ fontWeight: 700, bgcolor: '#ecfdf5', color: '#15803d' }} />;
            case 'REJECTED': return <Chip label="Từ chối" color="error" size="small" sx={{ fontWeight: 700, bgcolor: '#fef2f2', color: '#b91c1c' }} />;
            default: return <Chip label={status} size="small" />;
        }
    };

    const totalPending = lecturerList.reduce((acc, curr) => acc + curr.pendingCount, 0);
    const totalProposals = lecturerList.reduce((acc, curr) => acc + curr.proposals.length, 0);
    const currentOwnerId = selectedProposal ? lecturerList.find(l => l.proposals.some(p => p.id === selectedProposal.id))?.lecturerId : null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff7ed', pb: 8 }}> {/* Màu nền Cam nhạt */}
            <Paper elevation={0} sx={{ borderBottom: '1px solid #fed7aa', px: 3, py: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: '#ea580c' }}> <ArrowBackIcon /> </IconButton>
                <Box>
                    <Typography variant="h6" fontWeight="900" color="#ea580c">DUYỆT ĐỀ TÀI</Typography>
                    <Typography variant="body2" color="text.secondary">Quản lý và phê duyệt đề tài đồ án</Typography>
                </Box>
            </Paper>

            <Container maxWidth="lg">
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: '#ea580c', color: 'white', borderRadius: 3, boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 600 }}>CẦN DUYỆT GẤP</Typography>
                                    <Typography variant="h3" fontWeight="bold">{totalPending}</Typography>
                                </Box>
                                <PendingActionsIcon sx={{ fontSize: 60, opacity: 0.2 }} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: 'white', color: '#ea580c', borderRadius: 3, border: '1px solid #fed7aa' }}>
                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>TỔNG ĐỀ TÀI</Typography>
                                    <Typography variant="h3" fontWeight="bold">{totalProposals}</Typography>
                                </Box>
                                <FactCheckIcon sx={{ fontSize: 60, color: '#ea580c', opacity: 0.2 }} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #fed7aa', boxShadow: 'none' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth placeholder="Tìm kiếm giảng viên, đề tài..."
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <TextField select fullWidth label="Trạng thái" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small">
                                <MenuItem value="ALL">Tất cả</MenuItem>
                                <MenuItem value="PENDING">Chờ duyệt</MenuItem>
                                <MenuItem value="APPROVED">Đã duyệt</MenuItem>
                                <MenuItem value="REJECTED">Đã từ chối</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </Paper>

                {loading ? <Box display="flex" justifyContent="center" py={5}><CircularProgress sx={{ color: '#ea580c' }} /></Box> : (
                    lecturerList.map(lec => {
                        // --- LOGIC LỌC: CHỈ HIỂN THỊ PROPOSAL KHỚP ĐIỀU KIỆN ---
                        const filteredProposals = lec.proposals.filter(p => {
                            const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                lec.lecturerName.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
                            return matchSearch && matchStatus;
                        });

                        // Nếu không có proposal nào khớp, ẨN LUÔN GIẢNG VIÊN ĐÓ
                        if (filteredProposals.length === 0) return null;

                        return (
                            <Paper key={lec.lecturerId} sx={{ mb: 2, borderRadius: 3, overflow: 'hidden', border: '1px solid #fed7aa' }}>
                                <Box onClick={() => toggleLecturer(lec.lecturerId)} sx={{ p: 2, bgcolor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:hover': { bgcolor: '#fff7ed' } }}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar sx={{ bgcolor: '#ffedd5', color: '#ea580c', fontWeight: 'bold' }}>{lec.lecturerName.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">{lec.lecturerName}</Typography>
                                            <Typography variant="caption" color="text.secondary">{lec.email}</Typography>
                                        </Box>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        {/* Hiển thị số lượng phù hợp bộ lọc */}
                                        <Chip label={`${filteredProposals.length} đề tài`} size="small" sx={{ bgcolor: '#ea580c', color: 'white', fontWeight: 'bold' }} />
                                        <IconButton size="small">{expandedLecturers.includes(lec.lecturerId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
                                    </Box>
                                </Box>
                                <Collapse in={expandedLecturers.includes(lec.lecturerId)}>
                                    <TableContainer sx={{ bgcolor: '#fff', borderTop: '1px dashed #fed7aa' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: '#fff7ed' }}>
                                                    <TableCell sx={{ fontWeight: 700, color: '#c2410c' }}>TÊN ĐỀ TÀI</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#c2410c' }}>CÔNG NGHỆ</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#c2410c' }}>SL</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#c2410c' }}>TRẠNG THÁI</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#c2410c' }}>GV PHẢN BIỆN</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#c2410c' }}>THAO TÁC</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredProposals.map(prop => (
                                                    <TableRow key={prop.id} hover>
                                                        <TableCell width="30%">
                                                            <Typography variant="body2" fontWeight="600">{prop.title}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{prop.submittedDate}</Typography>
                                                        </TableCell>
                                                        <TableCell width="15%"><Chip label={prop.technology} size="small" variant="outlined" sx={{ borderRadius: 1 }} /></TableCell>
                                                        <TableCell align="center" width="5%">{prop.maxStudents}</TableCell>
                                                        <TableCell align="center" width="15%">{getStatusChip(prop.status)}</TableCell>
                                                        <TableCell width="20%">
                                                            {prop.status === 'APPROVED' ? (
                                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                                    <Typography variant="body2" fontSize="0.85rem">
                                                                        {prop.reviewerName || "Chưa phân công"}
                                                                    </Typography>
                                                                    <Tooltip title="Phân công">
                                                                        <IconButton size="small" onClick={() => { setSelectedProposal(prop); setShowAssignModal(true); }} sx={{ color: '#ea580c' }}>
                                                                            <PersonAddIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            ) : "-"}
                                                        </TableCell>
                                                        <TableCell align="center" width="15%">
                                                            <Box display="flex" justifyContent="center">
                                                                <Tooltip title="Chi tiết"><IconButton size="small" onClick={() => { setSelectedProposal(prop); setShowDetailModal(true); }}><VisibilityIcon fontSize="small" color="action" /></IconButton></Tooltip>
                                                                {prop.status === 'PENDING' && (
                                                                    <>
                                                                        <Tooltip title="Duyệt"><IconButton size="small" onClick={() => handleApprove(lec.lecturerId, prop.id)} sx={{ color: '#16a34a' }}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
                                                                        <Tooltip title="Từ chối"><IconButton size="small" onClick={() => { setSelectedProposal(prop); setRejectReason(''); setShowRejectModal(true); }} sx={{ color: '#dc2626' }}><CancelIcon fontSize="small" /></IconButton></Tooltip>
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
                        );
                    })
                )}
            </Container>

            {/* MODALS */}
            <Dialog open={showDetailModal} onClose={() => setShowDetailModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ bgcolor: '#fff7ed', color: '#c2410c', borderBottom: '1px solid #fed7aa', fontWeight: 800 }}>Chi Tiết Đề Tài</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedProposal && (
                        <Box mt={2}>
                            <Typography variant="h6" gutterBottom>{selectedProposal.title}</Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', mb: 2 }}><Typography variant="body2">{selectedProposal.description}</Typography></Paper>
                            <Grid container spacing={2}>
                                <Grid item xs={6}><Typography variant="caption" fontWeight="bold">CÔNG NGHỆ</Typography><Typography variant="body2">{selectedProposal.technology}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" fontWeight="bold">SỐ LƯỢNG</Typography><Typography variant="body2">{selectedProposal.maxStudents} SV</Typography></Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions><Button onClick={() => setShowDetailModal(false)}>Đóng</Button></DialogActions>
            </Dialog>

            <Dialog open={showRejectModal} onClose={() => setShowRejectModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ color: '#d32f2f' }}>Từ Chối Đề Tài</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Lý do từ chối" fullWidth multiline rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowRejectModal(false)}>Hủy</Button>
                    <Button onClick={handleReject} variant="contained" color="error">Xác nhận</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showAssignModal} onClose={() => setShowAssignModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ bgcolor: '#fff7ed', borderBottom: '1px solid #fed7aa', color: '#c2410c', fontWeight: 800 }}>Phân Công Phản Biện</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Chọn Giảng Viên</InputLabel>
                        <Select value={selectedReviewerId} label="Chọn Giảng Viên" onChange={(e) => setSelectedReviewerId(e.target.value)}>
                            {allLecturers.map((lec) => (
                                <MenuItem key={lec.id} value={lec.id} disabled={lec.id === currentOwnerId}>
                                    {lec.fullName} {lec.id === currentOwnerId ? '(GVHD)' : ''}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowAssignModal(false)}>Hủy</Button>
                    <Button onClick={handleAssignReviewer} variant="contained" color="warning">Lưu Phân Công</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HeadProposalApproval;