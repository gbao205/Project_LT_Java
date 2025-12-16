import { useEffect, useState } from 'react';
import {
    Grid, Paper, Typography, Box, TextField, Button,
    MenuItem, Tabs, Tab, Alert, Card, CardContent, Divider, Chip
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimelineIcon from '@mui/icons-material/Timeline';
import { AxiosError } from 'axios'; // <--- 1. Import thêm cái này

import { getAllClasses, type ClassRoom } from '../../services/classService';
import studentService, {type Milestone } from '../../services/studentService';
import AdminLayout from '../../components/layout/AdminLayout';

// Định nghĩa kiểu dữ liệu cho Error Response từ Backend
interface ErrorResponse {
    message: string;
}

const StudentWorkspace = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [classes, setClasses] = useState<ClassRoom[]>([]);

    // States cho Form
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [teamName, setTeamName] = useState('');
    const [joinTeamId, setJoinTeamId] = useState('');
    const [projectData, setProjectData] = useState({ name: '', description: '' });
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [msg, setMsg] = useState({ type: '', content: '' });

    // Load danh sách lớp khi vào trang
    useEffect(() => {
        getAllClasses().then(setClasses).catch(console.error);
    }, []);

    // Load Milestone khi chọn lớp (ở Tab Milestone)
    const handleLoadMilestones = async () => {
        if (!selectedClassId) return;
        try {
            const data = await studentService.getClassMilestones(Number(selectedClassId));
            setMilestones(data);
        } catch (error) {
            console.error(error);
            setMilestones([]);
        }
    };

    // Xử lý tạo nhóm
    const handleCreateTeam = async () => {
        try {
            await studentService.createTeam({
                teamName,
                classId: Number(selectedClassId)
            });
            setMsg({ type: 'success', content: 'Tạo nhóm thành công! Bạn là Leader.' });
        } catch (error) {
            // <--- 2. Sửa lỗi any ở đây
            const err = error as AxiosError<ErrorResponse>;
            setMsg({ type: 'error', content: err.response?.data?.message || 'Lỗi tạo nhóm' });
        }
    };

    // Xử lý tham gia nhóm
    const handleJoinTeam = async () => {
        try {
            await studentService.joinTeam(Number(joinTeamId));
            setMsg({ type: 'success', content: 'Tham gia nhóm thành công!' });
        } catch (error) {
            // <--- 3. Sửa lỗi any ở đây
            const err = error as AxiosError<ErrorResponse>;
            setMsg({ type: 'error', content: err.response?.data?.message || 'Lỗi tham gia nhóm' });
        }
    };

    // Xử lý đăng ký đề tài
    const handleRegisterProject = async () => {
        try {
            await studentService.registerProject({
                projectName: projectData.name,
                description: projectData.description,
                existingProjectId: null // Đang demo tạo mới
            });
            setMsg({ type: 'success', content: 'Đăng ký đề tài thành công!' });
        } catch (error) {
            // <--- 4. Sửa lỗi any ở đây
            const err = error as AxiosError<ErrorResponse>;
            setMsg({ type: 'error', content: err.response?.data?.message || 'Lỗi đăng ký đề tài' });
        }
    };

    return (
        <AdminLayout title="Không Gian Sinh Viên">
            {msg.content && (
                <Alert severity={msg.type as any} onClose={() => setMsg({ type: '', content: '' })} sx={{ mb: 2 }}>
                    {msg.content}
                </Alert>
            )}

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} centered>
                    <Tab icon={<GroupAddIcon />} label="Quản Lý Nhóm" />
                    <Tab icon={<AssignmentIcon />} label="Đăng Ký Đề Tài" />
                    <Tab icon={<TimelineIcon />} label="Tiến Độ & Milestone" />
                </Tabs>
            </Paper>

            {/* TAB 1: QUẢN LÝ NHÓM */}
            {tabIndex === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom color="primary">Tạo Nhóm Mới</Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <TextField
                                    select label="Chọn Lớp Học" fullWidth
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                >
                                    {classes.map((cls) => (
                                        <MenuItem key={cls.id} value={cls.id}>
                                            {cls.name} ({cls.subject?.subjectCode})
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Tên Nhóm" fullWidth
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                />
                                <Button variant="contained" onClick={handleCreateTeam} disabled={!selectedClassId || !teamName}>
                                    Tạo Nhóm
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom color="secondary">Tham Gia Nhóm (Bằng ID)</Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <TextField
                                    label="Nhập ID Nhóm" fullWidth
                                    value={joinTeamId}
                                    onChange={(e) => setJoinTeamId(e.target.value)}
                                />
                                <Button variant="outlined" color="secondary" onClick={handleJoinTeam} disabled={!joinTeamId}>
                                    Gửi Yêu Cầu
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* TAB 2: ĐĂNG KÝ ĐỀ TÀI */}
            {tabIndex === 1 && (
                <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
                    <Typography variant="h6" gutterBottom>Đề Xuất Đề Tài Mới</Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        *Chức năng dành riêng cho Nhóm Trưởng (Leader)
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Tên Đề Tài" fullWidth
                            value={projectData.name}
                            onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                        />
                        <TextField
                            label="Mô Tả Chi Tiết" fullWidth multiline rows={4}
                            value={projectData.description}
                            onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                        />
                        <Button variant="contained" color="success" onClick={handleRegisterProject}>
                            Đăng Ký Đề Tài
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* TAB 3: MILESTONES */}
            {tabIndex === 2 && (
                <Box>
                    <Box display="flex" gap={2} mb={3} alignItems="center">
                        <TextField
                            select label="Chọn Lớp Để Xem"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            sx={{ minWidth: 250 }}
                            size="small"
                        >
                            {classes.map((cls) => (
                                <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                            ))}
                        </TextField>
                        <Button variant="contained" onClick={handleLoadMilestones}>Xem</Button>
                    </Box>

                    <Grid container spacing={2}>
                        {milestones.length === 0 && <Typography p={2}>Chưa có dữ liệu hoặc chưa chọn lớp.</Typography>}
                        {milestones.map((ms) => (
                            <Grid item xs={12} key={ms.id}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="h6" color="primary">{ms.title}</Typography>
                                            <Chip label={`Hạn nộp: ${new Date(ms.dueDate).toLocaleDateString()}`} color="error" variant="outlined" />
                                        </Box>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="body2">{ms.description}</Typography>
                                        <Typography variant="caption" color="text.secondary" mt={1} display="block">
                                            Bắt đầu: {new Date(ms.startDate).toLocaleDateString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </AdminLayout>
    );
};

export default StudentWorkspace;