import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getSubjects, createSubject } from '../../services/subjectService';
import type { Subject } from '../../types/Subject';
import AdminLayout from '../../components/layout/AdminLayout';

const SubjectManager = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [open, setOpen] = useState(false);

    // React Hook Form
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Subject, 'id'>>();

    // Hàm load dữ liệu
    const fetchData = async () => {
        try {
            const data = await getSubjects();
            setSubjects(data);
        } catch (error) {
            console.error("Lỗi tải danh sách môn học:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Xử lý đóng Dialog và Reset form
    const handleClose = () => {
        setOpen(false);
        reset();
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

    return (
        <AdminLayout title="Quản Lý Môn Học">

            {/* THANH CÔNG CỤ */}
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Thêm Môn Học
                </Button>
            </Box>

            {/* NỘI DUNG CHÍNH */}
            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell fontWeight="bold">ID</TableCell>
                                <TableCell fontWeight="bold">Mã môn</TableCell>
                                <TableCell fontWeight="bold">Tên môn học</TableCell>
                                <TableCell fontWeight="bold">Mô tả</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {subjects.map((sub) => (
                                <TableRow key={sub.id} hover>
                                    <TableCell>{sub.id}</TableCell>
                                    <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>{sub.subjectCode}</TableCell>
                                    <TableCell>{sub.name}</TableCell>
                                    <TableCell>{sub.description || "---"}</TableCell>
                                </TableRow>
                            ))}
                            {subjects.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                        Chưa có dữ liệu môn học
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* DIALOG FORM TẠO MỚI */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Thêm Môn Học Mới</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField
                                label="Mã môn (VD: SWP391)"
                                fullWidth
                                {...register("subjectCode", { required: "Mã môn là bắt buộc" })}
                                error={!!errors.subjectCode}
                                helperText={errors.subjectCode?.message}
                            />
                            <TextField
                                label="Tên môn học"
                                fullWidth
                                {...register("name", { required: "Tên môn là bắt buộc" })}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
                            <TextField
                                label="Mô tả"
                                fullWidth
                                multiline
                                rows={3}
                                {...register("description")}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="secondary">Hủy</Button>
                        <Button type="submit" variant="contained" color="primary">Lưu</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </AdminLayout>
    );
};

export default SubjectManager;