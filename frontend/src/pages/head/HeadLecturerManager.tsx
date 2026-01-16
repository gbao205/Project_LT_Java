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
    InputAdornment,
    IconButton,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    CircularProgress,
    Button,
    Card,
    CardContent
} from '@mui/material';

// --- Icons ---
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';

// --- INTERFACES ---
interface LecturerDTO {
    id: number;
    fullName: string;
    email: string;
    phoneNumber?: string;
    avatarUrl?: string;
    activeClassCount: number;   // Số lớp đang dạy
    proposalCount: number;      // Số đề tài hướng dẫn
    status: 'ACTIVE' | 'INACTIVE';
}

const HeadLecturerManager = () => {
    const navigate = useNavigate();
    const { showError } = useAppSnackbar();

    const [lecturers, setLecturers] = useState<LecturerDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Gọi API thật (Bạn cần viết API này ở Backend)
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

    // --- 2. FILTERING ---
    const filteredList = lecturers.filter(lec =>
        lec.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lec.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 4 }}>
            {/* HEADER */}
            <Paper elevation={0} sx={{ borderBottom: '1px solid #e2e8f0', px: 3, py: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: '#64748b' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h6" fontWeight="bold" color="#0f172a">
                        Quản Lý Giảng Viên
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Danh sách và thống kê hoạt động giảng dạy
                    </Typography>
                </Box>
            </Paper>

            <Container maxWidth="lg">
                {/* TOOLBAR & STATS */}
                <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                placeholder="Tìm kiếm theo Tên hoặc Email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                                }}
                            />
                            <Tooltip title="Bộ lọc (Đang phát triển)">
                                <IconButton sx={{ bgcolor: '#f1f5f9' }}><FilterListIcon /></IconButton>
                            </Tooltip>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: '#0288d1', color: 'white', borderRadius: 2 }}>
                            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Tổng số Giảng viên</Typography>
                                <Typography variant="h4" fontWeight="bold">{lecturers.length}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* LIST TABLE */}
                {loading ? (
                    <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell width="35%" sx={{ fontWeight: 'bold', color: '#64748b' }}>GIẢNG VIÊN</TableCell>
                                    <TableCell width="20%" sx={{ fontWeight: 'bold', color: '#64748b' }}>LIÊN HỆ</TableCell>
                                    <TableCell width="15%" align="center" sx={{ fontWeight: 'bold', color: '#64748b' }}>LỚP DẠY</TableCell>
                                    <TableCell width="15%" align="center" sx={{ fontWeight: 'bold', color: '#64748b' }}>ĐỀ TÀI HD</TableCell>
                                    <TableCell width="15%" align="center" sx={{ fontWeight: 'bold', color: '#64748b' }}>TRẠNG THÁI</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredList.length > 0 ? filteredList.map((lec) => (
                                    <TableRow key={lec.id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar src={lec.avatarUrl} alt={lec.fullName} sx={{ bgcolor: '#0288d1' }}>
                                                    {lec.fullName.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">
                                                        {lec.fullName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: {lec.id}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                <EmailIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                                                <Typography variant="body2">{lec.email}</Typography>
                                            </Box>
                                            {lec.phoneNumber && (
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <PhoneIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                                                    <Typography variant="body2">{lec.phoneNumber}</Typography>
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                icon={<ClassIcon fontSize="small" />}
                                                label={lec.activeClassCount}
                                                size="small"
                                                sx={{ bgcolor: '#e0f2fe', color: '#0288d1', fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                icon={<AssignmentIndIcon fontSize="small" />}
                                                label={lec.proposalCount}
                                                size="small"
                                                sx={{ bgcolor: '#fff7ed', color: '#ea580c', fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {lec.status === 'ACTIVE' ? (
                                                <Chip label="Hoạt động" color="success" size="small" variant="filled" />
                                            ) : (
                                                <Chip label="Vô hiệu" color="default" size="small" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            <Typography color="text.secondary">Không tìm thấy giảng viên nào.</Typography>
                                        </TableCell>
                                    </TableRow>
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