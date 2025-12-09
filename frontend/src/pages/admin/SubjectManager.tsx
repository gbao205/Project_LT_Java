import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { getSubjects, createSubject } from '../../services/subjectService';
import { logout } from '../../services/authService';
import type { Subject } from '../../types/Subject';

const SubjectManager = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [open, setOpen] = useState(false); // Trạng thái mở/đóng Dialog
    const navigate = useNavigate();

    // React Hook Form
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Subject, 'id'>>();

    // Hàm load dữ liệu
    const fetchData = async () => {
        const data = await getSubjects();
        setSubjects(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Xử lý Đăng xuất
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Xử lý mở Dialog
    const handleClickOpen = () => {
        setOpen(true);
    };

    // Xử lý đóng Dialog
    const handleClose = () => {
        setOpen(false);
        reset(); // Xóa form khi đóng
    };

    // Xử lý Submit Form Tạo mới
    const onSubmit = async (data: Omit<Subject, 'id'>) => {
        const newSubject = await createSubject(data);
        if (newSubject) {
            alert("Thêm thành công!");
            handleClose();
            fetchData(); // Load lại danh sách
        } else {
            alert("Có lỗi xảy ra!");
        }
    };

    if (loading) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;

    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
            {/* Header: Tiêu đề + Nút Đăng xuất */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Quản lý Môn học
                </Typography>
                <Button variant="outlined" color="error" onClick={handleLogout}>
                    Đăng xuất
                </Button>
            </Box>

            {/* Nút Thêm mới */}
            <Button variant="contained" onClick={handleClickOpen} sx={{ mb: 2 }}>
                + Thêm Môn Học
            </Button>

            {/* Bảng Danh sách */}
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Mã môn</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tên môn học</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Mô tả</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {subjects.map((sub) => (
                            <TableRow key={sub.id} hover>
                                <TableCell>{sub.id}</TableCell>
                                <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>{sub.subjectCode}</TableCell>
                                <TableCell>{sub.name}</TableCell>
                                <TableCell>{sub.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Form Thêm mới */}
            <Dialog open={open} onClose={handleClose}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Thêm Môn Học Mới</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Mã môn (VD: SWP391)"
                            fullWidth
                            {...register("subjectCode", { required: "Mã môn là bắt buộc" })}
                            error={!!errors.subjectCode}
                            helperText={errors.subjectCode?.message}
                        />
                        <TextField
                            margin="dense"
                            label="Tên môn học"
                            fullWidth
                            {...register("name", { required: "Tên môn là bắt buộc" })}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                        <TextField
                            margin="dense"
                            label="Mô tả"
                            fullWidth
                            multiline
                            rows={3}
                            {...register("description")}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="secondary">Hủy</Button>
                        <Button type="submit" variant="contained" color="primary">Lưu</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default SubjectManager;