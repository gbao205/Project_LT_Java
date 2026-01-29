import { useEffect, useState } from 'react';
import {
    Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import StudentLayout from '../../components/layout/StudentLayout';
import { getMyClasses } from '../../services/classService';

const MyClasses = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await getMyClasses();
                setClasses(data);
            } catch (error) {
                console.error("Lỗi tải lớp học:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    return (
        <StudentLayout title="Lớp Học Của Tôi">

            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}><CircularProgress color="success" /></Box>
            ) : (
                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#e8f5e9' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tên Lớp</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Giảng Viên</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Học Kỳ</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {classes.length > 0 ? (
                                classes.map((cls, index) => (
                                    <TableRow key={cls.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell
                                            sx={{ fontWeight: 'bold', color: '#2e7d32', cursor: 'pointer' }}
                                            onClick={() => navigate(`/class/${cls.id}`)}
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