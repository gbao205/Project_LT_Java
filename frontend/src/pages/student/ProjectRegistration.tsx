import React, { useState } from 'react';
import {
    Container, Typography, Box, TextField, Button,
    Divider, Alert, CircularProgress, Paper, FormControl,
    InputLabel, Select, MenuItem, Stack
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import StudentLayout from '../../components/layout/StudentLayout';
import studentService from '../../services/studentService';
import { getMyClasses } from '../../services/classService';
import { useAppSnackbar } from '../../hooks/useAppSnackbar';

const ProjectRegistration = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useAppSnackbar();
    
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [formData, setFormData] = useState({ projectName: '', description: '' });
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = Number(currentUser.id || currentUser.user?.id);

    // 1. Sử dụng useQuery để lấy và lọc danh sách lớp học khả dụng
    const { data: classes = [], isLoading } = useQuery({
        queryKey: ['eligible-classes-for-project', currentUserId],
        queryFn: async () => {
            const joinedClasses = await getMyClasses();
            
            // Xử lý song song các request lấy thông tin team của từng lớp
            const classStatuses = await Promise.all(
                joinedClasses.map(async (cls: any) => {
                    try {
                        const team = await studentService.getMyTeam(cls.id);
                        
                        // Kiểm tra quyền Trưởng nhóm và chưa có đề tài
                        const isLeader = team?.members?.some(
                            (m: any) => 
                                m.role === 'LEADER' && 
                                Number(m.student?.id) === currentUserId
                        );

                        if (team && !team.project && isLeader) {
                            return { ...cls, team };
                        }
                        return null;
                    } catch (err) {
                        return null;
                    }
                })
            );

            return classStatuses.filter(item => item !== null);
        },
        staleTime: 1000, // Dữ liệu "tươi" trong 5 phút
        enabled: !!currentUserId,  // Chỉ chạy khi có user ID
    });

    // 2. Sử dụng useMutation cho hành động đăng ký
    const registrationMutation = useMutation({
        mutationFn: (payload: any) => studentService.registerProject(payload),
        onSuccess: () => {
            showSuccess('Đăng ký đề tài thành công!');
            // Làm mới lại cache danh sách lớp để xóa lớp vừa đăng ký thành công
            queryClient.invalidateQueries({ queryKey: ['eligible-classes-for-project'] });
            
            // Reset form
            setSelectedClassId('');
            setFormData({ projectName: '', description: '' });
        },
        onError: (error: any) => {
            showError(error.response?.data?.message || 'Lỗi đăng ký đề tài');
        }
    });

    const handleClassChange = (classId: string) => {
        setSelectedClassId(classId);
    };

    // Tìm thông tin team từ danh sách đã load trong cache
    const teamInfo = classes.find(c => c.id === Number(selectedClassId))?.team || null;

    const handleRegister = () => {
        if (!selectedClassId) {
            showError('Vui lòng chọn lớp học trước khi đăng ký');
            return;
        }
        if (!formData.projectName.trim()) {
            showError('Vui lòng nhập tên đề tài');
            return;
        }

        registrationMutation.mutate({
            classId: Number(selectedClassId),
            projectName: formData.projectName,
            description: formData.description
        });
    };

    return (
        <StudentLayout title="Đăng Ký Đề Tài">
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ 
                        p: 3, 
                        bgcolor: '#f8f9fa', 
                        borderBottom: '1px solid #e0e0e0', 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 0.5 
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <AssignmentIcon color="primary" sx={{ fontSize: '2rem' }} />
                            <Typography variant="h5" fontWeight="bold">
                                Đăng ký đề tài dự án
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="error" sx={{ fontStyle: 'italic' }}>
                            * Lưu lưu ý: Chức năng chỉ dành cho nhóm trưởng
                        </Typography>
                    </Box>

                    <Box sx={{ p: 4 }}>
                        {isLoading ? (
                            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
                        ) : classes.length === 0 ? (
                            <Box textAlign="center" py={4}>
                                <Alert severity="info">
                                    Hiện tại không có lớp học nào khả dụng để đăng ký đề tài. 
                                    (Điều kiện: Bạn phải là Trưởng nhóm và nhóm chưa có đề tài).
                                </Alert>
                                <Button 
                                    variant="outlined" 
                                    sx={{ mt: 2 }} 
                                    onClick={() => navigate('/home')}
                                >
                                    Quay lại Trang chủ
                                </Button>
                            </Box>
                        ) : (
                            <Stack spacing={4}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Bước 1: Chọn lớp học
                                    </Typography>
                                    <FormControl fullWidth>
                                        <InputLabel>Danh sách lớp</InputLabel>
                                        <Select
                                            value={selectedClassId}
                                            label="Danh sách lớp"
                                            onChange={(e) => handleClassChange(e.target.value)}
                                        >
                                            {classes.map((cls: any) => (
                                                <MenuItem key={cls.id} value={cls.id}>
                                                    {cls.name} ({cls.classCode}) - {cls.team?.teamName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                {selectedClassId && (
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            Bước 2: Nhập thông tin đề tài cho nhóm: {teamInfo?.teamName}
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                        
                                        <Stack spacing={3}>
                                            <TextField
                                                fullWidth
                                                label="Tên đề tài dự kiến"
                                                required
                                                value={formData.projectName}
                                                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                            />
                                            <TextField
                                                fullWidth
                                                label="Mô tả chi tiết đề tài"
                                                multiline
                                                rows={5}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                                <Button 
                                                    variant="contained" 
                                                    onClick={handleRegister}
                                                    disabled={registrationMutation.isPending}
                                                    sx={{ bgcolor: '#ef6c00', '&:hover': { bgcolor: '#e65100' } }}
                                                >
                                                    {registrationMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Gửi yêu cầu đăng ký'}
                                                </Button>
                                            </Box>
                                        </Stack>
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </Box>
                </Paper>
            </Container>
        </StudentLayout>
    );
};

export default ProjectRegistration;