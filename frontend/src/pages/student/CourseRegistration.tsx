import { useEffect, useState, useMemo } from 'react';
import {
    Typography, Box, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, 
    Button, Chip, Alert, CircularProgress
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ClassIcon from '@mui/icons-material/Class';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

import StudentLayout from '../../components/layout/StudentLayout';
import { getRegistrationClasses, enrollClass, cancelClass } from '../../services/classService';

const CourseRegistration = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', content: string } | null>(null);

    const fetchData = async () => {
        try {
            const data = await getRegistrationClasses();
            setClasses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Tách danh sách thành 2 phần: Đã đăng ký & Chưa đăng ký
    const { availableList, registeredList } = useMemo(() => {
        const available = classes.filter(c => !c.isRegistered);
        const registered = classes.filter(c => c.isRegistered);
        return { availableList: available, registeredList: registered };
    }, [classes]);

    const handleAction = async (classId: number, isRegistered: boolean) => {
        setMsg(null);
        try {
            if (isRegistered) {
                if (!confirm("Bạn có chắc muốn hủy lớp này không?")) return;
                await cancelClass(classId);
                setMsg({ type: 'success', content: 'Đã hủy đăng ký thành công!' });
            } else {
                await enrollClass(classId);
                setMsg({ type: 'success', content: 'Đăng ký môn học thành công!' });
            }
            fetchData(); // Reload lại cả 2 bảng
        } catch (error: any) {
            setMsg({ type: 'error', content: error.response?.data?.message || "Lỗi thao tác!" });
        }
    };

    // Component con để render từng dòng (tránh lặp code)
    const ClassRow = ({ row, isRegisteredTable }: { row: any, isRegisteredTable: boolean }) => (
        <TableRow hover>
            <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>{row.name}</TableCell>
            <TableCell>
                <Typography variant="body2" fontWeight="bold">{row.subject?.name}</Typography>
                <Typography variant="caption" color="textSecondary">{row.subject?.subjectCode}</Typography>
            </TableCell>
            <TableCell>{row.lecturer?.fullName}</TableCell>
            <TableCell>{row.semester}</TableCell>
            <TableCell>
                <Chip
                    label={`${row.currentEnrollment} / ${row.maxCapacity}`}
                    color={row.currentEnrollment >= row.maxCapacity ? "error" : "default"}
                    variant="outlined"
                    size="small"
                />
            </TableCell>
            <TableCell align="center">
                {isRegisteredTable ? (
                    <Button
                        variant="outlined" color="error" size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleAction(row.id, true)}
                    >
                        Hủy Đăng Ký
                    </Button>
                ) : (
                    <Button
                        variant="contained" color="primary" size="small"
                        startIcon={<AddCircleOutlineIcon />}
                        disabled={row.currentEnrollment >= row.maxCapacity}
                        onClick={() => handleAction(row.id, false)}
                    >
                        {row.currentEnrollment >= row.maxCapacity ? "Hết Chỗ" : "Đăng Ký"}
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );

    return (
        <StudentLayout title="Đăng Ký Môn Học">
            
            {msg && <Alert severity={msg.type} sx={{ mb: 3 }}>{msg.content}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
            ) : (
                <Box display="flex" flexDirection="column" gap={5}>

                    {/* BẢNG 1: CÁC LỚP CÓ THỂ ĐĂNG KÝ */}
                    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Box p={2} bgcolor="#e3f2fd" display="flex" alignItems="center" gap={1}>
                            <ClassIcon color="primary" />
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                Danh Sách Lớp Đang Mở ({availableList.length})
                            </Typography>
                        </Box>
                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Mã Lớp</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Môn Học</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Giảng Viên</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Học Kỳ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Sĩ Số</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Thao Tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {availableList.length > 0 ? (
                                        availableList.map((row) => <ClassRow key={row.id} row={row} isRegisteredTable={false} />)
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                Không có lớp học nào khả dụng để đăng ký.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* BẢNG 2: CÁC LỚP ĐÃ ĐĂNG KÝ */}
                    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #c8e6c9' }}>
                        <Box p={2} bgcolor="#e8f5e9" display="flex" alignItems="center" gap={1}>
                            <AssignmentTurnedInIcon color="success" />
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                Lớp Đã Đăng Ký ({registeredList.length})
                            </Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f8e9' }}>Mã Lớp</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f8e9' }}>Môn Học</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f8e9' }}>Giảng Viên</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f8e9' }}>Học Kỳ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f8e9' }}>Sĩ Số</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f1f8e9' }}>Thao Tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {registeredList.length > 0 ? (
                                        registeredList.map((row) => <ClassRow key={row.id} row={row} isRegisteredTable={true} />)
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                Bạn chưa đăng ký lớp nào.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                </Box>
            )}
        </StudentLayout>
    );
};

export default CourseRegistration;