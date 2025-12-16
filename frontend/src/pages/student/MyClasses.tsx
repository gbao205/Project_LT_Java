import { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip, CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import { getMyClasses } from '../../services/classService';
import AdminLayout from '../../components/layout/AdminLayout';

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
        <AdminLayout title="Lớp Học Của Tôi">

            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}><CircularProgress color="success" /></Box>
            ) : (
                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#e8f5e9' }}>
                            <TableRow>
                                <TableCell fontWeight="bold">STT</TableCell>
                                <TableCell fontWeight="bold">Tên Lớp</TableCell>
                                <TableCell fontWeight="bold">Môn Học</TableCell>
                                <TableCell fontWeight="bold">Giảng Viên</TableCell>
                                <TableCell fontWeight="bold">Học Kỳ</TableCell>
                                <TableCell align="center" fontWeight="bold">Trạng Thái</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {classes.length > 0 ? (
                                classes.map((cls, index) => (
                                    <TableRow key={cls.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell
                                            sx={{ fontWeight: 'bold', color: '#2e7d32', cursor: 'pointer', textDecoration: 'underline' }}
                                            onClick={() => navigate(`/class/${cls.id}`)}
                                        >
                                            {cls.name}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="600">{cls.subject?.name}</Typography>
                                            <Typography variant="caption" color="textSecondary">{cls.subject?.subjectCode}</Typography>
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
        </AdminLayout>
    );
};

export default MyClasses;