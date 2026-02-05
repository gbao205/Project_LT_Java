import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, Chip, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '../../components/layout/StudentLayout';
import { getMyClasses } from '../../services/classService';

const MyClasses = () => {
    const navigate = useNavigate();

    const { data: classes = [], isLoading } = useQuery({
        queryKey: ['my-classes'],
        queryFn: async () => {
            const data = await getMyClasses();
            return [...data].sort((a: any, b: any) => a.id - b.id);
        },
        staleTime: 1000, // Dữ liệu được coi là "mới" trong 1 giây
    });

    return (
        <StudentLayout title="Lớp Học Của Tôi">

            {isLoading ? (
                <Box display="flex" justifyContent="center" mt={5}><CircularProgress color="success" /></Box>
            ) : (
                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#e8f5e9' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Mã lớp</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tên lớp</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Giảng Viên</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Học Kỳ</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {classes.length > 0 ? (
                                classes.map((cls, index) => (
                                    <TableRow key={cls.id} hover onClick={() => navigate(`/class/${cls.id}`)} sx={{ cursor: 'pointer' }}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{cls.classCode}</TableCell>
                                        <TableCell
                                            sx={{ fontWeight: 'bold', color: '#2e7d32', cursor: 'pointer' }}
                                        >
                                            {cls.name}
                                        </TableCell>
                                        <TableCell>{cls.lecturer?.fullName || "Chưa phân công"}</TableCell>
                                        <TableCell>{cls.semester}</TableCell>
                                        <TableCell align="center">
                                            <Chip label="Đang Học" color="success" size="small" variant="outlined" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        Bạn chưa tham gia lớp học nào.
                                        <Button size="small" onClick={() => navigate('/student/registration')} sx={{ml: 1}}>
                                            Đăng ký ngay
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </StudentLayout>
    );
};

export default MyClasses;