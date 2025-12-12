import { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardActionArea, Button, Chip, Avatar, IconButton, Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupsIcon from '@mui/icons-material/Groups';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        } else {
            navigate('/login');
        }

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    // Cấu hình màu sắc theo Role
    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN': return { label: 'Quản Trị Viên', color: '#d32f2f' };
            case 'HEAD_DEPARTMENT': return { label: 'Trưởng Bộ Môn', color: '#ed6c02' };
            case 'LECTURER': return { label: 'Giảng Viên', color: '#0288d1' };
            case 'STUDENT': return { label: 'Sinh Viên', color: '#2e7d32' };
            case 'STAFF': return { label: 'Giáo Vụ', color: '#9c27b0' };
            default: return { label: 'Người dùng', color: '#757575' };
        }
    };

    const roleInfo = getRoleLabel(user.role);

    // Component Stat Card
    const StatCard = ({ title, value, icon, color }: any) => (
        <Paper elevation={0} sx={{
            p: 2, display: 'flex', alignItems: 'center', gap: 2,
            borderRadius: 3, border: '1px solid #e0e0e0', height: '100%'
        }}>
            <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: `${color}15`, color: color }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="h5" fontWeight="bold" color="text.primary">{value}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{title}</Typography>
            </Box>
        </Paper>
    );

    // Component Action Card
    const ActionCard = ({ title, desc, icon, onClick, color }: any) => (
        <Card elevation={0} sx={{
            height: '100%',
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                borderColor: color
            }
        }}>
            <CardActionArea onClick={onClick} sx={{ height: '100%', p: 3 }}>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                    <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 72, height: 72, mb: 2 }}>
                        {icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {desc}
                    </Typography>
                </Box>
            </CardActionArea>
        </Card>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', pb: 8 }}>

            {/* 1. HERO SECTION */}
            <Box sx={{
                background: 'linear-gradient(120deg, #1565c0 0%, #0d47a1 100%)',
                color: 'white',
                pt: 4, pb: 12, px: { xs: 2, md: 6 },
                mb: -8,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <Container maxWidth={false}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box display="flex" alignItems="center" gap={3}>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: '#1565c0', fontWeight: 'bold', fontSize: 32, boxShadow: 3 }}>
                                {user.fullName ? user.fullName.charAt(0) : 'U'}
                            </Avatar>
                            <Box>
                                <Typography variant="h3" fontWeight="800" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                                    Xin chào, {user.fullName}!
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1.5} mt={1} flexWrap="wrap">
                                    <Chip
                                        label={roleInfo.label}
                                        sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.5)' }}
                                    />
                                    <Typography variant="body1" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <AccessTimeIcon fontSize="small" />
                                        {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Box display="flex" gap={2}>
                            <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                                <NotificationsIcon />
                            </IconButton>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<LogoutIcon />}
                                onClick={handleLogout}
                                sx={{ bgcolor: '#ff5252', fontWeight: 'bold', boxShadow: 2 }}
                            >
                                Đăng xuất
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* 2. BODY CONTENT */}
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 6 } }}>

                {/* Stats Section */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {/* Chia cột: Điện thoại (12), Tablet (6), Laptop (3), Màn hình rộng (3) */}
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                        <StatCard title="Dự án tham gia" value="3" icon={<AssignmentIcon fontSize="large" />} color="#1976d2" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                        <StatCard title="Deadline tuần này" value="2" icon={<AccessTimeIcon fontSize="large" />} color="#ed6c02" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                        <StatCard title="Thành viên nhóm" value="12" icon={<GroupsIcon fontSize="large" />} color="#2e7d32" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                        <StatCard title="Tiến độ tổng thể" value="85%" icon={<TrendingUpIcon fontSize="large" />} color="#9c27b0" />
                    </Grid>
                </Grid>

                {/* Main Menu Section */}
                <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary" sx={{ borderLeft: '5px solid #1976d2', pl: 2 }}>
                    Chức năng hệ thống
                </Typography>

                <Grid container spacing={4}>

                    {/* --- NHÓM ADMIN/STAFF/TRƯỞNG BỘ MÔN --- */}
                    {['ADMIN', 'STAFF', 'HEAD_DEPARTMENT'].includes(user.role) && (
                        <>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <ActionCard
                                    title="Quản Lý Môn Học"
                                    desc="Cấu hình môn học & Syllabus."
                                    icon={<AdminPanelSettingsIcon fontSize="large" />}
                                    color="#d32f2f"
                                    onClick={() => navigate('/admin/subjects')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <ActionCard
                                    title="Quản Lý Người Dùng"
                                    desc="Phân quyền & Tài khoản."
                                    icon={<SupervisorAccountIcon fontSize="large" />}
                                    color="#d32f2f"
                                    onClick={() => navigate('/admin/users')}
                                />
                            </Grid>
                        </>
                    )}

                    {/* --- NHÓM GIẢNG VIÊN --- */}
                    {user.role === 'LECTURER' && (
                        <>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <ActionCard
                                    title="Lớp Học Phụ Trách"
                                    desc="Quản lý sinh viên & Nhóm."
                                    icon={<SchoolIcon fontSize="large" />}
                                    color="#0288d1"
                                    onClick={() => alert("Chức năng đang phát triển")}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <ActionCard
                                    title="Quản Lý Đề Tài"
                                    desc="Tạo & Duyệt đề tài."
                                    icon={<AssignmentIcon fontSize="large" />}
                                    color="#0288d1"
                                    onClick={() => alert("Chức năng đang phát triển")}
                                />
                            </Grid>
                        </>
                    )}

                    {/* --- NHÓM SINH VIÊN --- */}
                    {user.role === 'STUDENT' && (
                        <>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <ActionCard
                                    title="Lớp Học Của Tôi"
                                    desc="Môn học & Tài liệu."
                                    icon={<SchoolIcon fontSize="large" />}
                                    color="#2e7d32"
                                    onClick={() => alert("Chức năng đang phát triển")}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <ActionCard
                                    title="Workspace Nhóm"
                                    desc="Làm việc & Nộp bài."
                                    icon={<GroupsIcon fontSize="large" />}
                                    color="#2e7d32"
                                    onClick={() => alert("Chức năng đang phát triển")}
                                />
                            </Grid>
                        </>
                    )}

                    {/* --- CHỨC NĂNG CHUNG --- */}
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <ActionCard
                            title="Hồ Sơ Cá Nhân"
                            desc="Thông tin & Bảo mật."
                            icon={<PersonIcon fontSize="large" />}
                            color="#757575"
                            onClick={() => alert("Chức năng đang phát triển")}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <ActionCard
                            title="Đổi Mật Khẩu"
                            desc="Bảo mật tài khoản của bạn."
                            icon={<VpnKeyIcon fontSize="large" />}
                            color="#757575"
                            onClick={() => navigate('/change-password')}
                        />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Home;