import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAppSnackbar } from '../../hooks/useAppSnackbar';

import {
    Box, Container, Typography, Paper, Grid, TextField, InputAdornment, IconButton,
    Avatar, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tooltip, CircularProgress, Card, CardContent, Menu, MenuItem, Checkbox, FormControlLabel
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import FilterListIcon from '@mui/icons-material/FilterList';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

interface LecturerDTO {
    id: number;
    fullName: string;
    email: string;
    phoneNumber?: string;
    avatarUrl?: string;
    activeClassCount: number;
    proposalCount: number;
    status: 'ACTIVE' | 'INACTIVE';
}

const HeadLecturerManager = () => {
    const navigate = useNavigate();
    const { showError } = useAppSnackbar();

    const [lecturers, setLecturers] = useState<LecturerDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Advanced Filter States ---
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [sortBy, setSortBy] = useState<'NONE' | 'PROPOSAL_DESC' | 'CLASS_DESC'>('NONE');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get('/head/lecturers');
                setLecturers(response.data);
            } catch (error) {
                console.error("Lỗi tải danh sách GV", error);
                showError("Không thể tải danh sách giảng viên.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleFilterClose = () => setAnchorEl(null);

    // --- LOGIC LỌC & SẮP XẾP ---
    const processedList = lecturers
        .filter(lec => {
            // 1. Search
            const matchesSearch = lec.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lec.email.toLowerCase().includes(searchTerm.toLowerCase());
            // 2. Filter Status
            const matchesStatus = filterStatus === 'ALL' || lec.status === filterStatus;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            // 3. Sort
            if (sortBy === 'PROPOSAL_DESC') return b.proposalCount - a.proposalCount;
            if (sortBy === 'CLASS_DESC') return b.activeClassCount - a.activeClassCount;
            return 0;
        });

    const totalActive = lecturers.filter(l => l.status === 'ACTIVE').length;
    const totalInactive = lecturers.length - totalActive;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff7ed', pb: 8 }}>
            <Paper elevation={0} sx={{ borderBottom: '1px solid #fed7aa', px: 3, py: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: '#c2410c' }}><ArrowBackIcon /></IconButton>
                <Box>
                    <Typography variant="h6" fontWeight="900" color="#c2410c">QUẢN LÝ GIẢNG VIÊN</Typography>
                    <Typography variant="body2" color="text.secondary">Danh sách và thống kê hoạt động giảng dạy bộ môn</Typography>
                </Box>
            </Paper>

            <Container maxWidth="lg">
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: '#ea580c', color: 'white', borderRadius: 3, boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.2, transform: 'rotate(-20deg)' }}><SupervisorAccountIcon sx={{ fontSize: 100 }} /></Box>
                            <CardContent sx={{ py: 3 }}><Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 600 }}>TỔNG SỐ GIẢNG VIÊN</Typography><Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>{lecturers.length}</Typography></CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: '#0f766e', color: 'white', borderRadius: 3, boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.2, transform: 'rotate(-20deg)' }}><ClassIcon sx={{ fontSize: 100 }} /></Box>
                            <CardContent sx={{ py: 3 }}><Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 600 }}>ĐANG HOẠT ĐỘNG</Typography><Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>{totalActive}</Typography></CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: '#64748b', color: 'white', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.2, transform: 'rotate(-20deg)' }}><AssignmentIndIcon sx={{ fontSize: 100 }} /></Box>
                            <CardContent sx={{ py: 3 }}><Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 600 }}>TẠM NGƯNG / NGHỈ</Typography><Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>{totalInactive}</Typography></CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center', border: '1px solid #e2e8f0' }}>
                    <TextField fullWidth placeholder="Tìm kiếm theo Tên hoặc Email giảng viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="medium" InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="disabled" /></InputAdornment>, sx: { borderRadius: 2, bgcolor: '#f8fafc' } }} />
                    <Tooltip title="Bộ lọc nâng cao">
                        <IconButton onClick={handleFilterClick} sx={{ bgcolor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5' }}><FilterListIcon /></IconButton>
                    </Tooltip>

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFilterClose} PaperProps={{ sx: { width: 250, p: 1 } }}>
                        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold', color: '#ea580c' }}>TRẠNG THÁI</Typography>
                        <MenuItem onClick={() => setFilterStatus('ALL')}><FormControlLabel control={<Checkbox checked={filterStatus === 'ALL'} />} label="Tất cả" /></MenuItem>
                        <MenuItem onClick={() => setFilterStatus('ACTIVE')}><FormControlLabel control={<Checkbox checked={filterStatus === 'ACTIVE'} />} label="Đang hoạt động" /></MenuItem>
                        <MenuItem onClick={() => setFilterStatus('INACTIVE')}><FormControlLabel control={<Checkbox checked={filterStatus === 'INACTIVE'} />} label="Ngưng hoạt động" /></MenuItem>

                        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold', color: '#ea580c', mt: 1 }}>SẮP XẾP</Typography>
                        <MenuItem onClick={() => setSortBy('NONE')}>Mặc định</MenuItem>
                        <MenuItem onClick={() => setSortBy('PROPOSAL_DESC')}>Nhiều đề tài nhất</MenuItem>
                        <MenuItem onClick={() => setSortBy('CLASS_DESC')}>Nhiều lớp nhất</MenuItem>
                    </Menu>
                </Paper>

                {loading ? <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: '#ea580c' }} /></Box> : (
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell width="35%" sx={{ fontWeight: '700', color: '#475569', py: 2 }}>THÔNG TIN GIẢNG VIÊN</TableCell>
                                    <TableCell width="25%" sx={{ fontWeight: '700', color: '#475569', py: 2 }}>LIÊN HỆ</TableCell>
                                    <TableCell width="15%" align="center" sx={{ fontWeight: '700', color: '#475569', py: 2 }}>LỚP DẠY</TableCell>
                                    <TableCell width="15%" align="center" sx={{ fontWeight: '700', color: '#475569', py: 2 }}>ĐỀ TÀI HD</TableCell>
                                    <TableCell width="10%" align="center" sx={{ fontWeight: '700', color: '#475569', py: 2 }}>TRẠNG THÁI</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedList.length > 0 ? processedList.map((lec) => (
                                    <TableRow key={lec.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar src={lec.avatarUrl} alt={lec.fullName} sx={{ bgcolor: '#fdba74', color: '#9a3412', width: 45, height: 45, fontWeight: 'bold' }}>{lec.fullName.charAt(0)}</Avatar>
                                                <Box><Typography variant="subtitle2" fontWeight="bold" color="#1e293b" sx={{ fontSize: '0.95rem' }}>{lec.fullName}</Typography><Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>ID: {lec.id}</Typography></Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" flexDirection="column" gap={0.5}>
                                                <Box display="flex" alignItems="center" gap={1}><EmailIcon sx={{ fontSize: 16, color: '#94a3b8' }} /><Typography variant="body2" color="#334155">{lec.email}</Typography></Box>
                                                {lec.phoneNumber && (<Box display="flex" alignItems="center" gap={1}><PhoneIcon sx={{ fontSize: 16, color: '#94a3b8' }} /><Typography variant="body2" color="#334155">{lec.phoneNumber}</Typography></Box>)}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center"><Chip icon={<ClassIcon fontSize="small" />} label={`${lec.activeClassCount} Lớp`} size="small" sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 'bold', borderRadius: 1.5 }} /></TableCell>
                                        <TableCell align="center"><Chip icon={<AssignmentIndIcon fontSize="small" />} label={`${lec.proposalCount} Đề tài`} size="small" sx={{ bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 'bold', borderRadius: 1.5 }} /></TableCell>
                                        <TableCell align="center">
                                            {lec.status === 'ACTIVE' ? <Chip label="Active" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 'bold' }} /> : <Chip label="Inactive" size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 'bold' }} />}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><Typography color="text.secondary">Không tìm thấy giảng viên nào phù hợp.</Typography></TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Container>
        </Box>
    );
};

export default HeadLecturerManager;