import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import { getAllClasses, createClass, type ClassRoom } from '../../services/classService';
import { getSubjects } from '../../services/subjectService';
import { getAllUsers } from '../../services/userService'; // Tận dụng hàm này để lấy list user rồi lọc GV
import AddIcon from '@mui/icons-material/Add';

const ClassManager = () => {
    const [classes, setClasses] = useState<ClassRoom[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [lecturers, setLecturers] = useState<any[]>([]);
    const [open, setOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // Load tất cả dữ liệu cần thiết
    const fetchData = async () => {
        try {
            const [classRes, subRes, userRes] = await Promise.all([
                getAllClasses(),
                getSubjects(),
                getAllUsers() // Lấy all user rồi lọc ở dưới
            ]);

            setClasses(classRes);
            setSubjects(subRes);
            // Lọc ra danh sách chỉ có Role là LECTURER
            const lecturerList = userRes.data.filter((u: any) => u.role === 'LECTURER');
            setLecturers(lecturerList);

        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            await createClass({
                ...data,
                subjectId: Number(data.subjectId), // Ép kiểu về number
                lecturerId: Number(data.lecturerId)
            });
            alert("Tạo lớp thành công!");
            setOpen(false);
            reset();
            fetchData(); // Reload lại bảng
        } catch (error: any) {
            alert(error.response?.data?.message || "Có lỗi xảy ra!");
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    Quản Lý Lớp Học
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Tạo Lớp Mới
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell fontWeight="bold">ID</TableCell>
                            <TableCell fontWeight="bold">Tên Lớp</TableCell>
                            <TableCell>Học Kỳ</TableCell>
                            <TableCell>Môn Học</TableCell>
                            <TableCell>Giảng Viên</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {classes.map((cls) => (
                            <TableRow key={cls.id} hover>
                                <TableCell>{cls.id}</TableCell>
                                <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>{cls.name}</TableCell>
                                <TableCell>{cls.semester}</TableCell>
                                <TableCell>{cls.subject?.name} ({cls.subject?.subjectCode})</TableCell>
                                <TableCell>{cls.lecturer?.fullName}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Form */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Mở Lớp Học Mới</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField
                                label="Tên lớp (VD: SE1702)" fullWidth
                                {...register("name", { required: "Nhập tên lớp" })}
                                error={!!errors.name}
                            />

                            <TextField
                                label="Học kỳ (VD: Spring 2025)" fullWidth
                                {...register("semester", { required: "Nhập học kỳ" })}
                                error={!!errors.semester}
                            />

                            {/* Select Môn Học */}
                            <TextField
                                select label="Chọn Môn Học" fullWidth
                                defaultValue=""
                                inputProps={register("subjectId", { required: "Chọn môn học" })}
                                error={!!errors.subjectId}
                            >
                                {subjects.map((sub) => (
                                    <MenuItem key={sub.id} value={sub.id}>
                                        {sub.subjectCode} - {sub.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Select Giảng Viên */}
                            <TextField
                                select label="Chọn Giảng Viên" fullWidth
                                defaultValue=""
                                inputProps={register("lecturerId", { required: "Chọn giảng viên" })}
                                error={!!errors.lecturerId}
                            >
                                {lecturers.map((lec) => (
                                    <MenuItem key={lec.id} value={lec.id}>
                                        {lec.fullName} ({lec.email})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Hủy</Button>
                        <Button type="submit" variant="contained">Lưu</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default ClassManager;