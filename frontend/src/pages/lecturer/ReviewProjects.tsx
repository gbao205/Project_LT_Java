import { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Button, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RateReviewIcon from '@mui/icons-material/RateReview'; // Icon chấm điểm
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';
import { useAppSnackbar } from '../../hooks/useAppSnackbar';

interface ProposalDTO {
    id: number;
    title: string;
    description: string;
    technology: string;
    maxStudents: number;
    status: string;
}

const ReviewProjects = () => {
    const [projects, setProjects] = useState<ProposalDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError } = useAppSnackbar();

    // State cho Modal chi tiết
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProposalDTO | null>(null);

    // State cho Modal chấm điểm (Mockup trước)
    const [openGrade, setOpenGrade] = useState(false);
    const [score, setScore] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await api.get('/lecturer/reviews');
                setProjects(response.data);
            } catch (error) {
                console.error("Lỗi tải danh sách phản biện:", error);
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
        // Sau này sẽ gọi API lưu điểm
        showSuccess(`Đã chấm ${score} điểm cho đề tài: ${selectedProject?.title}`);
        setOpenGrade(false);
    };

    return (
        <AdminLayout>
            <Box p={3}>
                <Typography variant="h5" fontWeight="bold" mb={3} color="primary">
                    DANH SÁCH ĐỀ TÀI PHẢN BIỆN
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Các đề tài được Trưởng bộ môn phân công cho bạn chấm phản biện.
                </Typography>

                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tên Đề Tài</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Công Nghệ</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>SV Tối Đa</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao Tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projects.length > 0 ? (
                                projects.map((p) => (
                                    <TableRow key={p.id} hover>
                                        <TableCell width="40%">
                                            <Typography variant="body2" fontWeight="600">{p.title}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={p.technology} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell align="center">{p.maxStudents}</TableCell>
                                        <TableCell align="center">
                                            <Chip label="Đã duyệt" color="success" size="small" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" justifyContent="center" gap={1}>
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton color="info" size="small" onClick={() => { setSelectedProject(p); setOpenDetail(true); }}>
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Chấm điểm / Nhận xét">
                                                    <IconButton color="warning" size="small" onClick={() => handleOpenGrade(p)}>
                                                        <RateReviewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                        Bạn chưa được phân công phản biện đề tài nào.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* MODAL CHI TIẾT */}
                <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
                    <DialogTitle sx={{ bgcolor: '#f0f9ff' }}>Chi Tiết Đề Tài</DialogTitle>
                    <DialogContent dividers>
                        <Typography variant="h6" color="primary" gutterBottom>{selectedProject?.title}</Typography>
                        <Typography paragraph>{selectedProject?.description}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDetail(false)}>Đóng</Button>
                    </DialogActions>
                </Dialog>

                {/* MODAL CHẤM ĐIỂM (MOCKUP) */}
                <Dialog open={openGrade} onClose={() => setOpenGrade(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ bgcolor: '#fff7ed', color: '#c2410c' }}>Chấm Phản Biện</DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <Typography variant="body2" gutterBottom mt={2}>
                            Đang chấm cho đề tài: <strong>{selectedProject?.title}</strong>
                        </Typography>
                        <Grid container spacing={2} mt={1}>
                            <Grid item xs={4}>
                                <TextField
                                    label="Điểm số (0-10)"
                                    type="number"
                                    fullWidth
                                    value={score}
                                    onChange={(e) => setScore(e.target.value)}
                                    InputProps={{ inputProps: { min: 0, max: 10 } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Nhận xét / Góp ý"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenGrade(false)}>Hủy</Button>
                        <Button variant="contained" color="warning" onClick={handleSubmitGrade}>
                            Lưu Kết Quả
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </AdminLayout>
    );
};

export default ReviewProjects;