import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Typography, Box, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, 
    Button, Chip, CircularProgress, Grid,
    Dialog, DialogTitle, DialogContent, DialogActions, 
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ClassIcon from '@mui/icons-material/Class';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';

import StudentLayout from '../../components/layout/StudentLayout';
import { useConfirm } from '../../context/ConfirmContext';
import { useAppSnackbar } from '../../hooks/useAppSnackbar';
import { getRegistrationClasses, enrollClass, cancelClass, type ClassRoom } from '../../services/classService';

const CourseRegistration = () => {
    const queryClient = useQueryClient();
    const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
    const [openDetail, setOpenDetail] = useState(false);

    const { confirm } = useConfirm();
    const { showSuccess, showError } = useAppSnackbar();

    // 1. Lấy danh sách lớp học
    const { data: classes = [], isLoading } = useQuery({
        queryKey: ['registration-classes'], // Key này dùng để định danh dữ liệu trong cache
        queryFn: getRegistrationClasses,    // Hàm gọi API của bạn
        staleTime: 60000,                   // Dữ liệu được coi là "mới" trong 60 giây
    });

    // Mutation để Đăng ký lớp
    const enrollMutation = useMutation({
        mutationFn: (classId: number) => enrollClass(classId),
        // Khi bắt đầu nhấn nút Đăng ký
        onMutate: async (classId) => {
            await queryClient.cancelQueries({ queryKey: ['registration-classes'] });
            const previousClasses = queryClient.getQueryData(['registration-classes']);
            queryClient.setQueryData(['registration-classes'], (old: any[]) => 
                old.map(c => c.id === classId ? { ...c, isRegistered: true, currentEnrollment: c.currentEnrollment + 1 } : c)
            );
            return { previousClasses };
        },
        onError: (err, classId, context) => {
            // Nếu lỗi thì hoàn tác dữ liệu cũ
            queryClient.setQueryData(['registration-classes'], context?.previousClasses);
            if (openDetail) setOpenDetail(false);
            showError("Đăng ký thất bại!");

        },
        onSuccess: () => {
            if (openDetail) setOpenDetail(false);
            showSuccess("Đăng ký thành công!");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['registration-classes'] });
        }
    });

    // Mutation để Hủy lớp
    const cancelMutation = useMutation({
        mutationFn: (classId: number) => cancelClass(classId),
        onMutate: async (classId) => {
            await queryClient.cancelQueries({ queryKey: ['registration-classes'] });
            const previousClasses = queryClient.getQueryData(['registration-classes']);
            queryClient.setQueryData(['registration-classes'], (old: any[]) => 
                old.map(c => c.id === classId ? { ...c, isRegistered: false, currentEnrollment: c.currentEnrollment - 1 } : c)
            );
            return { previousClasses };
        },
        onError: (err, classId, context) => {
            queryClient.setQueryData(['registration-classes'], context?.previousClasses);
            if (openDetail) setOpenDetail(false);
            showError("Hủy thất bại!");
        },
        onSuccess: () => {
            if (openDetail) setOpenDetail(false);
            showSuccess("Đã hủy đăng ký!");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['registration-classes'] });
        }
    });

    // Tách danh sách thành 2 phần: Đã đăng ký & Chưa đăng ký
    const { availableList, registeredList } = useMemo(() => {
        const available = classes.filter((c: any) => !c.isRegistered && c.isRegistrationOpen);
        const registered = classes
            .filter((c: any) => c.isRegistered)
            .sort((a: any, b: any) => a.id - b.id);
        return { availableList: available, registeredList: registered };
    }, [classes]);

    const handleAction = (classId: number, isRegistered: boolean) => {
        if (isRegistered) {
            confirm({
                title: "Xác nhận hủy",
                message: "Bạn có chắc muốn hủy đăng ký?",
                onConfirm: () => cancelMutation.mutate(classId)
            });
        } else {
            enrollMutation.mutate(classId);
        }
    };

    const handleOpenDetail = (cls: ClassRoom) => {
        setSelectedClass(cls);
        setOpenDetail(true);
    };

    const handleCloseDetail = () => {
        setOpenDetail(false);
        setSelectedClass(null);
    };

    const processingId = enrollMutation.isPending ? enrollMutation.variables : 
                     cancelMutation.isPending ? cancelMutation.variables : null;

    // Component con để render từng dòng (tránh lặp code)
    const ClassRow = ({ row, isRegisteredTable, index }: { row: any, isRegisteredTable: boolean, index: number }) => {
        const isCurrentLoading = processingId === row.id;

        return (
            <TableRow hover onClick={() => handleOpenDetail(row)} sx={{ cursor: 'pointer' }}>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>{row.classCode}</TableCell>
                <TableCell>
                    <Typography variant="body2" fontWeight="bold">{row.name}</Typography>
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
                        disabled={!!processingId || (!isRegisteredTable && row.currentEnrollment >= row.maxCapacity)}
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

            {isLoading ? (
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
                                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', width: 60 }}>STT</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Mã Lớp</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Tên lớp</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Giảng Viên</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Học Kỳ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Sĩ Số</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Thao Tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {availableList.length > 0 ? (
                                        availableList.map((row: any, index: number) => <ClassRow key={row.id} row={row} isRegisteredTable={false} index={index} />)
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
                                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f1f8e9', width: 60 }}>STT</TableCell>
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
                                        registeredList.map((row: any, index: number) => <ClassRow key={row.id} row={row} isRegisteredTable={true} index={index} />)
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
            <Dialog 
                open={openDetail} 
                onClose={handleCloseDetail} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }
                }}
            >
                {selectedClass && (
                    <>
                        <DialogTitle sx={{ 
                            p: 3, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                            color: 'white'
                        }}>
                            <InfoIcon />
                            <Typography variant="h6" fontWeight="700">Chi Tiết Lớp Học</Typography>
                        </DialogTitle>

                        <DialogContent sx={{ p: 3, bgcolor: '#fcfcfc' }}>
                            <Grid container spacing={2.5}>
                                
                                {/* Card 1: Thông tin chung */}
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #edf2f7' }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <SchoolIcon color="primary" fontSize="small" />
                                            <Typography variant="caption" fontWeight="700" color="textSecondary" sx={{ textTransform: 'uppercase' }}>Học phần</Typography>
                                        </Box>
                                        <Typography variant="h6" fontWeight="800" color="#2d3748">
                                            {selectedClass.subject?.name}
                                        </Typography>
                                        <Typography variant="body2" color="primary" fontWeight="600">
                                            {selectedClass.classCode} • {selectedClass.subject?.subjectCode}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Card 2: Giảng viên & Học kỳ */}
                                <Grid size={{ xs: 8 }}>
                                    <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #edf2f7', height: '100%' }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <PersonIcon color="primary" fontSize="small" />
                                            <Typography variant="caption" fontWeight="700" color="textSecondary" sx={{ textTransform: 'uppercase' }}>Giảng viên</Typography>
                                        </Box>
                                        <Typography variant="body1" fontWeight="700">{selectedClass.lecturer?.fullName || 'Chưa phân công'}</Typography>
                                        <Typography variant="caption" color="textSecondary">{selectedClass.lecturer?.email}</Typography>
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 4 }}>
                                    <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #edf2f7', height: '100%', textAlign: 'center' }}>
                                        <Typography variant="caption" fontWeight="700" color="textSecondary" sx={{ textTransform: 'uppercase' }}>Học kỳ</Typography>
                                        <Typography variant="h5" fontWeight="800" color="primary" sx={{ mt: 1 }}>{selectedClass.semester}</Typography>
                                    </Box>
                                </Grid>

                                {/* Card 3: Lịch học (Phần này quan trọng nhất) */}
                                <Grid size={{ xs: 12 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <AccessTimeFilledIcon color="primary" fontSize="small" />
                                        <Typography variant="subtitle2" fontWeight="700">Lịch học chi tiết</Typography>
                                    </Box>

                                    {selectedClass.timeTables && selectedClass.timeTables.length > 0 ? (
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: 1.5,
                                            width: '100%',
                                        }}>
                                            {selectedClass.timeTables.map((item: any) => (
                                                <Box key={item.id} sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    flex: '1 1 calc(50% - 12px)', 
                                                    minWidth: '200px',
                                                    p: 1.5, 
                                                    bgcolor: '#eff6ff',
                                                    borderRadius: 2,
                                                    borderLeft: '4px solid #3b82f6',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                    boxSizing: 'border-box'
                                                }}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="700">
                                                            {item.dayOfWeek === 8 ? "Chủ Nhật" : `Thứ ${item.dayOfWeek}`}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">Ca {item.slot}</Typography>
                                                    </Box>
                                                    <Chip 
                                                        icon={<LocationOnIcon sx={{ fontSize: '14px !important' }} />}
                                                        label={item.room} 
                                                        size="small" 
                                                        sx={{ bgcolor: '#fff', fontWeight: 'bold', border: '1px solid #e2e8f0' }} 
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', p: 2, textAlign: 'center' }}>
                                            Chưa cập nhật lịch học.
                                        </Typography>
                                    )}
                                </Grid>

                                {/* Card 4: Sĩ số & Thời gian */}
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ p: 2, bgcolor: '#ebf8ff', borderRadius: 2, border: '1px dashed #3182ce' }}>
                                        <Grid container alignItems="center">
                                            <Grid size={{ xs: 6 }}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <GroupsIcon color="primary" />
                                                    <Box>
                                                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>Sĩ số lớp</Typography>
                                                        <Typography variant="body2" fontWeight="700">
                                                            {selectedClass.currentEnrollment} / {selectedClass.maxCapacity} sinh viên
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 6 }} sx={{ borderLeft: '1px solid #bee3f8', pl: 2 }}>
                                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>Thời gian học</Typography>
                                                <Typography variant="caption" fontWeight="700">
                                                    {selectedClass.startDate} → {selectedClass.endDate}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>

                            </Grid>
                        </DialogContent>

                        <DialogActions sx={{ p: 3, bgcolor: '#fcfcfc' }}>
                            <Button 
                                onClick={handleCloseDetail} 
                                variant="outlined" 
                                color="inherit" 
                                sx={{ borderRadius: 2, px: 3, fontWeight: 'bold', textTransform: 'none' }}
                            >
                                Đóng
                            </Button>
                            <Button 
                                variant="contained" 
                                color={selectedClass.isRegistered ? "error" : "primary"}
                                disabled={
                                    !!processingId || 
                                    (!selectedClass.isRegistered && (selectedClass.currentEnrollment ?? 0) >= (selectedClass.maxCapacity ?? 0))
                                }
                                onClick={() => handleAction(selectedClass.id, selectedClass.isRegistered || false)}
                                sx={{ 
                                    borderRadius: 2, 
                                    px: 4, 
                                    fontWeight: 'bold', 
                                    textTransform: 'none',
                                    boxShadow: selectedClass.isRegistered ? '0 4px 12px rgba(211, 47, 47, 0.3)' : '0 4px 12px rgba(25, 118, 210, 0.3)'
                                }}
                            >
                                {processingId === selectedClass.id ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    selectedClass.isRegistered ? "Hủy Đăng Ký" : "Đăng Ký Ngay"
                                )}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </StudentLayout>
    );
};

export default CourseRegistration;