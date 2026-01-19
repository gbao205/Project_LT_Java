import { useEffect, useState, useMemo } from 'react';
import {
    Typography, Box, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, 
    Button, Chip, CircularProgress, Grid, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, 
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ClassIcon from '@mui/icons-material/Class';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import StudentLayout from '../../components/layout/StudentLayout';
import { useConfirm } from '../../context/ConfirmContext';
import { useAppSnackbar } from '../../hooks/useAppSnackbar';
import { getRegistrationClasses, enrollClass, cancelClass, type ClassRoom } from '../../services/classService';

const CourseRegistration = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
    const [openDetail, setOpenDetail] = useState(false);

    const { confirm } = useConfirm();
    const { showSuccess, showError } = useAppSnackbar();

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

    const handleOpenDetail = (cls: ClassRoom) => {
        setSelectedClass(cls);
        setOpenDetail(true);
    };

    const handleCloseDetail = () => {
        setOpenDetail(false);
        setSelectedClass(null);
    };

    // Tách danh sách thành 2 phần: Đã đăng ký & Chưa đăng ký
    const { availableList, registeredList } = useMemo(() => {
        const available = classes.filter(c => !c.isRegistered);
        const registered = classes.filter(c => c.isRegistered);
        return { availableList: available, registeredList: registered };
    }, [classes]);

    const handleAction = async (classId: number, isRegistered: boolean) => {
        try {
            if (isRegistered) {
                confirm({
                    title: "Xác nhận hủy",
                    message: "Bạn có chắc muốn hủy đăng ký lớp học này không?",
                    onConfirm: async () => {
                        try {
                            setActionLoadingId(classId);
                            await cancelClass(classId);
                            showSuccess('Đã hủy đăng ký thành công!');
                            await fetchData();
                            if (openDetail) setOpenDetail(false);
                        } catch (error: any) {
                            showError(error.response?.data?.message || "Lỗi thao tác!");
                        } finally {
                            setActionLoadingId(null);
                        }
                    }
                });
            } else {
                try {
                    setActionLoadingId(classId);
                    await enrollClass(classId);
                    showSuccess('Đăng ký môn học thành công!');
                    await fetchData();
                    if (openDetail) setOpenDetail(false);
                } catch (error: any) {
                    showError(error.response?.data?.message || "Lỗi thao tác!");
                } finally {
                    setActionLoadingId(null); 
                }
            }
        } catch (error: any) {
            showError(error.response?.data?.message || "Lỗi thao tác!");
        }
    };

    // Component con để render từng dòng (tránh lặp code)
    const ClassRow = ({ row, isRegisteredTable }: { row: any, isRegisteredTable: boolean }) => {
        const isCurrentLoading = actionLoadingId === row.id;
        return (
            <TableRow hover onClick={() => handleOpenDetail(row)} sx={{ cursor: 'pointer' }}>
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
                    <Button
                        variant={isRegisteredTable ? "outlined" : "contained"}
                        color={isRegisteredTable ? "error" : "primary"}
                        size="small"
                        disabled={isCurrentLoading || (!isRegisteredTable && (row.currentEnrollment || 0) >= row.maxCapacity)}
                        startIcon={isCurrentLoading ? <CircularProgress size={16} color="inherit" /> : (isRegisteredTable ? <CancelIcon /> : <AddCircleOutlineIcon />)}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAction(row.id, isRegisteredTable);
                        }}
                    >
                        {isCurrentLoading ? "Đang xử lý..." : (isRegisteredTable ? "Hủy Đăng Ký" : ((row.currentEnrollment || 0) >= row.maxCapacity ? "Hết Chỗ" : "Đăng Ký"))}
                    </Button>
                </TableCell>
            </TableRow>
        )
    };

    return (
        <StudentLayout title="Đăng Ký Môn Học">

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

            {/* DIALOG HIỂN THỊ CHI TIẾT LỚP HỌC */}
            <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth sx={{ cursor: 'default' }}>
                {selectedClass && (
                    <>
                        <DialogTitle sx={{ bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoIcon color="primary" />
                            <Typography variant="h6" fontWeight="bold">Thông Tin Chi Tiết Lớp Học</Typography>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Tên lớp & Mã lớp</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {selectedClass.name} - {selectedClass.classCode || 'N/A'}
                                    </Typography>
                                </Grid>
                                
                                <Grid size={{ xs: 12 }}>
                                    <Divider />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Môn học</Typography>
                                    <Typography variant="body1">
                                        {selectedClass.subject?.name} ({selectedClass.subject?.subjectCode})
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Học kỳ</Typography>
                                    <Typography variant="body1">{selectedClass.semester}</Typography>
                                </Grid>

                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Giảng viên</Typography>
                                    <Typography variant="body1">{selectedClass.lecturer?.fullName || 'Chưa phân công'}</Typography>
                                    <Typography variant="caption">{selectedClass.lecturer?.email}</Typography>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Divider />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <CalendarTodayIcon fontSize="small" color="action" />
                                        <Typography variant="subtitle1" fontWeight="bold">Thời gian học</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" bgcolor="#fafafa" p={2} borderRadius={1}>
                                        <Box>
                                            <Typography variant="caption" display="block" color="textSecondary">Ngày bắt đầu</Typography>
                                            <Typography variant="body2" fontWeight="bold">{selectedClass.startDate || 'Chưa xác định'}</Typography>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography variant="caption" display="block" color="textSecondary">Ngày kết thúc</Typography>
                                            <Typography variant="body2" fontWeight="bold">{selectedClass.endDate || 'Chưa xác định'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Tình trạng sĩ số</Typography>
                                    <Typography variant="body1">
                                        Đã đăng ký: <strong>{selectedClass.currentEnrollment}</strong> / {selectedClass.maxCapacity} sinh viên
                                    </Typography>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button 
                                onClick={handleCloseDetail} 
                                color="inherit" 
                            >
                                Đóng
                            </Button>
                            {selectedClass && (
                                <Button 
                                    variant="contained" 
                                    color={selectedClass.isRegistered ? "error" : "primary"}
                                    // Chỉ hiển thị load nếu ID trùng với lớp đang được mở trong Dialog
                                    disabled={actionLoadingId === selectedClass.id || (!selectedClass.isRegistered && (selectedClass.currentEnrollment || 0) >= selectedClass.maxCapacity)}
                                    startIcon={actionLoadingId === selectedClass.id ? <CircularProgress size={16} color="inherit" /> : null}
                                    onClick={() => handleAction(selectedClass.id, selectedClass.isRegistered || false)}
                                >
                                    {actionLoadingId === selectedClass.id 
                                        ? "Đang xử lý..." 
                                        : (selectedClass.isRegistered ? "Hủy Đăng Ký" : "Đăng Ký Ngay")
                                    }
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </StudentLayout>
    );
};

export default CourseRegistration;