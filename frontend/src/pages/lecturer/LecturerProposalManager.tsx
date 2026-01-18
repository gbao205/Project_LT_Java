import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, TextField, Button, Grid, Container,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, CircularProgress, IconButton, Alert, Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../../services/api';
import { useAppSnackbar } from '../../hooks/useAppSnackbar';

const LecturerProposalManager = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useAppSnackbar();

    // --- STATE ---
    const [projects, setProjects] = useState<any[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        technology: '',
        maxStudents: 5
    });

    // --- API: Lấy danh sách đề tài ---
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

    // --- HANDLER: Nhập liệu form ---
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- HANDLER: Gửi đề tài ---
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.technology) {
            showError("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        setSubmitting(true);
        try {
            // 1. Gọi API tạo mới
            await api.post('/lecturer/submit-proposal', formData);
            showSuccess("Gửi đề tài thành công!");

            // 2. Reset form
            setFormData({
                title: '',
                description: '',
                technology: '',
                maxStudents: 5
            });

            // 3. Load lại danh sách ngay lập tức để hiện đề tài vừa tạo
            await fetchMyProposals();

        } catch (error) {
            console.error(error);
            showError("Lỗi khi gửi đề tài. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    // Helper: Màu trạng thái
    const getStatusChip = (status: string) => {
        switch (status) {
            case 'PENDING': return <Chip label="Chờ Duyệt" color="warning" variant="outlined" size="small" sx={{fontWeight: 'bold'}} />;
            case 'APPROVED': return <Chip label="Đã Duyệt" color="success" size="small" sx={{fontWeight: 'bold'}} />;
            case 'REJECTED': return <Chip label="Bị Từ Chối" color="error" size="small" sx={{fontWeight: 'bold'}} />;
            default: return <Chip label={status} size="small" />;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

            {/* Header + Nút Quay Lại */}
            <Box display="flex" alignItems="center" mb={3} gap={1}>
                <IconButton onClick={() => navigate('/lecturer/dashboard')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    Quản Lý Đề Xuất Đề Tài
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* PHẦN 1: FORM TẠO ĐỀ TÀI (Ở TRÊN) */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, borderTop: '4px solid #1976d2' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                            📝 Tạo Đề Tài Mới
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Điền thông tin đề tài để gửi lên Trưởng bộ môn phê duyệt.
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={8}>
                                    <TextField
                                        label="Tên Đề Tài"
                                        name="title"
                                        fullWidth
                                        required
                                        size="small"
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Công Nghệ (Ví dụ: React, Spring Boot)"
                                        name="technology"
                                        fullWidth
                                        required
                                        size="small"
                                        value={formData.technology}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Mô Tả & Yêu Cầu Chi Tiết"
                                        name="description"
                                        fullWidth
                                        required
                                        multiline
                                        rows={3}
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Số SV Tối Đa"
                                        name="maxStudents"
                                        type="number"
                                        fullWidth
                                        required
                                        size="small"
                                        value={formData.maxStudents}
                                        onChange={handleChange}
                                        InputProps={{ inputProps: { min: 1, max: 10 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={8} display="flex" alignItems="center">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        disabled={submitting}
                                        startIcon={<SendIcon />}
                                        sx={{ py: 1, fontWeight: 'bold' }}
                                    >
                                        {submitting ? "Đang Gửi..." : "Gửi Đề Xuất Ngay"}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                {/* Divider ngăn cách */}
                <Grid item xs={12}>
                    <Divider>
                        <Chip label="Danh Sách Đề Tài Đã Gửi" color="primary" variant="outlined" />
                    </Divider>
                </Grid>

                {/* PHẦN 2: DANH SÁCH ĐỀ TÀI (Ở DƯỚI) */}
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Box p={2} bgcolor="#f8fafc" display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" color="#475569">
                                📋 Lịch Sử Đề Xuất ({projects.length})
                            </Typography>
                            <IconButton size="small" onClick={fetchMyProposals} disabled={loadingList}>
                                <RefreshIcon />
                            </IconButton>
                        </Box>

                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Tên Đề Tài</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Công Nghệ</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>SV</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Ngày Gửi</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Trạng Thái</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loadingList ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell>
                                        </TableRow>
                                    ) : projects.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                Chưa có đề tài nào. Hãy nhập form bên trên để tạo mới.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        projects.map((p) => (
                                            <TableRow key={p.id} hover>
                                                <TableCell width="40%">
                                                    <Typography variant="body2" fontWeight="600">{p.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ maxWidth: 350 }}>
                                                        {p.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell><Chip label={p.technology} size="small" variant="outlined" /></TableCell>
                                                <TableCell align="center">{p.maxStudents}</TableCell>
                                                <TableCell>{p.submittedDate}</TableCell>
                                                <TableCell align="center">{getStatusChip(p.status)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default LecturerProposalManager;